import { cachedNasa, nasaJson } from "./client";
import { addDays, validDate, safeUrl } from "./normalize";
import type { WeatherEvent } from "./types";
const categories = [
  {
    code: "FLR",
    name: "Solar flare",
    explanation:
      "An observed burst of electromagnetic radiation. The class describes peak X-ray flux.",
  },
  {
    code: "CME",
    name: "Coronal mass ejection",
    explanation:
      "An observed eruption of solar plasma and magnetic field. This record alone is not an Earth-impact forecast.",
  },
  {
    code: "GST",
    name: "Geomagnetic storm",
    explanation: "A recorded disturbance in Earth’s magnetic environment.",
  },
  {
    code: "SEP",
    name: "Solar energetic particles",
    explanation:
      "A recorded energetic-particle event; read the source for instrument and analysis context.",
  },
  {
    code: "IPS",
    name: "Interplanetary shock",
    explanation:
      "A recorded shock in the interplanetary environment. Context and instruments are given in the source.",
  },
];
export async function getSpaceWeather() {
  const end = validDate();
  const start = addDays(end, -6);
  const feeds = await Promise.all(
    categories.map((c) =>
      cachedNasa<WeatherEvent[]>(
        `donki:${c.code}:${start}`,
        "https://ccmc.gsfc.nasa.gov/tools/DONKI/",
        900,
        async () => {
          const raw = (await nasaJson(
            `https://api.nasa.gov/DONKI/${c.code}?startDate=${start}&endDate=${end}`,
          )) as Record<string, unknown>[];
          if (!Array.isArray(raw)) throw new Error("Invalid DONKI");
          return raw.map((r) => ({
            id: String(
              r.flrID || r.activityID || r.gstID || r.sepID || r.ipsID,
            ),
            type: c.name,
            time: String(r.beginTime || r.startTime || r.eventTime || ""),
            classification: String(r.classType || "Source record"),
            sourceUrl:
              safeUrl(r.link) || "https://ccmc.gsfc.nasa.gov/tools/DONKI/",
            explanation: c.explanation,
          }));
        },
      ),
    ),
  );
  return {
    start,
    end,
    categories: categories.map((c, i) => ({
      type: c.name,
      available: feeds[i].data !== null,
      count: feeds[i].data?.length || 0,
    })),
    events: feeds
      .flatMap((f) => f.data || [])
      .sort((a, b) => b.time.localeCompare(a.time)),
    unavailable: feeds.filter((f) => !f.data).length,
    stale: feeds.some((f) => f.stale),
    fetchedAt:
      feeds
        .map((f) => f.fetchedAt)
        .filter(Boolean)
        .sort()[0] || null,
  };
}
