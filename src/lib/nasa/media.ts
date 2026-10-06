import { cachedNasa, nasaJson } from "./client";
import { plainText, safeUrl } from "./normalize";
import type { MediaItem } from "./types";
type RawMedia = {
  data: {
    nasa_id: string;
    title: string;
    description: string;
    date_created: string;
    media_type: string;
    center: string;
    photographer?: string;
    secondary_creator?: string;
  }[];
  links?: { href: string; rel: string }[];
};
function normalize(items: RawMedia[]): MediaItem[] {
  return items.map((p) => {
    const d = p.data?.[0];
    if (!d?.nasa_id) throw new Error("Invalid media");
    return {
      id: d.nasa_id,
      title: plainText(d.title),
      description: plainText(d.description).slice(0, 4500),
      date: d.date_created,
      type: d.media_type,
      image: safeUrl(p.links?.find((l) => l.rel === "preview")?.href),
      credit: plainText(
        d.photographer || d.secondary_creator || `NASA / ${d.center}`,
      ),
      sourceUrl: `https://images.nasa.gov/details/${encodeURIComponent(d.nasa_id)}`,
    };
  });
}
export function searchNasaMedia(
  q = "Earth",
  type = "image",
  year?: string,
  center?: string,
) {
  const query = q.trim().slice(0, 120) || "Earth";
  const kind = ["image", "video", "audio"].includes(type) ? type : "image";
  const params = new URLSearchParams({
    q: query,
    media_type: kind,
    page_size: "24",
  });
  if (year && /^\d{4}$/.test(year)) {
    params.set("year_start", year);
    params.set("year_end", year);
  }
  if (center && /^[A-Z]{2,5}$/.test(center)) params.set("center", center);
  return cachedNasa<MediaItem[]>(
    `media:${params}`,
    "https://images.nasa.gov/",
    21600,
    async () => {
      const raw = (await nasaJson(
        `https://images-api.nasa.gov/search?${params}`,
        false,
      )) as { collection: { items: RawMedia[] } };
      return normalize(raw.collection.items);
    },
  );
}
export function getNasaMedia(id: string) {
  return cachedNasa<MediaItem[]>(
    `media-id:${id}`,
    "https://images.nasa.gov/",
    86400,
    async () => {
      if (!/^[a-z0-9_.-]{1,150}$/i.test(id))
        throw new Error("Invalid media ID");
      const r = (await nasaJson(
        `https://images-api.nasa.gov/search?nasa_id=${encodeURIComponent(id)}`,
        false,
      )) as { collection: { items: RawMedia[] } };
      return normalize(r.collection.items);
    },
  );
}
