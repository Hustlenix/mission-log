import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { connectToDatabase } from "@/lib/db";
import { Post } from "@/models/Post";
import { getNeoData } from "@/lib/nasa";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  if (slug.startsWith("temp-seed-log-")) return null;
  try {
    await connectToDatabase();
    return await Post.findOne({ slug, status: "published" }).lean();
  } catch {
    return null;
  }
}

async function getNeighbors(publishedAt: Date | undefined) {
  if (!publishedAt) return { prev: null, next: null };
  try {
    await connectToDatabase();
    const [prev, next] = await Promise.all([
      Post.findOne({
        status: "published",
        slug: { $not: /^temp-seed-log-/ },
        publishedAt: { $lt: publishedAt },
      })
        .sort({ publishedAt: -1 })
        .select("slug title")
        .lean(),
      Post.findOne({
        status: "published",
        slug: { $not: /^temp-seed-log-/ },
        publishedAt: { $gt: publishedAt },
      })
        .sort({ publishedAt: 1 })
        .select("slug title")
        .lean(),
    ]);
    return { prev, next };
  } catch {
    return { prev: null, next: null };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const neoData = await getNeoData(
    post.publishedAt?.toISOString().slice(0, 10),
  );
  const { prev, next } = await getNeighbors(post.publishedAt);
  const readTime = Math.max(
    1,
    Math.round(post.content.split(/\s+/).length / 200),
  );

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <header className="mb-12">
        <p className="font-mono text-xs text-accent tracking-widest mb-4">
          {post.project.toUpperCase()}
        </p>
        <h1 className="font-display text-4xl sm:text-6xl font-black tracking-tight mb-6">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-muted">
          <span>
            {post.publishedAt
              ? new Date(post.publishedAt)
                  .toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                  .toUpperCase()
              : ""}
          </span>
          <span>{readTime} MIN READ</span>
        </div>
      </header>

      <div className="prose-mission">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </div>

      <footer className="mt-16 pt-8 border-t border-border">
        <div className="flex flex-wrap gap-2 mb-8">
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

        {neoData && (
          <div className="border border-border bg-surface p-6 mb-8">
            <p className="font-mono text-xs text-accent tracking-widest mb-4">
              THE SKY WHEN THIS WAS WRITTEN
            </p>
            <p className="font-mono text-xs text-muted mb-4">
              {post.publishedAt
                ? new Date(post.publishedAt)
                    .toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                    .toUpperCase()
                : ""}
            </p>
            <p className="font-mono text-xs text-muted mb-4">
              NEAR-EARTH ACTIVITY
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <p className="font-mono text-xs text-muted">OBJECTS TRACKED</p>
                <p className="font-mono text-sm">{neoData.objectsTracked}</p>
              </div>
              <div>
                <p className="font-mono text-xs text-muted">CLOSEST APPROACH</p>
                <p className="font-mono text-sm">{neoData.closestApproach}</p>
              </div>
              <div>
                <p className="font-mono text-xs text-muted">FASTEST</p>
                <p className="font-mono text-sm">{neoData.fastest}</p>
              </div>
            </div>
            <p className="font-mono text-xs text-muted mt-4">Source: NASA</p>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 font-mono text-xs">
          {prev ? (
            <Link
              href={`/blogs/${prev.slug}`}
              className="text-muted hover:text-accent transition-colors text-left min-w-0"
            >
              <span className="block text-[10px] tracking-widest mb-1">
                &larr; PREVIOUS LOG
              </span>
              <span className="block truncate not-italic">{prev.title}</span>
            </Link>
          ) : (
            <Link
              href="/blogs"
              className="text-muted hover:text-accent transition-colors"
            >
              &larr; ALL LOGS
            </Link>
          )}
          {next ? (
            <Link
              href={`/blogs/${next.slug}`}
              className="text-muted hover:text-accent transition-colors text-right min-w-0"
            >
              <span className="block text-[10px] tracking-widest mb-1">
                NEXT LOG &rarr;
              </span>
              <span className="block truncate not-italic">{next.title}</span>
            </Link>
          ) : (
            <Link
              href="/blogs"
              className="text-muted hover:text-accent transition-colors"
            >
              NEXT LOG &rarr;
            </Link>
          )}
        </div>
      </footer>
    </article>
  );
}
