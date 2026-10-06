import Link from "next/link";
import { getSession, getRole } from "@/lib/session";
import {
  Bookmark,
  Follow,
  ReaderCollection,
  ReadingHistory,
  ReaderProfile,
} from "@/models/Reader";
import {
  createCollection,
  historyPreference,
  clearHistory,
} from "@/lib/actions/reader";
import { PageTitle } from "@/components/publication";
import { SaveControl } from "@/components/save-control";
import { SignOut } from "@/components/sign-out";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Your Mission Log",
  robots: { index: false, follow: false },
};
export default async function Account() {
  const s = await getSession();
  if (!s)
    return (
      <div className="shell">
        <PageTitle
          label="Your Mission Log"
          title="Keep what matters to you."
          description="Save a story, follow a topic, or collect images you want to return to. Public reading and live tools don’t require an account."
        />
        <div className="actions">
          <Link href="/signin?returnTo=/account" className="button">
            Sign in
          </Link>
          <Link href="/signup?returnTo=/account" className="button secondary">
            Create account
          </Link>
        </div>
        <p className="metadata">
          Private by default. Reading history is optional and starts disabled.
        </p>
      </div>
    );
  const uid = s.user.id;
  const [saved, follows, collections, history, profile, role] =
    await Promise.all([
      Bookmark.find({ userId: uid }).sort({ createdAt: -1 }).limit(200).lean(),
      Follow.find({ userId: uid }).sort({ createdAt: -1 }).limit(100).lean(),
      ReaderCollection.find({ userId: uid }).lean(),
      ReadingHistory.find({ userId: uid })
        .sort({ lastReadAt: -1 })
        .limit(50)
        .lean(),
      ReaderProfile.findOne({ userId: uid }).lean(),
      getRole(s.user),
    ]);
  return (
    <div className="shell">
      <PageTitle
        label="Your Mission Log / Private workspace"
        title={s.user.name || "Your log"}
        description={`${saved.length} saved · ${follows.length} following · ${collections.length} collections`}
      />
      <nav className="actions" aria-label="Account sections">
        <a href="#saved" className="tag">
          Saved
        </a>
        <a href="#following" className="tag">
          Following / Watchlist
        </a>
        <a href="#collections" className="tag">
          Collections
        </a>
        <a href="#history" className="tag">
          History & privacy
        </a>
        {role !== "user" && (
          <Link href="/studio" className="text-action">
            Editorial studio ↗
          </Link>
        )}
        <SignOut />
      </nav>
      <section id="saved">
        <h2 className="section-heading">Saved for later</h2>
        {saved.length ? (
          saved.map((b) => (
            <div className="account-row" key={b._id.toString()}>
              <div>
                <p className="eyebrow signal">{b.type}</p>
                <h3>
                  <Link href={b.href}>{b.title} ↗</Link>
                </h3>
              </div>
              <SaveControl kind="save" type={b.type} id={b.itemId} active />
            </div>
          ))
        ) : (
          <div className="empty-state">
            <h2>Your reading list is empty.</h2>
            <p className="muted">
              Save a story or NASA image and it will appear here.
            </p>
            <Link href="/latest" className="text-action">
              Find a story ↗
            </Link>
          </div>
        )}
      </section>
      <section id="following">
        <h2 className="section-heading">Following / Watchlist</h2>
        {follows.length ? (
          follows.map((f) => (
            <div className="account-row" key={f._id.toString()}>
              <div>
                <p className="eyebrow signal">{f.type}</p>
                <h3>
                  <Link href={f.href || "/topics"}>{f.title} ↗</Link>
                </h3>
                <p className="metadata">
                  {f.type === "asteroid"
                    ? "Open the object for its next listed approaches."
                    : "Open the topic for related stories and data."}
                </p>
              </div>
              <SaveControl kind="follow" type={f.type} id={f.itemId} active />
            </div>
          ))
        ) : (
          <div className="empty-state">
            <h2>Your watchlist is empty.</h2>
            <p className="muted">
              Follow an asteroid or topic to keep it close. This release does
              not send email or push alerts.
            </p>
            <Link href="/topics" className="text-action">
              Choose a subject ↗
            </Link>
          </div>
        )}
      </section>
      <section id="collections">
        <h2 className="section-heading">Your collections</h2>
        {collections.map((c) => (
          <div className="result-row" key={c.slug}>
            <p className="eyebrow">{c.visibility}</p>
            <h3 className="text-xl">
              <Link href={`/collections/${c.slug}`}>{c.name} ↗</Link>
            </h3>
          </div>
        ))}
        <form action={createCollection} className="filters">
          <label>
            New collection
            <input
              name="name"
              required
              maxLength={100}
              placeholder="e.g. Things I want to learn"
            />
          </label>
          <label>
            Visibility
            <select name="visibility" defaultValue="private">
              <option value="private">Private — only you</option>
              <option value="unlisted">Unlisted — anyone with link</option>
              <option value="public">Public — shareable</option>
            </select>
          </label>
          <button className="button secondary">Create collection</button>
        </form>
      </section>
      <section id="history">
        <h2 className="section-heading">Reading history & privacy</h2>
        <p className="muted mt-5">
          {profile?.recordHistory
            ? "Reading history is enabled. Progress is a scroll-based estimate, not proof of reading."
            : "Reading history is off. Enable it if you want to continue where you left off."}
        </p>
        <div className="actions">
          <form action={historyPreference}>
            <input
              type="hidden"
              name="enabled"
              value={profile?.recordHistory ? "false" : "true"}
            />
            <button className="button secondary">
              {profile?.recordHistory ? "Disable history" : "Enable history"}
            </button>
          </form>
          <form action={clearHistory}>
            <button className="text-action">Clear history</button>
          </form>
        </div>
        {history.map((h) => (
          <div className="result-row" key={h.slug}>
            <h3 className="text-xl">
              <Link href={`/articles/${h.slug}`}>{h.title} ↗</Link>
            </h3>
            <p className="metadata">
              {h.progress || 0}% scroll progress ·{" "}
              {h.lastReadAt?.toISOString().slice(0, 10)}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
