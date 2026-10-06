import Link from "next/link";
import { getSession } from "@/lib/session";
import { Bookmark, Follow } from "@/models/Reader";
import { SaveControl } from "./save-control";
export async function ItemActions({
  type,
  id,
  href,
  follow = false,
}: {
  type: string;
  id: string;
  href: string;
  follow?: boolean;
}) {
  let session;
  try {
    session = await getSession();
  } catch {
    return <p className="metadata">Account actions temporarily unavailable.</p>;
  }
  if (!session)
    return (
      <Link
        className="button secondary"
        href={`/signin?returnTo=${encodeURIComponent(href)}`}
      >
        Sign in to {follow ? "follow" : "save"} ↗
      </Link>
    );
  const [saved, followed] = await Promise.all([
    Bookmark.exists({ userId: session.user.id, type, itemId: id }),
    follow
      ? Follow.exists({ userId: session.user.id, type, itemId: id })
      : Promise.resolve(null),
  ]);
  return (
    <div className="actions">
      <SaveControl kind="save" type={type} id={id} active={!!saved} />
      {follow && (
        <SaveControl kind="follow" type={type} id={id} active={!!followed} />
      )}
    </div>
  );
}
