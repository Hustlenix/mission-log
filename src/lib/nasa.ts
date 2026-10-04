export interface ApodData {
  title: string;
  explanation: string;
  url: string;
  date: string;
  media_type: string;
  copyright?: string;
  sourceUrl?: string;
}

export interface NeoData {
  objectsTracked: number;
  closestApproach: string;
  fastest: string;
}

const NASA_API_KEY = process.env.NASA_API_KEY || "DEMO_KEY";

export async function getApod(): Promise<ApodData | null> {
  // NASA's legacy API can return the site logo after the APOD site migration.
  // Prefer the current, dated NASA Science entry over that stale response.
  const current = await getPublicApod();
  if (current) return current;
  try {
    const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(7000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.title && data.url && data.date && data.title !== "NASA Science" && !/logo/i.test(data.url)) return data;
    }
  } catch {
    // The API can fail independently of NASA's public APOD page.
  }
  return null;
}

function plainText(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&#x([a-f0-9]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#039;|&apos;/g, "'").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
}

// Fail closed if NASA changes its page markup. Never manufacture an APOD.
async function getPublicApod(): Promise<ApodData | null> {
  try {
    const response = await fetch("https://science.nasa.gov/apod/", { next: { revalidate: 3600 }, signal: AbortSignal.timeout(7000) });
    if (!response.ok) return null;
    const html = await response.text();
    const start = html.indexOf('<div class="smd-embed-post__content">');
    if (start < 0) return null;
    const section = html.slice(start);
    const title = section.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1];
    const url = section.match(/<img[^>]*src="([^"]+)"/)?.[1];
    const description = section.match(/<p[^>]*media-detail-hero__description[^>]*>([\s\S]*?)<\/p>/)?.[1];
    const date = section.match(/<th[^>]*>Date<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/)?.[1];
    const credit = section.match(/<th[^>]*>Credit &amp; Copyright<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/)?.[1];
    if (!title || !url || !description || !date) return null;
    const parsedDate = new Date(`${plainText(date)} UTC`);
    if (!Number.isFinite(parsedDate.getTime())) return null;
    const imageUrl = plainText(url);
    if (!imageUrl.startsWith("https://assets.science.nasa.gov/")) return null;
    return { title: plainText(title), url: imageUrl, explanation: plainText(description).replace(/^Explanation:\s*/, "").slice(0, 400) + "… Read the full explanation at NASA.", date: parsedDate.toISOString().slice(0, 10), media_type: "image", copyright: credit ? plainText(credit) : undefined, sourceUrl: "https://science.nasa.gov/apod/" };
  } catch { return null; }
}

export async function getNeoData(date?: string): Promise<NeoData | null> {
  try {
    const today = date || new Date().toISOString().split("T")[0];
    const res = await fetch(
      `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`,
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(7000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const neoObjects = data.near_earth_objects?.[today] || [];
    const approaches = neoObjects.flatMap((object: { close_approach_data: { close_approach_date: string; miss_distance: { kilometers: string }; relative_velocity: { kilometers_per_hour: string } }[] }) => object.close_approach_data.filter(a => a.close_approach_date === today));
    const distances = approaches.map((a: { miss_distance: { kilometers: string } }) => Number(a.miss_distance.kilometers)).filter(Number.isFinite);
    const speeds = approaches.map((a: { relative_velocity: { kilometers_per_hour: string } }) => Number(a.relative_velocity.kilometers_per_hour)).filter(Number.isFinite);
    return {
      objectsTracked: neoObjects.length,
      closestApproach: distances.length
        ? `${Math.round(Math.min(...distances)).toLocaleString("en-US")} KM`
        : "N/A",
      fastest: speeds.length
        ? `${Math.round(Math.max(...speeds)).toLocaleString("en-US")} KM/H`
        : "N/A",
    };
  } catch {
    return null;
  }
}
