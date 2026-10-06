import Link from "next/link";
import { Suspense } from "react";
import { getArticles } from "@/lib/publication";
import {
  Figure,
  SectionHeading,
  StoryRow,
  Unavailable,
} from "@/components/publication";
import { topics, stationImage, imageUrl, shortDate } from "@/lib/catalog";
import { ForYou } from "@/components/for-you";
import { FeedStamp } from "@/components/feed-stamp";
export const dynamic = "force-dynamic";
export default async function Home() {
  const posts = await getArticles();
  const lead = posts?.[0];
  return (
    <div className="shell">
      <div className="masthead">
        <div>
          <h1>MISSION LOG</h1>
          <p className="eyebrow">Space, decoded daily.</p>
        </div>
        <div className="edition metadata text-right">
          {shortDate(new Date())}
          <br />
          Independent / Earth edition
        </div>
      </div>
      <section className="lead-story">
        <div>
          <p className="eyebrow signal">
            The big picture / {lead?.contentType || "Our perspective"}
          </p>
          <h2>
            <Link href={lead ? `/articles/${lead.slug}` : "/iss"}>
              {lead?.title || "The station ends. The work doesn’t."}
            </Link>
          </h2>
          <p className="dek">
            {lead?.excerpt ||
              "The ISS is approaching a transition. The next generation of orbital laboratories needs more than astronauts."}
          </p>
          <Link
            href={lead ? `/articles/${lead.slug}` : "/iss"}
            className="text-action"
          >
            Read the story ↗
          </Link>
        </div>
        <Figure
          src={lead?.coverImage || stationImage}
          alt={lead?.coverAlt || "International Space Station above Earth"}
          credit={
            lead?.imageCredit ||
            "NASA / ISS Expedition 56 · archival photograph"
          }
          priority
        />
      </section>
      <Suspense
        fallback={
          <div className="live-strip">
            <p className="metadata">Loading the latest NASA data…</p>
          </div>
        }
      >
        <HomeData />
      </Suspense>
      <div className="publication-grid">
        <section>
          <SectionHeading title="The latest" href="/latest" />
          {posts ? (
            posts
              .slice(1, 5)
              .map((p, i) => <StoryRow key={p.slug} post={p} number={i} />)
          ) : (
            <Unavailable name="The publication" />
          )}
        </section>
        <aside className="editorial-aside">
          <SectionHeading title="Follow your curiosity" href="/topics" />
          <div className="topic-list">
            {topics.slice(0, 6).map((t) => (
              <Link key={t.slug} href={`/topics/${t.slug}`}>
                {t.name}
                <span className="muted">↗</span>
              </Link>
            ))}
          </div>
          <p className="muted mt-6">
            Save a story. Follow a topic. Build a Mission Log of your own.
          </p>
          <Link href="/account" className="text-action">
            Make it yours ↗
          </Link>
        </aside>
      </div>
      <section className="documentary-banner">
        <Figure
          src={imageUrl("GSFC_20171208_Archive_e001653")}
          alt="Technicians inspecting a Webb flight mirror at Goddard"
          credit="NASA / Chris Gunn · Webb flight mirrors at Goddard · archival photograph"
        />
        <div>
          <p className="eyebrow signal">The generation relay</p>
          <h2>Every machine above us was once an unfinished idea.</h2>
          <p className="dek">
            Apollo. Shuttle. The ISS. What will your generation build?
          </p>
          <Link href="/generation" className="text-action">
            Meet the next chapter ↗
          </Link>
        </div>
      </section>
      <Suspense fallback={null}>
        <ForYou />
      </Suspense>
    </div>
  );
}
async function HomeData() {
  const { getNearEarthObjects } = await import("@/lib/nasa/neo");
  const neo = await getNearEarthObjects();
  return (
    <section aria-label="Today in space" className="live-strip">
      <div>
        <p className="eyebrow">
          <span className="text-success">●</span> Today in space
        </p>
        <strong>
          {neo.data ? `${neo.data.length} objects` : "Feed unavailable"}
        </strong>
        <Link href="/live/asteroids" className="text-action">
          Near-Earth objects ↗
        </Link>
        <FeedStamp feed={neo} />
      </div>
      <div>
        <p className="eyebrow">Understand the Sun</p>
        <strong>Space weather</strong>
        <Link href="/live/space-weather" className="text-action">
          See the observations ↗
        </Link>
      </div>
      <div>
        <p className="eyebrow">A daily point of view</p>
        <strong>The daily brief</strong>
        <Link href="/daily" className="text-action">
          Read today’s data ↗
        </Link>
      </div>
    </section>
  );
}
