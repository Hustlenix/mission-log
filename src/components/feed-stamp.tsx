import type { Feed } from "@/lib/nasa/types";
export function FeedStamp({
  feed,
}: {
  feed: Pick<Feed<unknown>, "fetchedAt" | "stale" | "source">;
}) {
  return (
    <p className="metadata my-5">
      {feed.fetchedAt
        ? `${feed.stale ? "Cached / refresh unavailable · " : ""}Fetched ${new Date(feed.fetchedAt).toLocaleString("en-GB", { timeZone: "UTC" })} UTC · `
        : ""}
      <a
        href={feed.source}
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        NASA source ↗
      </a>
    </p>
  );
}
