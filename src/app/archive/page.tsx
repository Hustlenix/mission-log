import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import { Post } from "@/models/Post";

export const dynamic = "force-dynamic";

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
      query.$or = [
        { title: { $regex: searchParams.q, $options: "i" } },
        { excerpt: { $regex: searchParams.q, $options: "i" } },
        { content: { $regex: searchParams.q, $options: "i" } },
        { project: { $regex: searchParams.q, $options: "i" } },
        { tags: { $regex: searchParams.q, $options: "i" } },
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
    return [];
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
      <h1 className="font-mono text-xs text-muted tracking-widest mb-8">ARCHIVE</h1>

      <form method="GET" className="mb-8">
        <input
          type="search"
          name="q"
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

      {posts.length === 0 ? (
        <p className="text-muted font-mono text-sm">No logs found.</p>
      ) : (
        <div className="divide-y divide-border">
          {posts.map((post, i) => (
            <Link
              key={post._id.toString()}
              href={`/blogs/${post.slug}`}
              className="group flex items-baseline gap-4 py-5 hover:bg-surface/50 transition-colors"
            >
              <span className="font-mono text-xs text-muted w-8 shrink-0">
                {String(i + 1).padStart(3, "0")}
              </span>
              <div className="flex-1">
                <h2 className="font-medium group-hover:text-accent transition-colors">
                  {post.title}
                </h2>
                <div className="flex flex-wrap gap-2 mt-1">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/archive?tag=${tag}`}
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
