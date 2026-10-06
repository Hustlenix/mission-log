import { notFound } from "next/navigation";
import { getNasaMedia } from "@/lib/nasa/media";
import { PageTitle, Figure, Unavailable } from "@/components/publication";
import { FeedStamp } from "@/components/feed-stamp";
import { ItemActions } from "@/components/item-actions";
export const dynamic = "force-dynamic";
export default async function MediaDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[a-z0-9_.-]{1,150}$/i.test(id)) notFound();
  const feed = await getNasaMedia(id);
  if (feed.data?.length === 0) notFound();
  const m = feed.data?.[0];
  return (
    <div className="shell">
      {m ? (
        <>
          <PageTitle label={`NASA archive / ${m.type}`} title={m.title} />
          {m.image && (
            <Figure
              src={m.image}
              alt={m.title}
              credit={`${m.credit} · NASA asset ${m.id}`}
            />
          )}
          <div className="article-body">
            <p className="metadata">
              {m.date.slice(0, 10)} · {m.id}
            </p>
            <p className="dek mt-5 whitespace-pre-line">{m.description}</p>
            <div className="actions">
              <a
                className="button secondary"
                href={m.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {m.type === "image"
                  ? "Original & downloads"
                  : "Play or download at NASA"}{" "}
                ↗
              </a>
              <ItemActions
                type="media"
                id={m.id}
                href={`/media/${encodeURIComponent(m.id)}`}
              />
            </div>
            <p className="muted text-sm">
              NASA archive metadata. Check the original’s credit and usage
              restrictions before commercial use; third-party rights may apply.
              Mission Log does not claim ownership.
            </p>
            <FeedStamp feed={feed} />
          </div>
        </>
      ) : (
        <Unavailable name="This asset" />
      )}
    </div>
  );
}
