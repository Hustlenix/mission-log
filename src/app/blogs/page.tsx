import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import { Post } from "@/models/Post";

export const dynamic = "force-dynamic";

async function getPosts() {
  try {
    await connectToDatabase();
    return await Post.find({ status: "published" }).sort({ publishedAt: -1 }).lean();
  } catch {
    return [];
  }
}

export default async function BlogsPage() {
  const posts = await getPosts();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <h1 className="font-mono text-xs text-muted tracking-widest mb-8">ALL LOGS</h1>
      {posts.length === 0 ? (
        <p className="text-muted font-mono text-sm">No logs published yet.</p>
      ) : (
        <div className="divide-y divide-border">
          {posts.map((post, i) => (
            <Link
              key={post._id.toString()}
              href={`/blogs/${post.slug}`}
              className="group flex items-baseline gap-4 py-6 hover:bg-surface/50 transition-colors"
            >
              <span className="font-mono text-xs text-muted w-8 shrink-0">
                {String(i + 1).padStart(3, "0")}
              </span>
              <div className="flex-1">
                <h2 className="font-bold text-lg group-hover:text-accent transition-colors mb-1">
                  {post.title}
                </h2>
                <p className="font-mono text-xs text-muted">{post.project}</p>
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
