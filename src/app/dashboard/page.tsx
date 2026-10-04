import Link from "next/link";
import { requireAuthor } from "@/lib/author";
import { Post } from "@/models/Post";

export const dynamic = "force-dynamic";
export default async function Dashboard() {
  await requireAuthor();
  const posts = await Post.find().sort({ updatedAt: -1 }).lean();
  return <div className="mx-auto max-w-6xl px-6 py-12"><div className="flex flex-wrap justify-between gap-5 items-center mb-8"><div><p className="eyebrow text-accent mb-3">Author launchpad</p><h1 className="font-display text-4xl font-bold">Your transmissions.</h1></div><Link href="/post" className="launch-button">New log ↗</Link></div><div className="grid md:grid-cols-2 gap-5">{posts.map(post=><div key={post._id.toString()} className="mission-card"><p className="eyebrow text-accent mb-3">{post.status} · {post.project}</p><h2 className="font-display text-2xl font-bold">{post.title}</h2><p className="text-muted mt-3">{post.excerpt}</p><div className="flex gap-5 mt-6"><Link href={`/post/${post._id}/edit`} className="font-bold text-accent">Edit log ↗</Link>{post.status === "published" && <Link href={`/blogs/${post.slug}`}>Read ↗</Link>}</div></div>)}</div>{!posts.length && <p className="mission-card">No drafts or published logs yet. Start your first transmission!</p>}</div>;
}
