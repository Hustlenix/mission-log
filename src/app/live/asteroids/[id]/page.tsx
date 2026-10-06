import { notFound } from "next/navigation";
import Link from "next/link";
import { getAsteroidById } from "@/lib/nasa/neo";
import { PageTitle, Unavailable } from "@/components/publication";
import { FeedStamp } from "@/components/feed-stamp";
import { ItemActions } from "@/components/item-actions";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return { title: `Asteroid ${(await params).id}` };
}
export default async function ObjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d{1,12}$/.test(id)) notFound();
  const feed = await getAsteroidById(id);
  const o = feed.data;
  if (!o)
    return (
      <div className="shell">
        <PageTitle label="NASA / JPL" title="Object record" />
        <Unavailable name="This object" />
      </div>
    );
  const now = new Date().toISOString().slice(0, 10);
  const future = o.approaches
    .filter((a) => a.date >= now)
    .sort((a, b) => a.date.localeCompare(b.date));
  const next = future[0];
  return (
    <div className="shell">
      <PageTitle
        label={`NASA object ${id}`}
        title={o.name}
        description="A normalized NASA/JPL record. Size estimates and approach predictions can change as observations improve."
      />
      <div className="actions">
        <ItemActions
          type="asteroid"
          id={id}
          href={`/live/asteroids/${id}`}
          follow
        />
        <a
          href={o.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-action"
        >
          JPL orbital record ↗
        </a>
      </div>
      <FeedStamp feed={feed} />
      <div className="metric-grid">
        <div>
          <p className="eyebrow">Estimated diameter</p>
          <strong>
            {Math.round(o.diameterMin)}–{Math.round(o.diameterMax)} m
          </strong>
        </div>
        <div>
          <p className="eyebrow">NASA classification</p>
          <strong>
            {o.hazardous ? "Potentially hazardous" : "Not flagged as PHA"}
          </strong>
          <p className="muted">Not an impact probability.</p>
        </div>
        <div>
          <p className="eyebrow">Next listed Earth approach</p>
          <strong>{next?.date || "None in this record"}</strong>
        </div>
      </div>
      {next && (
        <section className="py-8">
          <p className="eyebrow signal">A distance comparison</p>
          <h2 className="text-3xl my-4">
            {next.lunar.toFixed(2)} average Earth–Moon distances.
          </h2>
          <div className="distance-diagram">
            <span>Earth</span>
            <div className="distance-line" />
            <span>{o.name}</span>
          </div>
          <p className="metadata">
            {next.distance.toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}{" "}
            km · Diagram is a comparison only, not an orbit or a to-scale
            position plot.
          </p>
        </section>
      )}
      <h2 className="section-heading">
        Upcoming Earth approaches in NASA’s record
      </h2>
      {future.length ? (
        future.slice(0, 30).map((a) => (
          <div className="result-row" key={a.time}>
            <p className="eyebrow">
              {a.time.slice(0, 16).replace("T", " ")} UTC
            </p>
            <p className="text-xl">
              {(a.distance / 1e6).toFixed(2)} million km / {a.lunar.toFixed(2)}{" "}
              lunar distances
            </p>
            <p className="muted">
              Relative speed: {Math.round(a.speed).toLocaleString("en-US")} km/h
            </p>
          </div>
        ))
      ) : (
        <p className="muted py-8">
          No upcoming Earth approaches were supplied in this record.
        </p>
      )}
      <Link href="/live/asteroids" className="text-action">
        Back to the approach explorer ↗
      </Link>
    </div>
  );
}
