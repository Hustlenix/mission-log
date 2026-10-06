import { cachedNasa, nasaJson } from "./client";
import { validDate } from "./normalize";
import type { EarthFrame } from "./types";
export function getEarthImages(mode = "natural", date?: string) {
  const product = mode === "enhanced" ? "enhanced" : "natural";
  const day = date ? validDate(date) : "latest";
  return cachedNasa<EarthFrame[]>(
    `epic:${product}:${day}`,
    "https://epic.gsfc.nasa.gov/",
    3600,
    async () => {
      const raw = (await nasaJson(
        `https://api.nasa.gov/EPIC/api/${product}${date ? `/date/${day}` : ""}`,
      )) as {
        identifier: string;
        date: string;
        image: string;
        caption: string;
        centroid_coordinates: { lat: number; lon: number };
      }[];
      if (!Array.isArray(raw)) throw new Error("Invalid EPIC");
      return raw.map((p) => {
        if (
          !/^[a-z0-9_]+$/i.test(p.image) ||
          !/^\d{4}-\d{2}-\d{2}/.test(p.date)
        )
          throw new Error("Invalid frame");
        return {
          id: p.identifier,
          date: p.date,
          image: `https://epic.gsfc.nasa.gov/archive/${product}/${p.date.slice(0, 10).replaceAll("-", "/")}/jpg/${p.image}.jpg`,
          caption: p.caption,
          lat: p.centroid_coordinates.lat,
          lon: p.centroid_coordinates.lon,
        };
      });
    },
  );
}
