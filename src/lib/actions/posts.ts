"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import { Post } from "@/models/Post";
import { getAuth } from "@/lib/auth";

function isAuthorizedAuthor(email: string | null | undefined): boolean {
  if (!email) return false;
  const authorized = process.env.AUTHORIZED_AUTHOR_EMAILS;
  if (!authorized) return false;
  return authorized.split(",").map((e) => e.trim().toLowerCase()).includes(email.toLowerCase());
}

export async function createPost(formData: FormData) {
  const auth = await getAuth();
  const session = await auth.api.getSession();

  if (!session?.user?.email || !isAuthorizedAuthor(session.user.email)) {
    return { error: "DENIED: Not authorized to publish" };
  }

  const title = formData.get("title") as string;
  const excerpt = formData.get("excerpt") as string;
  const content = formData.get("content") as string;
  const project = formData.get("project") as string;
  const tags = (formData.get("tags") as string || "").split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
  const status = formData.get("status") as "draft" | "published";

  if (!title || !excerpt || !content || !project) {
    return { error: "Missing required fields" };
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  await connectToDatabase();

  const existing = await Post.findOne({ slug });
  if (existing) {
    return { error: "A post with this title already exists" };
  }

  const post = await Post.create({
    slug,
    title,
    excerpt,
    content,
    project,
    tags,
    status,
    publishedAt: status === "published" ? new Date() : undefined,
    authorId: session.user.id,
  });

  revalidatePath("/");
  revalidatePath("/blogs");
  revalidatePath("/archive");

  if (status === "published") {
    redirect(`/blogs/${post.slug}`);
  }
  return { success: true, slug: post.slug };
}

export async function updatePost(id: string, formData: FormData) {
  const auth = await getAuth();
  const session = await auth.api.getSession();

  if (!session?.user?.email || !isAuthorizedAuthor(session.user.email)) {
    return { error: "DENIED: Not authorized to edit" };
  }

  const title = formData.get("title") as string;
  const excerpt = formData.get("excerpt") as string;
  const content = formData.get("content") as string;
  const project = formData.get("project") as string;
  const tags = (formData.get("tags") as string || "").split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
  const status = formData.get("status") as "draft" | "published";

  if (!title || !excerpt || !content || !project) {
    return { error: "Missing required fields" };
  }

  await connectToDatabase();

  const post = await Post.findById(id);
  if (!post) {
    return { error: "Post not found" };
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  post.title = title;
  post.slug = slug;
  post.excerpt = excerpt;
  post.content = content;
  post.project = project;
  post.tags = tags;
  post.status = status;
  if (status === "published" && !post.publishedAt) {
    post.publishedAt = new Date();
  }

  await post.save();

  revalidatePath("/");
  revalidatePath("/blogs");
  revalidatePath(`/blogs/${slug}`);
  revalidatePath("/archive");

  return { success: true, slug };
}

export async function deletePost(id: string) {
  const auth = await getAuth();
  const session = await auth.api.getSession();

  if (!session?.user?.email || !isAuthorizedAuthor(session.user.email)) {
    return { error: "DENIED: Not authorized to delete" };
  }

  await connectToDatabase();

  const post = await Post.findByIdAndDelete(id);
  if (!post) {
    return { error: "Post not found" };
  }

  revalidatePath("/");
  revalidatePath("/blogs");
  revalidatePath("/archive");

  redirect("/blogs");
}
