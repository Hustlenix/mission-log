import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import { Post } from "@/models/Post";
import { getApod, getNeoData } from "@/lib/nasa";

export const dynamic = "force-dynamic";

async function getLogs() {
  try {
    await connectToDatabase();
    const [posts, count, projects] = await Promise.all([
      Post.find({ status: "published" }).sort({ publishedAt: -1 }).limit(6).lean(),
      Post.countDocuments({ status: "published" }),
      Post.distinct("project", { status: "published" }),
    ]);
    return { posts, count, projects, available: true };
  } catch {
    return { posts: [], count: 0, projects: [], available: false };
  }
}

export default async function Home() {
  const [logs, apod, neo] = await Promise.all([getLogs(), getApod(), getNeoData()]);
  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 py-12 sm:py-20 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
        <div>
          <p className="eyebrow text-accent mb-6">Independent explorer · NASA-powered curiosity</p>
          <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[.98]">Small ideas.<br /><span className="text-accent italic">Big orbits.</span></h1>
          <p className="text-lg sm:text-xl text-muted leading-relaxed max-w-xl mt-7">Hey, I&apos;m Lalith. Welcome to my little corner of the cosmos: games, hardware, experiments, and the wonderfully messy process of making things.</p>
          <div className="flex flex-wrap gap-5 mt-9">
            <Link className="launch-button" href={logs.posts[0] ? `/blogs/${logs.posts[0].slug}` : "/blogs"}>Explore the logs ↗</Link>
            <Link className="launch-button secondary" href="/missions">Pick a mission ★</Link>
          </div>
          <p className="font-mono text-xs text-muted mt-8">A FIELD JOURNAL FOR THE CURIOUS. NO SPACESUIT REQUIRED.</p>
        </div>
        <div className="orbit-art max-w-[440px] w-full mx-auto" aria-hidden="true">
          <svg viewBox="0 0 440 440" fill="none">
            <ellipse cx="220" cy="220" rx="193" ry="100" stroke="#254edb" strokeWidth="2" strokeDasharray="7 8" transform="rotate(-35 220 220)" />
            <circle cx="224" cy="235" r="98" fill="#254edb" stroke="#142447" strokeWidth="3" />
            <path d="M155 201l40-33 35 14-8 35 45 19 23 40-27 26-20-34-32 2-20-30-36-7z" fill="#a9efcb" />
            <path d="M276 158l24 30-22 15-15-26z" fill="#a9efcb" />
            <g transform="rotate(32 293 108)">
              <path d="M272 132l-24 26 4-41 17-13m45 28 24 26-4-41-17-13" fill="#ff783f" stroke="#142447" strokeWidth="3" />
              <path d="M270 135V94q23-56 46 0v41z" fill="#fff9ed" stroke="#142447" strokeWidth="3" />
              <circle cx="293" cy="98" r="12" fill="#cfe9ff" stroke="#142447" strokeWidth="3" />
              <path d="M280 142q13 55 26 0" fill="#ffe16c" stroke="#142447" strokeWidth="3" />
            </g>
            <circle cx="85" cy="285" r="27" fill="#ff783f" stroke="#142447" strokeWidth="3" />
            <ellipse cx="85" cy="285" rx="43" ry="10" stroke="#142447" strokeWidth="3" transform="rotate(-25 85 285)" />
            <path d="M101 92v24m-12-12h24M342 280v22m-11-11h22M170 355v16m-8-8h16" stroke="#142447" strokeWidth="3" />
            <circle cx="355" cy="175" r="5" fill="#142447" /><circle cx="170" cy="110" r="4" fill="#142447" />
          </svg>
          <span className="orbit-label top">MISSION: KEEP EXPLORING</span>
          <span className="orbit-label bottom">STAY CURIOUS, EARTHLING</span>
        </div>
      </section>
      <div className="space-strip"><div className="mx-auto max-w-6xl px-6 py-5 flex flex-wrap justify-between gap-5 font-mono text-xs"><span>✦ GAMES + HARDWARE + THE WEB</span><span>{logs.available ? `${logs.count} PUBLISHED LOGS · ${logs.projects.length} MISSIONS` : "LOG CONNECTION TEMPORARILY UNAVAILABLE"}</span><span>EARTH → IDEAS → ORBIT</span></div></div>
      <section className="mx-auto max-w-6xl px-6 py-10" aria-labelledby="sky-now-heading">
        <div className="border border-border bg-surface p-6 flex flex-wrap items-center gap-y-4 gap-x-10">
          <p id="sky-now-heading" className="eyebrow text-accent">Sky now · NASA NEO feed</p>
          {neo ? (
            <dl className="flex flex-wrap gap-x-10 gap-y-3 font-mono text-xs grow">
              <div>
                <dt className="text-muted">OBJECTS TRACKED TODAY</dt>
                <dd className="text-sm mt-1">{neo.objectsTracked}</dd>
              </div>
              <div>
                <dt className="text-muted">CLOSEST APPROACH</dt>
                <dd className="text-sm mt-1">{neo.closestApproach}</dd>
              </div>
              <div>
                <dt className="text-muted">FASTEST</dt>
                <dd className="text-sm mt-1">{neo.fastest}</dd>
              </div>
              <div className="ml-auto">
                <a href="https://cneos.jpl.nasa.gov/" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-accent transition-colors">JPL TRACKER ↗</a>
              </div>
            </dl>
          ) : (
            <p className="font-mono text-xs text-muted grow">SPACE FEED OFFLINE — live near-Earth numbers are temporarily unavailable.</p>
          )}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8"><div><p className="eyebrow text-accent mb-3">Fresh from mission control</p><h2 className="font-display text-4xl sm:text-5xl font-bold">The latest transmissions.</h2></div><Link href="/archive" className="font-bold text-accent">Search the archive ↗</Link></div>
        {logs.posts.length ? <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {logs.posts.map((post, i) => <Link key={post._id.toString()} href={`/blogs/${post.slug}`} className="mission-card group hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-center mb-8"><span className="eyebrow text-accent">{post.project}</span><span className="text-3xl" aria-hidden="true">{["✦", "↗", "◉"][i % 3]}</span></div>
            <h3 className="font-display text-2xl font-bold group-hover:text-accent">{post.title}</h3><p className="text-muted mt-3 leading-relaxed">{post.excerpt}</p>
            <p className="font-mono text-xs text-muted mt-6">{post.publishedAt?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {Math.max(1, Math.ceil(post.content.split(/\s+/).length / 200))} MIN READ</p>
          </Link>)}
        </div> : <div className="mission-card bg-[#fff0bc] flex flex-wrap items-center justify-between gap-6"><div><h3 className="font-display text-2xl font-bold">{logs.available ? "Every adventure starts with a first log." : "A little radio silence."}</h3><p className="text-muted mt-2">{logs.available ? "The launchpad is ready. Published stories will appear here." : "We couldn’t reach the journal database. Your stories haven’t been erased."}</p></div><Link href={logs.available ? "/post" : "/blogs"} className="launch-button">{logs.available ? "Write a transmission" : "Try the logs again"} ↗</Link></div>}
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-16"><div className="mission-card !p-0 overflow-hidden grid md:grid-cols-2 bg-[#e9efff]">
        {apod?.media_type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={apod.url} alt={apod.title} className="w-full h-full min-h-72 max-h-[520px] object-cover" loading="lazy" />
        ) : <div className="bg-[#142447] text-white flex flex-col items-center justify-center min-h-72 p-8 text-center"><span className="text-7xl mb-6" aria-hidden="true">✦</span><p className="eyebrow">The universe is worth a closer look.</p><a href="https://apod.nasa.gov/apod/astropix.html" target="_blank" rel="noopener noreferrer" className="underline mt-4">Open NASA&apos;s astronomy picture ↗</a></div>}
        <div className="p-7 sm:p-10"><p className="eyebrow text-accent mb-4">A little cosmic perspective · NASA APOD</p><h2 className="font-display text-3xl sm:text-4xl font-bold">{apod?.title || "Look up. There’s a whole universe out there."}</h2><p className="text-muted leading-relaxed mt-5">{apod ? apod.explanation : "NASA’s picture feed is temporarily unavailable. You can still explore the real astronomy archive directly—no invented space data here."}</p>{apod && <p className="font-mono text-xs text-muted mt-4">IMAGE DATE: {apod.date}{apod.copyright ? ` · Credit: ${apod.copyright}` : ""}</p>}<a href={apod?.sourceUrl || "https://science.nasa.gov/apod/"} target="_blank" rel="noopener noreferrer" className="inline-block font-bold text-accent mt-6">Explore NASA APOD ↗</a></div>
      </div></section>
      <section className="bg-[#a9efcb] border-y border-border"><div className="mx-auto max-w-6xl px-6 py-12 flex flex-wrap items-center justify-between gap-6"><div><p className="eyebrow mb-3">Stay curious, earthling.</p><h2 className="font-display text-3xl font-bold">The best part is figuring it out.</h2></div><Link href="/about" className="launch-button secondary">Meet the explorer ↗</Link></div></section>
    </div>
  );
}
