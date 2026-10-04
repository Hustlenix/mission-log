import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import { Post } from "@/models/Post";

export const dynamic = "force-dynamic";

async function getMissions() {
  try {
    await connectToDatabase();
    const posts = await Post.find({ status: "published" }).lean();
    const missionMap = new Map<string, { name: string; count: number; tags: Set<string> }>();
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
    return [];
  }
}

export default async function MissionsPage() {
  const missions = await getMissions();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <h1 className="font-mono text-xs text-muted tracking-widest mb-8">CURRENT MISSIONS</h1>
      {missions.length === 0 ? (
        <p className="text-muted font-mono text-sm">No missions yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {missions.map((m) => (
            <Link
              key={m.name}
              href={`/missions/${m.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="group border border-border bg-surface p-6 hover:border-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="font-bold text-xl group-hover:text-accent transition-colors">{m.name}</h2>
                <span className="font-mono text-xs px-2 py-1 text-success">ACTIVE</span>
              </div>
              <p className="text-muted text-sm mb-4">{m.count} LOGS</p>
              <p className="font-mono text-xs text-muted">{m.tags.join(" · ")}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
