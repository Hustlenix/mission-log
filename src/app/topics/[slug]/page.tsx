import Link from "next/link";
import { notFound } from "next/navigation";
import { topics } from "@/lib/catalog";
import { getArticles } from "@/lib/publication";
import { ItemActions } from "@/components/item-actions";
import {
  PageTitle,
  StoryRow,
  SectionHeading,
  Unavailable,
} from "@/components/publication";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: topics.find((t) => t.slug === slug)?.name || "Topic" };
}
export default async function Topic({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = topics.find((t) => t.slug === slug);
  if (!t) notFound();
  const posts = await getArticles(slug);
  return (
    <div className="shell">
      <PageTitle
        label="Topic / Mission Log"
        title={t.name}
        description={t.description}
      />
      <div className="actions">
        <ItemActions type="topic" id={slug} href={`/topics/${slug}`} follow />
        <Link className="text-action" href={t.live}>
          Open the explorer ↗
        </Link>
        <Link
          className="text-action"
          href={`/media?q=${encodeURIComponent(t.query)}`}
        >
          NASA media ↗
        </Link>
      </div>
      <SectionHeading title="Stories & explainers" />
      {posts?.length ? (
        posts.map((p) => <StoryRow key={p.slug} post={p} />)
      ) : posts ? (
        <div className="empty-state">
          <h2>Start with the source.</h2>
          <p className="muted">
            This topic’s article library is growing. Explore the NASA imagery
            and related data in the meantime.
          </p>
          <Link
            href={`/media?q=${encodeURIComponent(t.query)}`}
            className="text-action"
          >
            Browse {t.name} imagery ↗
          </Link>
        </div>
      ) : (
        <Unavailable name="Topic stories" />
      )}
      <SectionHeading title="Related subjects" />
      <div className="actions">
        {topics
          .filter((x) => x.slug !== slug)
          .slice(0, 4)
          .map((x) => (
            <Link key={x.slug} href={`/topics/${x.slug}`} className="tag">
              {x.name}
            </Link>
          ))}
      </div>
    </div>
  );
}
