import type { Approach } from "./types";

// Pure selection/scale logic; no invented orbit, coordinate or risk values.
export function selectApproach(approaches: Approach[], requested: string, today: string) {
  const ordered = [...approaches].sort((a, b) => a.time.localeCompare(b.time));
  if (requested) return ordered.find((a) => a.time === requested) ?? null;
  return ordered.find((a) => a.date >= today) ?? ordered.at(-1) ?? null;
}

export function distanceScale(lunar: number) {
  if (!Number.isFinite(lunar) || lunar < 0) return null;
  const maximum = Math.max(1, lunar);
  return { maximum, moonPercent: 100 / maximum, asteroidPercent: lunar * 100 / maximum };
}

export function approachHref(id: string, approach: Approach) {
  return `/live/asteroids/${encodeURIComponent(id)}?approach=${encodeURIComponent(approach.time)}`;
}
