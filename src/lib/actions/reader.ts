"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "../session";
import { countEvent } from "../metrics";
import { withinLimit } from "../rate-limit";
import { getArticle } from "../publication";
import { topics } from "../catalog";
import { getAsteroidById } from "../nasa/neo";
import { getNasaMedia } from "../nasa/media";
import {
  Bookmark,
  Follow,
  ReaderCollection,
  CollectionItem,
  ReaderProfile,
  ReadingHistory,
} from "@/models/Reader";
async function itemReference(type: string, id: string) {
  if (typeof id !== "string" || id.length > 150) return null;
  if (type === "article") {
    const p = await getArticle(id);
    return p ? { title: p.title, href: `/articles/${p.slug}` } : null;
  }
  if (type === "topic") {
    const t = topics.find((t) => t.slug === id);
    return t ? { title: t.name, href: `/topics/${id}` } : null;
  }
  if (type === "asteroid" && /^\d{1,12}$/.test(id)) {
    const o = (await getAsteroidById(id)).data;
    return o ? { title: o.name, href: `/live/asteroids/${id}` } : null;
  }
  if (type === "media" && /^[a-z0-9_.-]{1,150}$/i.test(id)) {
    const m = (await getNasaMedia(id)).data?.[0];
    return m
      ? { title: m.title, href: `/media/${encodeURIComponent(id)}` }
      : null;
  }
  return null;
}
export async function toggleItem(
  kind: "save" | "follow",
  type: string,
  id: string,
) {
  const session = await getSession();
  if (!session) return { error: "Sign in to keep this in your Mission Log." };
  if (
    !["save", "follow"].includes(kind) ||
    !(await withinLimit(session.user.id, "reader", 30))
  )
    return { error: "Please wait a minute before trying again." };
  if (kind === "follow" && !["topic", "asteroid"].includes(type))
    return { error: "This item cannot be followed." };
  const reference = await itemReference(type, id);
  if (!reference)
    return { error: "The source record is unavailable. Please try later." };
  const filter = { userId: session.user.id, type, itemId: id };
  if (kind === "follow") {
    const existing = await Follow.findOne(filter);
    if (existing) await Follow.deleteOne(filter);
    else
      await Follow.updateOne(
        filter,
        { $setOnInsert: { ...filter, ...reference } },
        { upsert: true },
      );
    revalidatePath("/account");
    if (!existing) await countEvent("follow");
    return { active: !existing };
  }
  const existing = await Bookmark.findOne(filter);
  if (existing) {
    await Bookmark.deleteOne(filter);
    await CollectionItem.deleteMany({
      userId: session.user.id,
      bookmarkId: existing._id.toString(),
    });
  } else {
    await Bookmark.updateOne(
      filter,
      { $setOnInsert: { ...filter, ...reference } },
      { upsert: true },
    );
  }
  revalidatePath("/account");
  if (!existing) await countEvent("save");
  return { active: !existing };
}
export async function createCollection(form: FormData) {
  const session = await getSession();
  if (!session) redirect("/signin?returnTo=/account");
  const name = String(form.get("name") || "").trim();
  const visibility =
    form.get("visibility") === "public"
      ? "public"
      : form.get("visibility") === "unlisted"
        ? "unlisted"
        : "private";
  if (
    !name ||
    name.length > 100 ||
    !["private", "unlisted", "public"].includes(visibility) ||
    !(await withinLimit(session.user.id, "collection", 10))
  )
    return;
  const c = await ReaderCollection.create({
    userId: session.user.id,
    slug: randomUUID(),
    name,
    visibility,
  });
  redirect(`/collections/${c.slug}`);
}
export async function addToCollection(form: FormData) {
  const session = await getSession();
  if (!session) return;
  const collectionId = String(form.get("collectionId"));
  const bookmarkId = String(form.get("bookmarkId"));
  if (
    !/^[a-f0-9]{24}$/i.test(collectionId) ||
    !/^[a-f0-9]{24}$/i.test(bookmarkId) ||
    !(await withinLimit(session.user.id, "collection-item"))
  )
    return;
  const [c, b] = await Promise.all([
    ReaderCollection.findOne({ _id: collectionId, userId: session.user.id }),
    Bookmark.findOne({ _id: bookmarkId, userId: session.user.id }),
  ]);
  if (!c || !b) return;
  await CollectionItem.updateOne(
    { collectionId, bookmarkId },
    { $setOnInsert: { userId: session.user.id, collectionId, bookmarkId } },
    { upsert: true },
  );
  revalidatePath(`/collections/${c.slug}`);
}
export async function removeCollectionItem(form: FormData) {
  const session = await getSession();
  if (!session) return;
  const id = String(form.get("id"));
  if (!/^[a-f0-9]{24}$/i.test(id)) return;
  await CollectionItem.deleteOne({ _id: id, userId: session.user.id });
  revalidatePath("/collections", "layout");
}
export async function historyPreference(form: FormData) {
  const session = await getSession();
  if (!session) return;
  const enabled = form.get("enabled") === "true";
  await ReaderProfile.updateOne(
    { userId: session.user.id },
    { $set: { recordHistory: enabled } },
    { upsert: true },
  );
  revalidatePath("/account");
}
export async function clearHistory() {
  const session = await getSession();
  if (!session) return;
  await ReadingHistory.deleteMany({ userId: session.user.id });
  revalidatePath("/account");
}
export async function recordReading(slug: string, progress: number) {
  const session = await getSession();
  if (
    !session ||
    typeof slug !== "string" ||
    slug.length > 200 ||
    !Number.isFinite(progress)
  )
    return;
  const profile = await ReaderProfile.findOne({ userId: session.user.id });
  if (
    !profile?.recordHistory ||
    !(await withinLimit(session.user.id, "history", 12))
  )
    return;
  const p = await getArticle(slug);
  if (!p) return;
  const value = Math.round(Math.max(0, Math.min(100, progress)));
  await ReadingHistory.updateOne(
    { userId: session.user.id, slug },
    {
      $max: { progress: value },
      $set: {
        title: p.title,
        lastReadAt: new Date(),
        ...(value >= 90 ? { completed: true } : {}),
      },
    },
    { upsert: true },
  );
}
