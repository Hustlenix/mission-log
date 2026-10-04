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
  try {
    await connectToDatabase();
    return await Post.findOne({ slug, status: "published" }).lean();
  } catch {
    return null;
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

  const neoData = await getNeoData();
  const readTime = Math.max(1, Math.round(post.content.split(/\s+/).length / 200));

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
      <header className="mb-12">
        <p className="font-mono text-xs text-accent tracking-widest mb-4">
          MISSION LOG / {String(post._id).slice(-3).toUpperCase()}
        </p>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-6">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-muted">
          <span>
            {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }).toUpperCase()
              : ""}
          </span>
          <span className="text-foreground">{post.project}</span>
          <span>{readTime} MIN READ</span>
        </div>
      </header>

      <div className="prose-mission">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
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
                ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }).toUpperCase()
                : ""}
            </p>
            <p className="font-mono text-xs text-muted mb-4">NEAR-EARTH ACTIVITY</p>
            <div className="grid grid-cols-3 gap-4">
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

        <div className="flex items-center justify-between">
          <Link
            href="/blogs"
            className="font-mono text-xs text-muted hover:text-accent transition-colors"
          >
            &larr; ALL LOGS
          </Link>
          <Link
            href="/blogs"
            className="font-mono text-xs text-muted hover:text-accent transition-colors"
          >
            NEXT LOG &rarr;
          </Link>
        </div>
      </footer>
    </article>
  );
}
