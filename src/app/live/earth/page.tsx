import Link from "next/link";
import Image from "next/image";
import { getEarthImages } from "@/lib/nasa/epic";
import { FeedStamp } from "@/components/feed-stamp";
import { PageTitle, Unavailable } from "@/components/publication";
import { queryValue } from "@/lib/nasa/normalize";
export const dynamic = "force-dynamic";
export const metadata = { title: "Earth imagery / EPIC" };
export default async function Earth({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; date?: string; frame?: string }>;
}) {
  const p = Object.fromEntries(
    Object.entries(await searchParams).map(([key, value]) => [
      key,
      queryValue(value),
    ]),
  ) as Record<string, string>;
  const mode = p.mode === "enhanced" ? "enhanced" : "natural";
  const feed = await getEarthImages(mode, p.date);
  const frames = feed.data || [];
  const index = Math.max(
    0,
    Math.min(frames.length - 1, Math.floor(Number(p.frame) || 0)),
  );
  const frame = frames[index];
  const href = (i: number) =>
    `/live/earth?${new URLSearchParams({ mode, ...(p.date ? { date: p.date } : {}), frame: String(i) })}`;
  return (
    <div className="shell">
      <PageTitle
        label="DSCOVR / EPIC"
        title="One planet. A whole perspective."
        description="Latest available imagery, not a live camera. The capture date may be earlier than today."
      />
      <form className="filters">
        <label>
          Image product
          <select name="mode" defaultValue={mode}>
            <option value="natural">Natural colour</option>
            <option value="enhanced">Enhanced</option>
          </select>
        </label>
        <label>
          Capture date (optional)
          <input type="date" name="date" defaultValue={p.date} />
        </label>
        <button className="button secondary">Load imagery</button>
        <Link href="/live/earth" className="text-action">
          Latest available ↗
        </Link>
      </form>
      <FeedStamp feed={feed} />
      {frame ? (
        <>
          <div className="earth-layout">
            <div className="earth-canvas">
              <Image
                src={frame.image}
                alt={`${mode} EPIC view of Earth captured ${frame.date} UTC`}
                fill
                sizes="(max-width: 768px) 100vw, 65vw"
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
            <aside>
              <p className="eyebrow signal">Capture time</p>
              <h2 className="text-3xl my-4">
                {frame.date.slice(0, 10)}
                <br />
                {frame.date.slice(11)} UTC
              </h2>
              <p className="muted leading-relaxed">{frame.caption}</p>
              <dl className="my-6">
                <dt className="eyebrow">Image centre</dt>
                <dd className="my-3">
                  {frame.lat.toFixed(2)}° latitude
                  <br />
                  {frame.lon.toFixed(2)}° longitude
                </dd>
                <dt className="eyebrow">Product</dt>
                <dd className="my-3">
                  {mode} · Frame {index + 1} / {frames.length}
                </dd>
              </dl>
              <div className="actions">
                <a
                  href={frame.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-action"
                >
                  Open NASA image ↗
                </a>
                <Link
                  href="/articles/earth-in-one-frame"
                  className="text-action"
                >
                  How to read this image ↗
                </Link>
              </div>
            </aside>
          </div>
          <nav aria-label="Image timeline" className="actions">
            {index > 0 && (
              <Link className="button secondary" href={href(index - 1)}>
                ← Previous frame
              </Link>
            )}
            {index < frames.length - 1 && (
              <Link className="button secondary" href={href(index + 1)}>
                Next frame →
              </Link>
            )}
          </nav>
          <p className="metadata">
            NASA / EPIC. Product processing affects appearance. View the source
            for instrument details.
          </p>
        </>
      ) : feed.data ? (
        <div className="empty-state">
          <h2>No frames for this date/product.</h2>
          <Link href="/live/earth" className="text-action">
            Show latest available imagery ↗
          </Link>
        </div>
      ) : (
        <Unavailable name="Earth imagery" />
      )}
    </div>
  );
}
