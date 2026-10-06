import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { requireAuthor } from "@/lib/author";
import { getRole } from "@/lib/session";
import { Post } from "@/models/Post";
import { PostEditor } from "@/components/post-editor";
export default async function Edit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuthor();
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();
  const p = await Post.findById(id).lean();
  if (
    !p ||
    ((await getRole(session.user)) === "author" &&
      p.authorId !== session.user.id)
  )
    notFound();
  return (
    <PostEditor
      post={{
        id: p._id.toString(),
        title: p.title,
        slug: p.slug,
        subtitle: p.subtitle || "",
        excerpt: p.excerpt,
        content: p.content,
        project: p.project,
        tags: p.tags.join(", "),
        topicIds: p.topicIds?.join(", ") || "",
        contentType: p.contentType || "mission-log",
        coverImage: p.coverImage || "",
        coverAlt: p.coverAlt || "",
        imageCredit: p.imageCredit || "",
        sources:
          p.sources?.map((s) => `${s.title} | ${s.url}`).join("\n") || "",
        editorialNote: p.editorialNote || "",
        seoTitle: p.seoTitle || "",
        seoDescription: p.seoDescription || "",
        status: p.status,
        scheduledAt: p.scheduledAt?.toISOString().slice(0, 16) || "",
        featured: p.featured,
      }}
    />
  );
}
