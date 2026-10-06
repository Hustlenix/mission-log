import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getArticle, getArticles } from "@/lib/publication";
import { Figure, SectionHeading, StoryRow } from "@/components/publication";
import { readingTime, shortDate, topicName } from "@/lib/catalog";
import { ItemActions } from "@/components/item-actions";
import { ReadingProgress } from "@/components/reading-progress";
import { getSession } from "@/lib/session";
import { ReaderProfile } from "@/models/Reader";
import { countEvent } from "@/lib/metrics";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const p = await getArticle((await params).slug);
  return p
    ? {
        title: p.seoTitle || p.title,
        description: p.seoDescription || p.excerpt,
        alternates: { canonical: `/articles/${p.slug}` },
        openGraph: {
          title: p.title,
          description: p.excerpt,
          type: "article" as const,
          ...(p.coverImage ? { images: [{ url: p.coverImage }] } : {}),
        },
      }
    : { title: "Story not found" };
}
export default async function Article({ params }: Props) {
  const p = await getArticle((await params).slug);
  if (!p) notFound();
  await countEvent("article-render");
  const related = await getArticles(p.topicIds?.[0]);
  const session = await getSession().catch(() => null);
  const profile = session
    ? await ReaderProfile.findOne({ userId: session.user.id }).lean()
    : null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.title,
    description: p.excerpt,
    datePublished: p.publishedAt?.toISOString(),
    dateModified: p.updatedAt.toISOString(),
    author: { "@type": "Organization", name: "Mission Log" },
  };
  return (
    <article className="shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <header className="article-heading">
        <p className="eyebrow signal">
          <Link href={`/topics/${p.topicIds?.[0] || "iss"}`}>
            {topicName(p.topicIds?.[0] || "mission-log")}
          </Link>{" "}
          / {p.contentType || "journal"}
        </p>
        <h1>{p.title}</h1>
        <p className="dek">{p.subtitle || p.excerpt}</p>
        <p className="metadata">
          Mission Log · {shortDate(p.publishedAt)} · {readingTime(p.content)}{" "}
          min read
        </p>
        <div className="actions">
          <ItemActions
            type="article"
            id={p.slug}
            href={`/articles/${p.slug}`}
          />
          <Link href="/latest" className="text-action muted">
            All stories ↗
          </Link>
        </div>
      </header>
      {p.coverImage && (
        <Figure
          src={p.coverImage}
          alt={p.coverAlt || p.title}
          credit={p.imageCredit}
          priority
        />
      )}
      <div className="article-body">
        {profile?.recordHistory && <ReadingProgress slug={p.slug} />}
        <div className="prose-mission">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{p.content}</ReactMarkdown>
        </div>
        <aside className="source-block">
          <p className="eyebrow">Sources & editorial context</p>
          <p className="muted">
            {p.editorialNote ||
              "Builder journal. Experiences are the author’s own; external sources are linked where relevant."}
          </p>
          {p.sources?.map((s) => (
            <a
              key={s.url}
              href={s.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              {s.title} ↗
            </a>
          ))}
        </aside>
      </div>
      <section>
        <SectionHeading title="Keep reading" />
        {related
          ?.filter((r) => r.slug !== p.slug)
          .slice(0, 3)
          .map((r) => (
            <StoryRow key={r.slug} post={r} />
          ))}
      </section>
    </article>
  );
}
