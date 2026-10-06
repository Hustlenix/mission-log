import type { Asteroid } from "./types";
export function plainText(value: unknown) {
  return typeof value === "string"
    ? value
        .replace(/<[^>]*>/g, " ")
        .replace(/&#(\d+);/g, (_, n) =>
          String.fromCodePoint(Math.min(Number(n), 0x10ffff)),
        )
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#039;|&apos;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : "";
}
export function safeUrl(value: unknown) {
  if (typeof value !== "string") return "";
  try {
    const u = new URL(value);
    return u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      !Array.from(u.searchParams.keys()).some((k) =>
        /^(api[_-]?key|token|secret|password|access_token)$/i.test(k),
      )
      ? u.toString()
      : "";
  } catch {
    return "";
  }
}
export type RawObject = {
  id: string;
  name: string;
  is_potentially_hazardous_asteroid: boolean;
  nasa_jpl_url: string;
  estimated_diameter: {
    meters: { estimated_diameter_min: number; estimated_diameter_max: number };
  };
  close_approach_data: {
    close_approach_date: string;
    epoch_date_close_approach: number;
    orbiting_body: string;
    miss_distance: { kilometers: string; lunar: string };
    relative_velocity: { kilometers_per_hour: string };
  }[];
};
export function normalizeAsteroid(raw: RawObject): Asteroid {
  if (
    !/^\d+$/.test(raw.id) ||
    !raw.name ||
    !raw.estimated_diameter?.meters ||
    !Array.isArray(raw.close_approach_data)
  )
    throw new Error("Invalid NEO record");
  const diameter = raw.estimated_diameter.meters;
  const approaches = raw.close_approach_data
    .filter((a) => a.orbiting_body === "Earth")
    .map((a) => ({
      date: a.close_approach_date,
      time: new Date(a.epoch_date_close_approach).toISOString(),
      distance: Number(a.miss_distance.kilometers),
      lunar: Number(a.miss_distance.lunar),
      speed: Number(a.relative_velocity.kilometers_per_hour),
    }))
    .filter((a) => [a.distance, a.lunar, a.speed].every(Number.isFinite));
  return {
    id: raw.id,
    name: raw.name.replace(/^\(|\)$/g, ""),
    diameterMin: diameter.estimated_diameter_min,
    diameterMax: diameter.estimated_diameter_max,
    hazardous: raw.is_potentially_hazardous_asteroid === true,
    sourceUrl: `https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=${raw.id}`,
    approaches,
  };
}
export function validDate(input?: string) {
  if (typeof input !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input))
    return new Date().toISOString().slice(0, 10);
  const d = new Date(`${input}T00:00:00Z`);
  return Number.isFinite(+d) && d.toISOString().slice(0, 10) === input
    ? input
    : new Date().toISOString().slice(0, 10);
}
export function queryValue(input: unknown) {
  const value = Array.isArray(input) ? input[0] : input;
  return typeof value === "string" ? value.trim().slice(0, 120) : "";
}
export function addDays(date: string, days: number) {
  return new Date(new Date(`${date}T00:00:00Z`).getTime() + days * 86400000)
    .toISOString()
    .slice(0, 10);
}
