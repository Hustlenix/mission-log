import Link from "next/link";
import { searchPublication, normalizeQuery } from "@/lib/search";
import { PageTitle } from "@/components/publication";
import { countEvent } from "@/lib/metrics";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};
export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { q: input, type } = await searchParams;
  const q = normalizeQuery(input);
  if (q) await countEvent("search");
  const { results, unavailable, nasaUnavailable } = await searchPublication(q);
  const filtered = type ? results.filter((r) => r.type === type) : results;
  return (
    <div className="shell">
      <PageTitle
        label="Search / Mission Log"
        title={q ? `Results for “${q}”` : "What are you curious about?"}
      />
      <form className="search-form" action="/search">
        <input
          name="q"
          aria-label="Search space"
          defaultValue={q}
          placeholder="Search articles, topics, NASA media or Apophis"
          maxLength={120}
        />
        <button className="button">Search</button>
      </form>
      {q && (
        <>
          <div className="actions">
            <Link className="tag" href={`/search?q=${encodeURIComponent(q)}`}>
              All ({results.length})
            </Link>
            {Array.from(new Set(results.map((r) => r.type))).map((t) => (
              <Link
                className="tag"
                key={t}
                href={`/search?${new URLSearchParams({ q, type: t })}`}
              >
                {t}
              </Link>
            ))}
          </div>
          <p className="metadata">
            {filtered.length} results{" "}
            {unavailable ? "· Article search is temporarily unavailable." : ""}
            {nasaUnavailable
              ? " · Some NASA results are temporarily unavailable."
              : ""}
          </p>
          {filtered.map((r) => (
            <article key={`${r.type}:${r.id}`} className="result-row">
              <p className="eyebrow signal">{r.type}</p>
              <h2>
                <Link href={r.href}>{r.title} ↗</Link>
              </h2>
              <p className="muted">{r.description}</p>
            </article>
          ))}
          {!filtered.length && (
            <div className="empty-state">
              <h2>No matches yet.</h2>
              <p className="muted">
                Try a broader term such as “asteroids”, “Earth” or “space”.
              </p>
              <Link href="/topics" className="text-action">
                Browse topics ↗
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
