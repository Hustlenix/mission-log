import Link from "next/link";
import { getSpaceWeather } from "@/lib/nasa/donki";
import { PageTitle, Unavailable } from "@/components/publication";
export const dynamic = "force-dynamic";
export const metadata = { title: "Space weather observations" };
export default async function Weather() {
  const d = await getSpaceWeather();
  return (
    <div className="shell">
      <PageTitle
        label="NASA CCMC / DONKI"
        title="The Sun has been busy. Or quiet."
        description="Read the observations, not a fear score. This is a seven-day event catalogue—not an aurora forecast or an operational alert service."
      />
      <p className="metadata">
        {d.start} to {d.end} · Recorded events ·{" "}
        {d.stale
          ? "Cached records / refresh unavailable"
          : "Source-linked observations"}
        {d.fetchedAt
          ? ` · Fetched ${d.fetchedAt.slice(0, 16).replace("T", " ")} UTC`
          : ""}
      </p>
      <div className="metric-grid">
        {["Solar flare", "Coronal mass ejection", "Geomagnetic storm"].map(
          (type) => (
            <div key={type}>
              <p className="eyebrow">{type}</p>
              <strong>
                {d.categories.find((c) => c.type === type)?.available
                  ? d.categories.find((c) => c.type === type)?.count
                  : "Unavailable"}
              </strong>
              <p className="metadata">Recorded in selected interval</p>
            </div>
          ),
        )}
      </div>
      {d.unavailable > 0 && (
        <Unavailable name={`${d.unavailable} of the five event feeds`} />
      )}
      <h2 className="section-heading">Observation timeline</h2>
      {d.events.map((e) => (
        <article className="weather-row" key={e.id}>
          <div className="metadata">
            {e.time.replace("T", " ").slice(0, 16)} UTC
            <br />
            <span className="text-success">Recorded</span>
          </div>
          <div>
            <p className="eyebrow signal">{e.type}</p>
            <h3 className="text-2xl my-2">{e.classification}</h3>
            <p className="muted">{e.explanation}</p>
            <a
              className="text-action"
              href={e.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Read the source event ↗
            </a>
          </div>
        </article>
      ))}
      {!d.events.length && d.unavailable === 0 && (
        <div className="empty-state">
          <h2>No events in these feeds for this interval.</h2>
          <p className="muted">
            This means no catalogue records were returned. It is not a claim of
            zero solar activity.
          </p>
        </div>
      )}
      <Link className="text-action" href="/articles/a-solar-flare-is-not-a-cme">
        Flare, CME or geomagnetic storm? Read the differences ↗
      </Link>
    </div>
  );
}
