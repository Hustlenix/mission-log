import { getAstronomy } from "./nasa/apod";
import { getNearEarthObjects } from "./nasa/neo";
export type { Apod as ApodData } from "./nasa/types";
export async function getApod() {
  return (await getAstronomy()).data;
}
export async function getNeoData(date?: string) {
  const { data } = await getNearEarthObjects(date);
  if (!data) return null;
  const approaches = data.flatMap((o) => o.approaches);
  return {
    objectsTracked: data.length,
    closestApproach: approaches.length
      ? `${Math.round(Math.min(...approaches.map((a) => a.distance))).toLocaleString("en-US")} KM`
      : "N/A",
    fastest: approaches.length
      ? `${Math.round(Math.max(...approaches.map((a) => a.speed))).toLocaleString("en-US")} KM/H`
      : "N/A",
  };
}
export async function getNeoStats() {
  const d = await getNeoData();
  return d ? { count: d.objectsTracked } : null;
}
