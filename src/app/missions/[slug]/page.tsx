import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { connectToDatabase } from "@/lib/db";
import { Post } from "@/models/Post";

export const dynamic = "force-dynamic";

async function getMission(slug: string) {
  try {
    await connectToDatabase();
    const projects = await Post.distinct("project", { status: "published" });
    const name = projects.find(project => project.toLowerCase().replace(/\s+/g, "-") === slug);
    if (!name) return null;
    const posts = await Post.find({ project: name, status: "published" })
      .sort({ publishedAt: -1 })
      .lean();
    if (posts.length === 0) return null;
    return {
      name: posts[0].project,
      posts,
      tags: [...new Set(posts.flatMap((p) => p.tags))],
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const mission = await getMission(slug);
  if (!mission) return { title: "Mission not found" };
  return {
    title: mission.name,
    description: `${mission.posts.length} mission log${mission.posts.length === 1 ? "" : "s"} in the ${mission.name} project.`,
  };
}

export default async function MissionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mission = await getMission(slug);

  if (!mission) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <p className="font-mono text-xs text-accent tracking-widest mb-4">
        MISSION / {mission.name.toUpperCase()}
      </p>
      <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">{mission.name}</h1>

      <div className="border border-border bg-surface p-6 mb-12">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="font-mono text-xs text-muted mb-1">STATUS</p>
            <p className="font-mono text-sm font-semibold text-success">DOCUMENTED</p>
          </div>
          <div>
            <p className="font-mono text-xs text-muted mb-1">LOGS</p>
            <p className="font-mono text-sm">{mission.posts.length}</p>
          </div>
          <div>
            <p className="font-mono text-xs text-muted mb-1">TAGS</p>
            <p className="font-mono text-sm">{mission.tags.join(" · ")}</p>
          </div>
        </div>
      </div>

      <h2 className="font-mono text-xs text-muted tracking-widest mb-6">LATEST TRANSMISSIONS</h2>
      <div className="divide-y divide-border">
        {mission.posts.map((post) => (
          <Link
            key={post._id.toString()}
            href={`/blogs/${post.slug}`}
            className="group flex items-baseline gap-4 py-4 hover:bg-surface/50 transition-colors"
          >
            <span className="font-medium group-hover:text-accent transition-colors">
              {post.title}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-border">
        <Link href="/missions" className="font-mono text-xs text-muted hover:text-accent transition-colors">
          &larr; ALL MISSIONS
        </Link>
      </div>
    </div>
  );
}
