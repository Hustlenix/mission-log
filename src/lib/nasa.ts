export interface ApodData {
  title: string;
  explanation: string;
  url: string;
  date: string;
  media_type: string;
}

export interface NeoData {
  objectsTracked: number;
  closestApproach: string;
  fastest: string;
}

const NASA_API_KEY = process.env.NASA_API_KEY || "DEMO_KEY";

export async function getApod(): Promise<ApodData | null> {
  try {
    const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function getNeoData(): Promise<NeoData | null> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const res = await fetch(
      `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const neoObjects = data.near_earth_objects?.[today] || [];
    return {
      objectsTracked: neoObjects.length,
      closestApproach: neoObjects[0]?.close_approach_data?.[0]?.miss_distance?.kilometers
        ? `${Math.round(parseFloat(neoObjects[0].close_approach_data[0].miss_distance.kilometers)).toLocaleString()} KM`
        : "N/A",
      fastest: neoObjects[0]?.close_approach_data?.[0]?.relative_velocity?.kilometers_per_hour
        ? `${Math.round(parseFloat(neoObjects[0].close_approach_data[0].relative_velocity.kilometers_per_hour)).toLocaleString()} KM/H`
        : "N/A",
    };
  } catch {
    return null;
  }
}
