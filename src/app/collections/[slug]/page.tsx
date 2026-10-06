import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { Bookmark, ReaderCollection, CollectionItem } from "@/models/Reader";
import { connectToDatabase } from "@/lib/db";
import { addToCollection, removeCollectionItem } from "@/lib/actions/reader";
import { PageTitle } from "@/components/publication";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Collection",
  robots: { index: false, follow: false },
};
export default async function Collection({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!/^[a-f0-9-]{36}$/.test(slug)) notFound();
  await connectToDatabase();
  const c = await ReaderCollection.findOne({ slug }).lean();
  if (!c) notFound();
  const s = await getSession();
  const owner = s?.user.id === c.userId;
  if (c.visibility === "private" && !owner) notFound();
  const items = await CollectionItem.find({
    collectionId: c._id.toString(),
    userId: c.userId,
  }).lean();
  const saved = await Bookmark.find({
    userId: c.userId,
    ...(!owner ? { _id: { $in: items.map((i) => i.bookmarkId) } } : {}),
  }).lean();
  return (
    <div className="shell">
      <PageTitle
        label={`Collection / ${c.visibility}`}
        title={c.name}
        description={
          c.visibility === "private"
            ? "Only you can view this collection."
            : "This collection is shared by its owner. Personal account information is not included."
        }
      />
      {items.map((i) => {
        const b = saved.find((b) => b._id.toString() === i.bookmarkId);
        return b ? (
          <div className="account-row" key={i._id.toString()}>
            <div>
              <p className="eyebrow signal">{b.type}</p>
              <h3>
                <Link href={b.href}>{b.title} ↗</Link>
              </h3>
            </div>
            {owner && (
              <form action={removeCollectionItem}>
                <input type="hidden" name="id" value={i._id.toString()} />
                <button className="text-action">Remove</button>
              </form>
            )}
          </div>
        ) : null;
      })}
      {!items.length && (
        <p className="muted my-8">No items have been added yet.</p>
      )}
      {owner && (
        <>
          <form action={addToCollection} className="filters">
            <input type="hidden" name="collectionId" value={c._id.toString()} />
            <label>
              Add a saved item
              <select name="bookmarkId" required>
                <option value="">Choose a saved item</option>
                {saved.map((b) => (
                  <option key={b._id.toString()} value={b._id.toString()}>
                    {b.title}
                  </option>
                ))}
              </select>
            </label>
            <button className="button secondary" disabled={!saved.length}>
              Add to collection
            </button>
          </form>
          <Link href="/account#saved" className="text-action">
            Back to your log ↗
          </Link>
        </>
      )}
    </div>
  );
}
