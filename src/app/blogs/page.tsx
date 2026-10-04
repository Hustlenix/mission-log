import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import { Post } from "@/models/Post";

export const dynamic = "force-dynamic";

async function getPosts() {
  try {
    await connectToDatabase();
    return await Post.find({ status: "published" }).sort({ publishedAt: -1 }).lean();
  } catch {
    return null;
  }
}

export default async function BlogsPage() {
  const posts = await getPosts();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <p className="eyebrow text-accent mb-3">The field journal</p>
      <h1 className="font-display text-5xl font-bold mb-8">All transmissions.</h1>
      {!posts ? <p role="status" className="mission-card">The journal connection is temporarily unavailable. Please try again shortly.</p> : posts.length === 0 ? (
        <div className="mission-card"><h2 className="font-display text-2xl font-bold">Ready for the first adventure.</h2><p className="text-muted my-4">No logs published yet. The author can write and publish from mission control.</p><Link href="/dashboard" className="text-accent font-bold">Open mission control ↗</Link></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {posts.map((post, i) => (
            <Link
              key={post._id.toString()}
              href={`/blogs/${post.slug}`}
              className="mission-card group flex flex-wrap items-baseline gap-4 hover:border-accent transition-colors"
            >
              <span className="font-mono text-xs text-muted w-8 shrink-0">
                {String(i + 1).padStart(3, "0")}
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-lg group-hover:text-accent transition-colors mb-1">
                  {post.title}
                </h2>
                <p className="font-mono text-xs text-muted">{post.project}</p>
                <p className="text-muted mt-3 leading-relaxed">{post.excerpt}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-xs text-muted">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()
                    : ""}
                </p>
                <p className="font-mono text-xs text-muted">
                  {Math.max(1, Math.round(post.content.split(/\s+/).length / 200))} MIN
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
