import { cache } from "react";
import { connectToDatabase } from "./db";
import { Post } from "@/models/Post";

// Scheduled records are visible only after their server-validated publication time.
export function publicFilter() {
  return {
    $or: [
      { status: "published" as const },
      { status: "scheduled" as const, scheduledAt: { $lte: new Date() } },
    ],
    slug: { $not: /^temp-seed-log-/ },
  };
}
export async function getArticles(topic?: string) {
  try {
    await connectToDatabase();
    return await Post.find({
      ...publicFilter(),
      ...(topic ? { topicIds: topic } : {}),
    })
      .sort({ featured: -1, publishedAt: -1 })
      .limit(60)
      .lean();
  } catch {
    return null;
  }
}
export const getArticle = cache(async (slug: string) => {
  if (slug.startsWith("temp-seed-log-")) return null;
  await connectToDatabase();
  return Post.findOne({ ...publicFilter(), slug }).lean();
});
