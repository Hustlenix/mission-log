import Link from "next/link";
import { getNearEarthObjects } from "@/lib/nasa/neo";
import { validDate, addDays, queryValue } from "@/lib/nasa/normalize";
import { PageTitle, Unavailable } from "@/components/publication";
import { FeedStamp } from "@/components/feed-stamp";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Asteroid explorer",
  description:
    "Close approaches, estimated sizes and real NASA classifications.",
};
export default async function Asteroids({
  searchParams,
}: {
  searchParams: Promise<{
    date?: string;
    range?: string;
    sort?: string;
    q?: string;
    pha?: string;
  }>;
}) {
  const p = Object.fromEntries(
    Object.entries(await searchParams).map(([key, value]) => [
      key,
      queryValue(value),
    ]),
  ) as Record<string, string>;
  const date = validDate(p.date);
  const week = p.range === "week";
  const feed = await getNearEarthObjects(date, week);
  const q = (p.q || "").slice(0, 100).toLowerCase();
  const rows = (feed.data || [])
    .flatMap((o) =>
      o.approaches
        .filter((a) => a.date >= date && a.date <= addDays(date, week ? 6 : 0))
        .map((a) => ({ ...o, approach: a })),
    )
    .filter(
      (o) =>
        (!q || o.name.toLowerCase().includes(q) || o.id.includes(q)) &&
        (p.pha !== "yes" || o.hazardous),
    );
  rows.sort((a, b) =>
    p.sort === "largest"
      ? b.diameterMax - a.diameterMax
      : p.sort === "fastest"
        ? b.approach.speed - a.approach.speed
        : a.approach.distance - b.approach.distance,
  );
  return (
    <div className="shell">
      <PageTitle
        label="NASA / JPL · Near-Earth objects"
        title="Passing Earth. Not a warning."
        description="Read the date, distance and classification together. A close approach is not an impact prediction."
      />
      <form className="filters">
        <label>
          Date (UTC)
          <input name="date" type="date" defaultValue={date} />
        </label>
        <label>
          Interval
          <select name="range" defaultValue={week ? "week" : "today"}>
            <option value="today">One day</option>
            <option value="week">Next seven days</option>
          </select>
        </label>
        <label>
          Sort
          <select name="sort" defaultValue={p.sort || "closest"}>
            <option value="closest">Closest approach</option>
            <option value="largest">Largest estimated size</option>
            <option value="fastest">Fastest</option>
          </select>
        </label>
        <label>
          Object
          <input
            name="q"
            placeholder="Name or NASA ID"
            defaultValue={p.q}
            maxLength={100}
          />
        </label>
        <label>
          Classification
          <select name="pha" defaultValue={p.pha || "all"}>
            <option value="all">All objects</option>
            <option value="yes">Potentially hazardous</option>
          </select>
        </label>
        <button className="button">Apply</button>
      </form>
      <FeedStamp feed={feed} />
      {!feed.data ? (
        <Unavailable name="The asteroid feed" />
      ) : (
        <>
          <p className="metadata mb-5">
            {rows.length} approach records · {date}
            {week ? ` to ${addDays(date, 6)}` : ""} · Diameter is an estimate
            range.
          </p>
          <div className="desktop-asteroids">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Object / approach UTC</th>
                  <th>Diameter</th>
                  <th>Miss distance</th>
                  <th>Relative speed</th>
                  <th>NASA PHA</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => (
                  <tr key={`${o.id}:${o.approach.time}`}>
                    <td>
                      <Link
                        href={`/live/asteroids/${o.id}`}
                        className="font-bold text-lg"
                      >
                        {o.name} ↗
                      </Link>
                      <p className="metadata">
                        {o.approach.time.replace("T", " ").slice(0, 16)}
                      </p>
                    </td>
                    <td>
                      {Math.round(o.diameterMin)}–{Math.round(o.diameterMax)} m
                    </td>
                    <td>
                      {(o.approach.distance / 1e6).toFixed(2)}M km
                      <p className="metadata">
                        {o.approach.lunar.toFixed(2)} lunar distances
                      </p>
                    </td>
                    <td>
                      {Math.round(o.approach.speed).toLocaleString("en-US")}{" "}
                      km/h
                    </td>
                    <td>
                      <span className={o.hazardous ? "tag signal" : "metadata"}>
                        {o.hazardous ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mobile-asteroids">
            {rows.map((o) => (
              <div key={`${o.id}:${o.approach.time}`} className="result-row">
                <h2>
                  <Link href={`/live/asteroids/${o.id}`}>{o.name} ↗</Link>
                </h2>
                <p className="metadata">
                  {o.approach.date} · NASA PHA: {o.hazardous ? "Yes" : "No"}
                </p>
                <p>
                  {(o.approach.distance / 1e6).toFixed(2)} million km /{" "}
                  {o.approach.lunar.toFixed(2)} lunar distances
                </p>
                <p className="muted">
                  {Math.round(o.diameterMin)}–{Math.round(o.diameterMax)} m ·{" "}
                  {Math.round(o.approach.speed).toLocaleString("en-US")} km/h
                </p>
              </div>
            ))}
          </div>
          {!rows.length && (
            <div className="empty-state">
              <h2>No matching approaches.</h2>
              <p className="muted">
                Change the name or classification filter. This is not a
                statement about all objects in space.
              </p>
            </div>
          )}
        </>
      )}
      <Link
        href="/articles/potentially-hazardous-does-not-mean-impact"
        className="text-action"
      >
        What “potentially hazardous” actually means ↗
      </Link>
    </div>
  );
}
