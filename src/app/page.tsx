import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import { Post } from "@/models/Post";
import { getApod } from "@/lib/nasa";

export const dynamic = "force-dynamic";

async function getPosts() {
  try {
    await connectToDatabase();
    return await Post.find({ status: "published" }).sort({ publishedAt: -1 }).limit(10).lean();
  } catch {
    return [];
  }
}

async function getMissions() {
  try {
    await connectToDatabase();
    const posts = await Post.find({ status: "published" }).lean();
    const missionMap = new Map<string, { name: string; count: number; status: string }>();
    for (const post of posts) {
      const existing = missionMap.get(post.project);
      if (existing) {
        existing.count++;
      } else {
        missionMap.set(post.project, { name: post.project, count: 1, status: "ACTIVE" });
      }
    }
    return Array.from(missionMap.values()).slice(0, 3);
  } catch {
    return [];
  }
}

export default async function Home() {
  const [posts, missions, apod] = await Promise.all([getPosts(), getMissions(), getApod()]);
  const latestPost = posts[0];
  const recentLogs = posts.slice(0, 5);

  return (
    <div className="noise-bg">
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-32">
          <div className="max-w-3xl">
            <p className="font-mono text-xs text-accent tracking-widest mb-6">
              MISSION CONTROL // STARDANCE 2026
            </p>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight mb-6">
              BUILDING THINGS
              <br />
              UNTIL THEY WORK.
            </h1>
            <p className="text-lg sm:text-xl text-muted leading-relaxed max-w-xl mb-10">
              Projects, failures, experiments and everything I learn while shipping through Stardance.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/blogs"
                className="inline-flex items-center gap-2 bg-accent text-background font-mono text-sm font-semibold px-6 py-3 hover:bg-accent-dim transition-colors"
              >
                READ LATEST LOG
                <span aria-hidden="true">&rarr;</span>
              </Link>
              <Link
                href="/missions"
                className="inline-flex items-center gap-2 border border-border text-foreground font-mono text-sm px-6 py-3 hover:border-accent hover:text-accent transition-colors"
              >
                VIEW MISSIONS
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Status */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          <h2 className="font-mono text-xs text-muted tracking-widest mb-8">MISSION STATUS</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="font-mono text-xs text-muted mb-1">STARDANCE</p>
              <p className="font-mono text-sm text-success font-semibold">ACTIVE</p>
            </div>
            <div>
              <p className="font-mono text-xs text-muted mb-1">LATEST LOG</p>
              <p className="font-mono text-sm text-foreground">
                {latestPost?.publishedAt
                  ? new Date(latestPost.publishedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit" }).toUpperCase()
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="font-mono text-xs text-muted mb-1">PUBLISHED</p>
              <p className="font-mono text-sm text-foreground">{posts.length}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-muted mb-1">ACTIVE BUILDS</p>
              <p className="font-mono text-sm text-foreground">{missions.length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Transmission */}
      {latestPost && (
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
            <h2 className="font-mono text-xs text-muted tracking-widest mb-8">LATEST TRANSMISSION</h2>
            <Link href={`/blogs/${latestPost.slug}`} className="group block">
              <div className="border border-border bg-surface p-6 sm:p-10 hover:border-accent/50 transition-colors">
                <p className="font-mono text-xs text-accent tracking-widest mb-4">
                  MISSION LOG {String(posts.indexOf(latestPost) + 1).padStart(3, "0")}
                </p>
                <h3 className="text-2xl sm:text-4xl font-bold tracking-tight mb-4 group-hover:text-accent transition-colors">
                  {latestPost.title}
                </h3>
                <p className="text-muted leading-relaxed max-w-2xl mb-6">{latestPost.excerpt}</p>
                <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-muted">
                  <span className="text-foreground">{latestPost.project}</span>
                  <span>{latestPost.tags.join(" · ")}</span>
                  <span>{Math.max(1, Math.round(latestPost.content.split(/\s+/).length / 200))} MIN</span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Current Missions */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <h2 className="font-mono text-xs text-muted tracking-widest mb-8">CURRENT MISSIONS</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {missions.map((m) => (
              <Link
                key={m.name}
                href={`/missions/${m.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="group border border-border bg-surface p-6 hover:border-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-lg group-hover:text-accent transition-colors">{m.name}</h3>
                  <span className="font-mono text-xs px-2 py-1 text-success">{m.status}</span>
                </div>
                <p className="text-muted text-sm mb-4">{m.count} LOGS</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Logs */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <h2 className="font-mono text-xs text-muted tracking-widest mb-8">RECENT LOGS</h2>
          <div className="divide-y divide-border">
            {recentLogs.map((post, i) => (
              <Link
                key={post._id.toString()}
                href={`/blogs/${post.slug}`}
                className="group flex items-baseline gap-4 py-4 hover:bg-surface/50 transition-colors"
              >
                <span className="font-mono text-xs text-muted w-8 shrink-0">
                  {String(i + 1).padStart(3, "0")}
                </span>
                <span className="font-medium group-hover:text-accent transition-colors flex-1">
                  {post.title}
                </span>
                <span className="font-mono text-xs text-muted hidden sm:block">{post.project}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Sky Now - NASA APOD */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-mono text-xs text-muted tracking-widest">SKY NOW</h2>
            <span className="font-mono text-xs text-muted">NASA &middot; LIVE</span>
          </div>
          {apod ? (
            <div className="border border-border bg-surface p-6 sm:p-10">
              <p className="font-mono text-xs text-accent tracking-widest mb-4">
                ASTRONOMY PICTURE OF THE DAY
              </p>
              {apod.media_type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={apod.url}
                  alt={apod.title}
                  className="w-full aspect-video object-cover mb-6"
                />
              ) : (
                <div className="aspect-video bg-surface-raised mb-6 flex items-center justify-center">
                  <p className="font-mono text-sm text-muted">VIDEO CONTENT</p>
                </div>
              )}
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">{apod.title}</h3>
              <p className="text-muted leading-relaxed max-w-2xl mb-4">{apod.explanation}</p>
              <a
                href={apod.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-accent hover:text-accent-dim transition-colors"
              >
                VIEW NASA SOURCE &rarr;
              </a>
            </div>
          ) : (
            <div className="border border-border bg-surface p-6 sm:p-10">
              <p className="font-mono text-xs text-danger tracking-widest mb-4">SPACE FEED OFFLINE</p>
              <p className="text-muted">NASA data is temporarily unavailable.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
