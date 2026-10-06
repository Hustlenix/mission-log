import Link from "next/link";
import type { Metadata } from "next";
import { connectToDatabase } from "@/lib/db";
import { Post } from "@/models/Post";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The missions",
  description:
    "What is being built: every project currently documented in the Mission Log, with its logs and tags.",
};

async function getMissions() {
  try {
    await connectToDatabase();
    const posts = await Post.find({
      status: "published",
      slug: { $not: /^temp-seed-log-/ },
      $or: [
        { contentType: "mission-log" },
        { contentType: { $exists: false } },
      ],
    }).lean();
    const missionMap = new Map<
      string,
      { name: string; count: number; tags: Set<string> }
    >();
    for (const post of posts) {
      const existing = missionMap.get(post.project);
      if (existing) {
        existing.count++;
        post.tags.forEach((t) => existing.tags.add(t));
      } else {
        missionMap.set(post.project, {
          name: post.project,
          count: 1,
          tags: new Set(post.tags),
        });
      }
    }
    return Array.from(missionMap.values()).map((m) => ({
      ...m,
      tags: Array.from(m.tags),
    }));
  } catch {
    return null;
  }
}

export default async function MissionsPage() {
  const missions = await getMissions();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <p className="eyebrow text-accent mb-3">Ideas in orbit</p>
      <h1 className="font-display text-5xl font-bold mb-8">The missions.</h1>
      {!missions ? (
        <p role="status" className="mission-card">
          Mission data is temporarily unavailable. Please try again shortly.
        </p>
      ) : missions.length === 0 ? (
        <p className="text-muted font-mono text-sm">No missions yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {missions.map((m) => (
            <Link
              key={m.name}
              href={`/missions/${m.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="mission-card group hover:border-accent transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="font-bold text-xl group-hover:text-accent transition-colors">
                  {m.name}
                </h2>
                <span className="font-mono text-xs px-2 py-1 text-success">
                  LOGGED
                </span>
              </div>
              <p className="text-muted text-sm mb-4">{m.count} LOGS</p>
              <p className="font-mono text-xs text-muted">
                {m.tags.join(" · ")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
