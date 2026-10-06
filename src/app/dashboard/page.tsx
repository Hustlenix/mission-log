import Link from "next/link";
import { requireAuthor } from "@/lib/author";
import { getRole } from "@/lib/session";
import { Post } from "@/models/Post";
import { PageTitle } from "@/components/publication";
import { recentMetrics } from "@/lib/metrics";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Editorial studio",
  robots: { index: false, follow: false },
};
export default async function Studio({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const s = await requireAuthor();
  const role = await getRole(s.user);
  const metrics =
    role === "admin" || role === "editor" ? await recentMetrics() : null;
  const { status } = await searchParams;
  const valid = ["draft", "review", "scheduled", "published"].includes(
    status || "",
  )
    ? status
    : undefined;
  const posts = await Post.find({
    ...(role === "author" ? { authorId: s.user.id } : {}),
    ...(valid
      ? { status: valid as "draft" | "review" | "scheduled" | "published" }
      : {}),
  })
    .sort({ updatedAt: -1 })
    .limit(200)
    .lean();
  return (
    <div className="shell">
      <PageTitle
        label={`Editorial studio / ${role}`}
        title="The work in progress."
        description="Write, review, schedule and publish. Permissions are checked on the server—not just in this menu."
      />
      <div className="actions">
        <Link className="button" href="/post">
          New article
        </Link>
        {["all", "draft", "review", "scheduled", "published"].map((st) => (
          <Link
            key={st}
            className="tag"
            href={st === "all" ? "/studio" : `/studio?status=${st}`}
          >
            {st}
          </Link>
        ))}
        <Link href="/account" className="text-action">
          Your reader account ↗
        </Link>
      </div>
      <p className="metadata">
        {posts.length} records · Authors see their own work. Editors and admins
        manage all articles.
      </p>
      {metrics && (
        <section aria-label="Aggregate activity">
          <h2 className="section-heading">Last seven UTC days</h2>
          <div className="metric-grid">
            {["article-render", "search", "save", "follow"].map((event) => (
              <div key={event}>
                <p className="eyebrow">{event}</p>
                <strong>
                  {metrics.find((m) => m._id === event)?.count || 0}
                </strong>
              </div>
            ))}
          </div>
          <p className="metadata">
            Server-render and action counts, including bots, previews and
            testing. Not unique readers. No raw search terms or visitor
            identifiers. Aggregates expire after 90 days.
          </p>
        </section>
      )}
      {posts.map((p) => (
        <div className="account-row" key={p._id.toString()}>
          <div>
            <p className="eyebrow signal">
              {p.status} / {p.contentType || "mission-log"}
            </p>
            <h3>{p.title}</h3>
            <p className="metadata">
              Updated {p.updatedAt.toISOString().slice(0, 10)} ·{" "}
              {p.topicIds?.join(", ") || p.project}
            </p>
          </div>
          <div className="actions">
            <Link href={`/post/${p._id}/edit`} className="text-action">
              Edit ↗
            </Link>
            {p.status === "published" && (
              <Link href={`/articles/${p.slug}`} className="text-action">
                Read ↗
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
