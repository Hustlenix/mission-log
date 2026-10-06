import Link from "next/link";
import { getAstronomy } from "@/lib/nasa/apod";
import { getNearEarthObjects } from "@/lib/nasa/neo";
import { getEarthImages } from "@/lib/nasa/epic";
import { PageTitle, Figure, Unavailable } from "@/components/publication";
import { FeedStamp } from "@/components/feed-stamp";
export const dynamic = "force-dynamic";
export const metadata = { title: "Today’s space brief" };
export default async function Daily() {
  const [neo, apod, earth] = await Promise.all([
    getNearEarthObjects(),
    getAstronomy(),
    getEarthImages(),
  ]);
  const nearest = neo.data
    ?.flatMap((o) =>
      o.approaches.map((a) => ({ name: o.name, id: o.id, ...a })),
    )
    .sort((a, b) => a.distance - b.distance)[0];
  return (
    <div className="shell">
      <PageTitle
        label={`Daily data brief / ${new Date().toISOString().slice(0, 10)}`}
        title="A few things worth looking at."
        description="A live, source-linked snapshot of retrieved data—not automated journalism or an editorially reviewed daily edition."
      />
      <section className="result-row">
        <p className="eyebrow signal">01 / Near Earth</p>
        <h2>
          {neo.data
            ? `${neo.data.length} objects in today’s approach feed.`
            : "Asteroid feed unavailable."}
        </h2>
        {nearest && (
          <p className="dek">
            The closest listed approach: {nearest.name}, at{" "}
            {nearest.lunar.toFixed(2)} lunar distances.
          </p>
        )}
        <Link
          className="text-action"
          href={nearest ? `/live/asteroids/${nearest.id}` : "/live/asteroids"}
        >
          Inspect the observations ↗
        </Link>
        <FeedStamp feed={neo} />
      </section>
      <section className="result-row">
        <p className="eyebrow signal">02 / Astronomy</p>
        {apod.data ? (
          <>
            <h2>{apod.data.title}</h2>
            <p className="metadata">
              APOD date: {apod.data.date} · Credit: {apod.data.copyright}
            </p>
            {apod.data.media_type === "image" && apod.data.url && (
              <div className="my-5 max-w-3xl">
                <Figure
                  src={apod.data.url}
                  alt={apod.data.alt}
                  credit={`APOD / ${apod.data.copyright}`}
                />
              </div>
            )}
            <p className="dek">{apod.data.explanation.slice(0, 350)}…</p>
            <a href={apod.data.sourceUrl} className="text-action">
              Read NASA’s full explanation & image rights ↗
            </a>
          </>
        ) : (
          <Unavailable name="APOD" />
        )}
        <FeedStamp feed={apod} />
      </section>
      <section className="result-row">
        <p className="eyebrow signal">03 / Earth</p>
        <h2>
          {earth.data?.length
            ? `The latest available EPIC sequence is dated ${earth.data[0].date.slice(0, 10)}.`
            : "Earth imagery unavailable."}
        </h2>
        <p className="dek">
          Capture time is different from fetch time. These are available
          observations, not a live video stream.
        </p>
        <Link href="/live/earth" className="text-action">
          See the planet ↗
        </Link>
        <FeedStamp feed={earth} />
      </section>
      <section className="result-row">
        <p className="eyebrow signal">04 / The Sun</p>
        <h2>A catalogue, not a forecast.</h2>
        <p className="dek">
          Read the past seven days of NASA DONKI records with the event types
          kept separate.
        </p>
        <Link href="/live/space-weather" className="text-action">
          Open the observation timeline ↗
        </Link>
      </section>
    </div>
  );
}
