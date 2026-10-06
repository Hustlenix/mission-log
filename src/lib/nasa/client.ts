import "server-only";
import { createHash } from "node:crypto";
import { connectToDatabase } from "../db";
import { NasaCache } from "@/models/NasaCache";
import { withinLimit } from "../rate-limit";
import type { Feed } from "./types";
const pending = new Map<string, Promise<Feed<unknown>>>();
export async function nasaJson(path: string, withKey = true): Promise<unknown> {
  const url = new URL(path);
  if (
    ![
      "api.nasa.gov",
      "science.nasa.gov",
      "images-api.nasa.gov",
      "epic.gsfc.nasa.gov",
    ].includes(url.hostname)
  )
    throw new Error("Invalid NASA host");
  if (withKey) {
    if (!process.env.NASA_API_KEY)
      throw new Error("NASA configuration missing");
    url.searchParams.set("api_key", process.env.NASA_API_KEY);
  }
  // Fleet-wide upstream budget, applied only on cache refresh, not per visitor.
  // Each load retries at most once. Keep headroom for other uses of the API key.
  if (
    !(await withinLimit(
      "shared-nasa",
      withKey ? "keyed-hour" : "public-hour",
      withKey ? 400 : 1000,
      3600,
    ))
  )
    throw new Error("NASA refresh budget exhausted");
  for (let attempt = 0; attempt < 2; attempt++) {
    const r = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(7500),
    });
    if (r.ok) return r.json();
    if (attempt === 0 && r.status >= 500) continue;
    throw new Error(`NASA HTTP ${r.status}`);
  }
  throw new Error("NASA unavailable");
}
export async function cachedNasa<T>(
  key: string,
  source: string,
  seconds: number,
  load: () => Promise<T>,
): Promise<Feed<T>> {
  const cacheKey = createHash("sha256").update(`v1:${key}`).digest("hex");
  if (pending.has(cacheKey)) return pending.get(cacheKey)! as Promise<Feed<T>>;
  const job = (async (): Promise<Feed<T>> => {
    const empty: Feed<T> = {
      data: null,
      fetchedAt: null,
      stale: false,
      source,
    };
    try {
      await connectToDatabase();
    } catch {
      return empty;
    }
    const now = new Date();
    const previous = await NasaCache.findOne({ key: cacheKey }).lean();
    const old = previous?.data
      ? {
          data: previous.data as T,
          fetchedAt: previous.fetchedAt?.toISOString() || null,
          stale: !(previous.expiresAt > now),
          source,
        }
      : empty;
    if (previous?.data && previous.expiresAt > now) return old;
    if (previous?.retryAt > now) return old;
    await NasaCache.updateOne(
      { key: cacheKey },
      {
        $setOnInsert: {
          key: cacheKey,
          lockUntil: new Date(0),
          source,
          sourceVersion: "1",
        },
      },
      { upsert: true },
    );
    // Database lease prevents a cold Vercel fleet refreshing the same feed simultaneously.
    const lease = await NasaCache.findOneAndUpdate(
      { key: cacheKey, lockUntil: { $lte: now } },
      { $set: { lockUntil: new Date(+now + 60000) } },
      { returnDocument: "after" },
    );
    if (!lease) return old;
    try {
      const data = await load();
      const fetchedAt = new Date();
      await NasaCache.updateOne(
        { key: cacheKey },
        {
          $set: {
            data,
            fetchedAt,
            expiresAt: new Date(+fetchedAt + seconds * 1000),
            lockUntil: new Date(0),
            retryAt: new Date(0),
            source,
            sourceVersion: "1",
          },
        },
      );
      return { data, fetchedAt: fetchedAt.toISOString(), stale: false, source };
    } catch {
      await NasaCache.updateOne(
        { key: cacheKey },
        {
          $set: {
            lockUntil: new Date(0),
            retryAt: new Date(Date.now() + 300000),
          },
        },
      );
      console.warn("NASA feed unavailable", { feed: key.split(":")[0] });
      return old;
    }
  })().catch(() => ({ data: null, fetchedAt: null, stale: false, source }));
  pending.set(cacheKey, job);
  try {
    return await job;
  } finally {
    pending.delete(cacheKey);
  }
}
