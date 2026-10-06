import type { MetadataRoute } from "next";
import { getArticles } from "@/lib/publication";
import { topics } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.BETTER_AUTH_URL || "https://mission-log-omega.vercel.app";
  const routes = [
    "",
    "/latest",
    "/topics",
    "/learn",
    "/live",
    "/live/asteroids",
    "/live/space-weather",
    "/live/earth",
    "/media",
    "/daily",
    "/iss",
    "/generation",
    "/future",
    "/about",
    "/missions",
    "/archive",
  ];
  const posts = await getArticles();
  return [
    ...routes.map((path) => ({ url: `${base}${path}` })),
    ...topics.map((t) => ({ url: `${base}/topics/${t.slug}` })),
    ...(posts || []).map((p) => ({
      url: `${base}/articles/${p.slug}`,
      lastModified: p.updatedAt,
    })),
  ];
}
