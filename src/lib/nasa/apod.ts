import { cachedNasa, nasaJson } from "./client";
import { plainText, safeUrl } from "./normalize";
import type { Apod } from "./types";
export function getAstronomy() {
  return cachedNasa<Apod>(
    "apod:latest",
    "https://science.nasa.gov/apod/",
    10800,
    async () => {
      const data = (await nasaJson(
        "https://science.nasa.gov/wp-json/wp/v2/apod-basic?per_page=1",
        false,
      )) as Record<string, string>[];
      const p = data[0];
      if (!p?.title || !p.date || !p.permalink) throw new Error("Invalid APOD");
      return {
        title: plainText(p.title),
        date: p.date,
        url: safeUrl(p.hdurl),
        alt: plainText(p.alt || p.title),
        media_type: p.media_type,
        explanation: plainText(p.explanation)
          .replace(/^Explanation:\s*/, "")
          .slice(0, 700),
        copyright: plainText(p.credit || p.copyright),
        sourceUrl: safeUrl(p.permalink),
      };
    },
  );
}
