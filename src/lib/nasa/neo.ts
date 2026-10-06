import { cachedNasa, nasaJson } from "./client";
import {
  normalizeAsteroid,
  validDate,
  addDays,
  type RawObject,
} from "./normalize";
import type { Asteroid } from "./types";
export function getNearEarthObjects(date?: string, week = false) {
  const start = validDate(date);
  const end = week ? addDays(start, 6) : start;
  return cachedNasa<Asteroid[]>(
    `neo:${start}:${end}`,
    "https://cneos.jpl.nasa.gov/",
    1800,
    async () => {
      const raw = (await nasaJson(
        `https://api.nasa.gov/neo/rest/v1/feed?start_date=${start}&end_date=${end}`,
      )) as { near_earth_objects: Record<string, RawObject[]> };
      if (!raw.near_earth_objects) throw new Error("Invalid feed");
      return Object.values(raw.near_earth_objects)
        .flat()
        .map(normalizeAsteroid);
    },
  );
}
export function getAsteroidById(id: string) {
  return cachedNasa<Asteroid>(
    `object:${id}`,
    "https://cneos.jpl.nasa.gov/",
    21600,
    async () => {
      if (!/^\d{1,12}$/.test(id)) throw new Error("Invalid object ID");
      return normalizeAsteroid(
        (await nasaJson(
          `https://api.nasa.gov/neo/rest/v1/neo/${id}`,
        )) as RawObject,
      );
    },
  );
}
