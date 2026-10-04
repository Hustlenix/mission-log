import Link from "next/link";
import { requireAuthor } from "@/lib/author";
import { connectToDatabase } from "@/lib/db";
import { Post } from "@/models/Post";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  await requireAuthor();

  let posts: Awaited<ReturnType<typeof Post.find>> = [];
  try {
    await connectToDatabase();
    posts = await Post.find().sort({ updatedAt: -1 }).lean() as unknown as typeof posts;
  } catch {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="bg-surface border border-border p-8 mx-auto max-w-3xl">
          <h1 className="font-display text-3xl font-bold mb-4">Cannot load your logs</h1>
          <p className="text-muted">MongoDB is not reachable right now. Try again in a moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap justify-between gap-5 items-center mb-8">
        <div>
          <p className="font-mono text-xs text-accent tracking-widest mb-3">AUTHOR LAUNCHPAD</p>
          <h1 className="font-display text-4xl font-bold">Your transmissions.</h1>
        </div>
        <Link href="/post" className="bg-accent text-background font-mono text-sm font-semibold px-6 py-3 hover:bg-accent-dim transition-colors">
          NEW LOG ↗
        </Link>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        {posts.map((post) => (
          <article key={post._id.toString()} className="border border-border bg-surface p-6">
            <p className="font-mono text-xs text-accent tracking-widest mb-3">
              {post.status.toUpperCase()} · {post.project.toUpperCase()}
            </p>
            <h2 className="font-display text-2xl font-bold mb-3">{post.title}</h2>
            <p className="text-muted mb-6">{post.excerpt}</p>
            <div className="flex gap-5">
              <Link href={`/post/${post._id}/edit`} className="font-mono text-xs text-accent hover:text-accent-dim transition-colors">
                EDIT LOG ↗
              </Link>
              {post.status === "published" && (
                <Link href={`/blogs/${post.slug}`} className="font-mono text-xs text-muted hover:text-foreground transition-colors">
                  READ ↗
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
      {!posts.length && (
        <div className="border border-border bg-surface p-8">
          <p className="text-muted">No drafts or published logs yet. Start your first transmission!</p>
        </div>
      )}
    </div>
  );
}
