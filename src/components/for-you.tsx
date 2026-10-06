import Link from "next/link";
import { getSession } from "@/lib/session";
import { getArticles } from "@/lib/publication";
import { Follow, ReadingHistory, ReaderProfile } from "@/models/Reader";
import { SectionHeading, StoryRow } from "./publication";
async function loadPersonalized() {
  try {
    const s = await getSession();
    if (!s) return null;
    const [follows, posts, profile] = await Promise.all([
      Follow.find({ userId: s.user.id, type: "topic" }).lean(),
      getArticles(),
      ReaderProfile.findOne({ userId: s.user.id }).lean(),
    ]);
    const followed = new Set(follows.map((f) => f.itemId));
    const selected =
      posts
        ?.filter((p) => p.topicIds?.some((t) => followed.has(t)))
        .slice(0, 3) || [];
    const history = profile?.recordHistory
      ? await ReadingHistory.find({
          userId: s.user.id,
          completed: { $ne: true },
        })
          .sort({ lastReadAt: -1 })
          .limit(1)
          .lean()
      : [];
    return { selected, history };
  } catch {
    return null;
  }
}
export async function ForYou() {
  const data = await loadPersonalized();
  if (!data) return null;
  const { selected, history } = data;
  return (
    <section>
      <SectionHeading title="For your curiosity" href="/account" />
      <p className="metadata">
        Stories from topics you follow. No hidden recommendation score.
      </p>
      {selected.length ? (
        selected.map((p) => <StoryRow key={p.slug} post={p} />)
      ) : (
        <p className="muted my-6">
          Follow a topic to make this space yours.{" "}
          <Link className="text-action" href="/topics">
            Choose a subject ↗
          </Link>
        </p>
      )}
      {history.map((h) => (
        <p className="metadata my-6" key={h.slug}>
          Continue:{" "}
          <Link className="text-action" href={`/articles/${h.slug}`}>
            {h.title} ↗
          </Link>{" "}
          · {h.progress}% scroll progress
        </p>
      ))}
    </section>
  );
}
