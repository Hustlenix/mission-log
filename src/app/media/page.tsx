import Image from "next/image";
import Link from "next/link";
import { searchNasaMedia } from "@/lib/nasa/media";
import { PageTitle, Unavailable } from "@/components/publication";
import { FeedStamp } from "@/components/feed-stamp";
import { queryValue } from "@/lib/nasa/normalize";
export const dynamic = "force-dynamic";
export const metadata = { title: "NASA media archive" };
export default async function Media({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    type?: string;
    year?: string;
    center?: string;
  }>;
}) {
  const p = Object.fromEntries(
    Object.entries(await searchParams).map(([key, value]) => [
      key,
      queryValue(value),
    ]),
  ) as Record<string, string>;
  const q = (p.q || "Earth").slice(0, 120);
  const feed = await searchNasaMedia(q, p.type, p.year, p.center);
  return (
    <div className="shell">
      <PageTitle
        label="NASA image, video & audio library"
        title="The archive is wide open."
        description="Search the originals. Keep the credit and context with the image."
      />
      <form className="filters">
        <label>
          Search
          <input name="q" defaultValue={q} maxLength={120} />
        </label>
        <label>
          Media type
          <select name="type" defaultValue={p.type || "image"}>
            <option value="image">Images</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
          </select>
        </label>
        <label>
          Year
          <input
            name="year"
            inputMode="numeric"
            pattern="[0-9]{4}"
            placeholder="All years"
            defaultValue={p.year}
          />
        </label>
        <label>
          NASA centre
          <input
            name="center"
            maxLength={5}
            placeholder="e.g. JPL"
            defaultValue={p.center}
          />
        </label>
        <button className="button">Search archive</button>
      </form>
      <FeedStamp feed={feed} />
      {feed.data ? (
        <div className="media-grid">
          {feed.data.map((m) => (
            <article key={m.id}>
              <Link href={`/media/${encodeURIComponent(m.id)}`}>
                <div className="media-image">
                  {m.image ? (
                    <Image
                      src={m.image}
                      alt={m.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <span className="eyebrow">{m.type} / Open source</span>
                  )}
                </div>
                <p className="eyebrow signal mt-4">
                  {m.type} / {m.date.slice(0, 4)}
                </p>
                <h2 className="text-xl mt-2">{m.title}</h2>
              </Link>
              <p className="metadata mt-3">{m.credit}</p>
            </article>
          ))}
        </div>
      ) : (
        <Unavailable name="The NASA media archive" />
      )}
      {feed.data?.length === 0 && (
        <div className="empty-state">
          <h2>No matching NASA assets.</h2>
          <p className="muted">Try fewer filters or a broader subject.</p>
        </div>
      )}
    </div>
  );
}
