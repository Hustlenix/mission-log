import type { MetadataRoute } from "next";
import { connectToDatabase } from "@/lib/db";
import { Post } from "@/models/Post";
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

  try {
    await connectToDatabase();
    const posts = await Post.find({ status: "published" }).lean();

    const postUrls = posts.map((post) => ({
      url: `${baseUrl}/blogs/${post.slug}`,
      lastModified: post.updatedAt || post.createdAt,
    }));

    return [
      { url: baseUrl, lastModified: new Date() },
      { url: `${baseUrl}/blogs`, lastModified: new Date() },
      { url: `${baseUrl}/about`, lastModified: new Date() },
      { url: `${baseUrl}/missions`, lastModified: new Date() },
      { url: `${baseUrl}/archive`, lastModified: new Date() },
      ...postUrls,
    ];
  } catch {
    return [
      { url: baseUrl, lastModified: new Date() },
      { url: `${baseUrl}/blogs`, lastModified: new Date() },
      { url: `${baseUrl}/about`, lastModified: new Date() },
      { url: `${baseUrl}/missions`, lastModified: new Date() },
      { url: `${baseUrl}/archive`, lastModified: new Date() },
    ];
  }
}
