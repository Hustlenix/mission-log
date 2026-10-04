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
    const missionMap = new Map<string, { name: string; count: number; tags: Set<string> }>();
    for (const post of posts) {
      const existing = missionMap.get(post.project);
      if (existing) {
        existing.count++;
        post.tags.forEach((t) => existing.tags.add(t));
      } else {
        missionMap.set(post.project, {
          name: post.project,
          count: 1,
          tags: new Set(post.tags),
        });
      }
    }
    return Array.from(missionMap.values()).map((m) => ({
      ...m,
      tags: Array.from(m.tags),
    }));
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
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-4xl">
            <p className="font-mono text-xs text-muted tracking-widest mb-8">
              MISSION CONTROL // STARDANCE 2026
            </p>
            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight mb-8">
              Building things
              <br />
              <span className="italic font-semibold">until they work.</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted leading-relaxed max-w-2xl mb-12">
              I&apos;m Lalith. I build games, hardware, websites, and projects that probably should have
              remained ideas. This is where I document what worked, what broke, and what I learned.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link
                href="/blogs"
                className="font-mono text-sm text-foreground hover:text-accent transition-colors"
              >
                READ LATEST LOG <span aria-hidden="true">&rarr;</span>
              </Link>
              <Link
                href="/missions"
                className="font-mono text-sm text-muted hover:text-foreground transition-colors"
              >
                VIEW MISSIONS <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Status */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
          <div className="flex flex-wrap gap-8 sm:gap-16">
            <div>
              <p className="font-mono text-xs text-muted mb-1">STATUS</p>
              <p className="font-mono text-sm text-success font-semibold">ACTIVE</p>
            </div>
            <div>
              <p className="font-mono text-xs text-muted mb-1">PUBLISHED LOGS</p>
              <p className="font-mono text-sm">{posts.length}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-muted mb-1">ACTIVE MISSIONS</p>
              <p className="font-mono text-sm">{missions.length}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-muted mb-1">LATEST</p>
              <p className="font-mono text-sm">
                {latestPost?.publishedAt
                  ? new Date(latestPost.publishedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit" }).toUpperCase()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Transmission */}
      {latestPost && (
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
            <p className="font-mono text-xs text-muted tracking-widest mb-6">LATEST TRANSMISSION</p>
            <Link href={`/blogs/${latestPost.slug}`} className="group block">
              <div className="border-l-2 border-accent pl-6 sm:pl-10">
                <p className="font-mono text-xs text-accent tracking-widest mb-3">
                  {latestPost.project.toUpperCase()}
                </p>
                <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight mb-4 group-hover:text-accent transition-colors">
                  {latestPost.title}
                </h2>
                <p className="text-muted leading-relaxed max-w-2xl mb-4">{latestPost.excerpt}</p>
                <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-muted">
                  <span>
                    {latestPost.publishedAt
                      ? new Date(latestPost.publishedAt).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()
                      : ""}
                  </span>
                  <span>{Math.max(1, Math.round(latestPost.content.split(/\s+/).length / 200))} MIN READ</span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Current Missions */}
      {missions.length > 0 && (
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
            <p className="font-mono text-xs text-muted tracking-widest mb-8">CURRENT MISSIONS</p>
            <div className="space-y-0">
              {missions.map((m) => (
                <Link
                  key={m.name}
                  href={`/missions/${m.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="group flex items-baseline justify-between py-5 border-b border-border last:border-0 hover:bg-surface/50 transition-colors -mx-4 px-4 sm:-mx-6 sm:px-6"
                >
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-semibold group-hover:text-accent transition-colors">
                      {m.name}
                    </h3>
                    <p className="font-mono text-xs text-muted mt-1">{m.tags.join(" / ")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs text-muted">{m.count} LOGS</p>
                    <p className="font-mono text-xs text-success">ACTIVE</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Logs */}
      {recentLogs.length > 0 && (
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
            <p className="font-mono text-xs text-muted tracking-widest mb-8">RECENT LOGS</p>
            <div className="space-y-0">
              {recentLogs.map((post, i) => (
                <Link
                  key={post._id.toString()}
                  href={`/blogs/${post.slug}`}
                  className="group flex items-baseline gap-6 py-4 border-b border-border last:border-0 hover:bg-surface/50 transition-colors -mx-4 px-4 sm:-mx-6 sm:px-6"
                >
                  <span className="font-mono text-xs text-muted w-10 shrink-0">
                    {String(i + 1).padStart(3, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg group-hover:text-accent transition-colors truncate">
                      {post.title}
                    </h3>
                    <p className="font-mono text-xs text-muted mt-1">{post.project}</p>
                  </div>
                  <span className="font-mono text-xs text-muted shrink-0 hidden sm:block">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("en-US", { day: "2-digit", month: "short" }).toUpperCase()
                      : ""}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sky Now - NASA APOD */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <p className="font-mono text-xs text-muted tracking-widest">SKY NOW</p>
            <span className="font-mono text-xs text-muted">NASA</span>
          </div>
          {apod ? (
            <div className="grid sm:grid-cols-2 gap-8 items-start">
              <div>
                <p className="font-mono text-xs text-accent tracking-widest mb-4">
                  ASTRONOMY PICTURE OF THE DAY
                </p>
                {apod.media_type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={apod.url}
                    alt={apod.title}
                    className="w-full aspect-square object-cover"
                  />
                ) : (
                  <div className="aspect-square bg-surface flex items-center justify-center">
                    <p className="font-mono text-sm text-muted">VIDEO</p>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mb-4">
                  {apod.title}
                </h3>
                <p className="text-muted leading-relaxed mb-6">{apod.explanation}</p>
                <a
                  href={apod.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-accent hover:text-accent-dim transition-colors"
                >
                  VIEW SOURCE <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="border border-border bg-surface p-8">
              <p className="font-mono text-xs text-danger tracking-widest mb-2">SPACE FEED OFFLINE</p>
              <p className="text-muted">NASA data is temporarily unavailable.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
