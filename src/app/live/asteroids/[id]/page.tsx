import { notFound } from "next/navigation";
import Link from "next/link";
import { getAsteroidById } from "@/lib/nasa/neo";
import { PageTitle, Unavailable } from "@/components/publication";
import { FeedStamp } from "@/components/feed-stamp";
import { ItemActions } from "@/components/item-actions";
import { ApproachDistance } from "@/components/approach-distance";
import { approachHref, selectApproach } from "@/lib/nasa/approach";
import { queryValue } from "@/lib/nasa/normalize";
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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ approach?: string | string[] }>;
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
  const requested = queryValue((await searchParams).approach);
  const next = selectApproach(o.approaches, requested, now);
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
          href={next ? approachHref(id, next) : `/live/asteroids/${id}`}
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
          <p className="eyebrow">Selected Earth approach</p>
          <strong>{next?.date || "None in this record"}</strong>
        </div>
      </div>
      <form className="filters">
        <label>Earth approach (UTC)
          <select name="approach" defaultValue={next?.time || ""}>
            {!next && <option value="">Choose an available record</option>}
            {[...o.approaches].sort((a, b) => a.time.localeCompare(b.time)).map((a) => (
              <option key={a.time} value={a.time}>{a.time.replace("T", " ").slice(0, 16)} UTC · {a.lunar.toFixed(2)} LD</option>
            ))}
          </select>
        </label>
        <button className="button" disabled={!o.approaches.length}>Compare approach</button>
      </form>
      {requested && !next && <p role="status">The requested approach is not in this NASA record. Choose a listed approach; no substitute is shown.</p>}
      {next && <ApproachDistance approach={next} />}
      <p className="muted">NASA’s potentially hazardous classification is based on orbital proximity and absolute magnitude, not the selected flyby distance alone. A flag is not a warning or impact probability. <a className="text-action" href="https://cneos.jpl.nasa.gov/glossary/PHA.html">Read the CNEOS definition ↗</a></p>
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
