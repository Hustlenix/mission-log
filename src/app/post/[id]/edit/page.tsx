import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { requireAuthor } from "@/lib/author";
import { Post } from "@/models/Post";
import { PostEditor } from "@/components/post-editor";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuthor();
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();
  const post = await Post.findById(id).lean();
  if (!post) notFound();
  return <PostEditor post={{ id: post._id.toString(), title: post.title, excerpt: post.excerpt, content: post.content, project: post.project, tags: post.tags, status: post.status }} />;
}
