import Link from "next/link";
import type { Metadata } from "next";
import { connectToDatabase } from "@/lib/db";
import { Post } from "@/models/Post";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Archive",
  description: "Search every mission log by title, keyword, tag or project.",
};

interface SearchParams {
  q?: string;
  tag?: string;
  project?: string;
}

async function getPosts(searchParams: SearchParams) {
  try {
    await connectToDatabase();
    const query: Record<string, unknown> = { status: "published" };

    if (searchParams.q) {
      const term = searchParams.q.slice(0, 200).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { title: { $regex: term, $options: "i" } },
        { excerpt: { $regex: term, $options: "i" } },
        { content: { $regex: term, $options: "i" } },
        { project: { $regex: term, $options: "i" } },
        { tags: { $regex: term, $options: "i" } },
      ];
    }
    if (searchParams.tag) {
      query.tags = searchParams.tag;
    }
    if (searchParams.project) {
      query.project = searchParams.project;
    }

    return await Post.find(query).sort({ publishedAt: -1 }).lean();
  } catch {
    return null;
  }
}

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const posts = await getPosts(params);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <p className="eyebrow text-accent mb-3">Find your next rabbit hole</p><h1 className="font-display text-5xl font-bold mb-8">The archive.</h1>

      <form method="GET" className="mb-8">
        <input
          type="search"
          name="q"
          aria-label="Search mission logs"
          defaultValue={params.q || ""}
          placeholder="Search logs..."
          className="w-full bg-surface border border-border px-4 py-3 text-foreground font-mono text-sm focus:outline-none focus:border-accent transition-colors"
        />
      </form>

      {params.tag && (
        <div className="mb-6">
          <span className="font-mono text-xs text-muted">
            Filtered by: <span className="text-accent">#{params.tag}</span>
          </span>
          <Link href="/archive" className="font-mono text-xs text-muted hover:text-accent ml-4">
            Clear
          </Link>
        </div>
      )}

      {!posts ? <p role="status" className="mission-card">Search is temporarily unavailable. Please try again shortly.</p> : posts.length === 0 ? (
        <p className="text-muted font-mono text-sm">No logs found.</p>
      ) : (
        <div className="divide-y divide-border">
          {posts.map((post, i) => (
            <article
              key={post._id.toString()}
              className="group flex flex-wrap items-baseline gap-4 py-5 hover:bg-surface/50 transition-colors"
            >
              <span className="font-mono text-xs text-muted w-8 shrink-0">
                {String(i + 1).padStart(3, "0")}
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="font-medium group-hover:text-accent transition-colors">
                  <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
                </h2>
                <div className="flex flex-wrap gap-2 mt-1">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/archive?tag=${encodeURIComponent(tag)}`}
                      className="font-mono text-xs text-muted hover:text-accent transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
              <span className="font-mono text-xs text-muted shrink-0">
                {post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()
                  : ""}
              </span>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
