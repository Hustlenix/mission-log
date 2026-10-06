import { connectToDatabase } from "./db";
import { Post } from "@/models/Post";
import { topics } from "./catalog";
import { publicFilter } from "./publication";
import { searchNasaMedia } from "./nasa/media";
import { getNearEarthObjects, getAsteroidById } from "./nasa/neo";
export type SearchResult = {
  id: string;
  type: string;
  title: string;
  description: string;
  href: string;
};
export function normalizeQuery(input: unknown) {
  return typeof input === "string" ? input.trim().slice(0, 120) : "";
}
export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
export async function searchPublication(input: unknown) {
  const q = normalizeQuery(input);
  const results: SearchResult[] = [];
  let unavailable = false;
  if (!q) return { results, unavailable };
  const text = new RegExp(escapeRegex(q), "i");
  for (const t of topics.filter((t) =>
    text.test(`${t.name} ${t.slug} ${t.description}`),
  ))
    results.push({
      id: t.slug,
      type: "Topic",
      title: t.name,
      description: t.description,
      href: `/topics/${t.slug}`,
    });
  try {
    await connectToDatabase();
    const articles = await Post.find({
      $and: [
        publicFilter(),
        {
          $or: [
            { title: text },
            { excerpt: text },
            { content: text },
            { tags: text },
          ],
        },
      ],
    })
      .sort({ publishedAt: -1 })
      .limit(25)
      .lean();
    for (const p of articles)
      results.push({
        id: p.slug,
        type: p.contentType === "explainer" ? "Explainer" : "Article",
        title: p.title,
        description: p.excerpt,
        href: `/articles/${p.slug}`,
      });
  } catch {
    unavailable = true;
  }
  const [media, neo, object] = await Promise.all([
    searchNasaMedia(q),
    getNearEarthObjects(),
    /apophis/i.test(q)
      ? getAsteroidById("2099942")
      : /^\d{7,9}$/.test(q)
        ? getAsteroidById(q)
        : Promise.resolve(null),
  ]);
  for (const m of media.data?.slice(0, 8) || [])
    results.push({
      id: m.id,
      type: "NASA media",
      title: m.title,
      description: m.description.slice(0, 220),
      href: `/media/${encodeURIComponent(m.id)}`,
    });
  const objects = [
    ...(object?.data ? [object.data] : []),
    ...(neo.data?.filter((o) => text.test(`${o.name} ${o.id}`)) || []),
  ];
  for (const o of objects
    .filter((o, i, all) => all.findIndex((x) => x.id === o.id) === i)
    .slice(0, 10))
    results.push({
      id: o.id,
      type: "Asteroid",
      title: o.name,
      description: `NASA ID ${o.id} · Estimated diameter ${Math.round(o.diameterMin)}–${Math.round(o.diameterMax)} m · NASA PHA: ${o.hazardous ? "Yes" : "No"}`,
      href: `/live/asteroids/${o.id}`,
    });
  return { results, unavailable, nasaUnavailable: !media.data || !neo.data };
}
