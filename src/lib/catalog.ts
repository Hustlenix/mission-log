export const topics = [
  {
    slug: "iss",
    name: "Space stations",
    description:
      "The laboratory above us, the people inside it, and what comes after the ISS.",
    query: "International Space Station",
    live: "/iss",
  },
  {
    slug: "asteroids",
    name: "Asteroids",
    description:
      "Small worlds, close approaches, and the science of planetary defense.",
    query: "DART asteroid",
    live: "/live/asteroids",
  },
  {
    slug: "space-weather",
    name: "Space weather",
    description: "Flares, solar eruptions, and their effects beyond the Sun.",
    query: "solar flare",
    live: "/live/space-weather",
  },
  {
    slug: "earth",
    name: "Earth",
    description:
      "A whole planet in one frame. Read the imagery without losing the context.",
    query: "Earth",
    live: "/live/earth",
  },
  {
    slug: "james-webb",
    name: "James Webb",
    description:
      "Infrared astronomy and the engineering that makes it possible.",
    query: "James Webb",
    live: "/media?q=James+Webb",
  },
  {
    slug: "moon",
    name: "The Moon",
    description: "Our nearest world, its history, and the work of returning.",
    query: "Moon",
    live: "/generation",
  },
  {
    slug: "mars",
    name: "Mars",
    description:
      "Robotic exploration of a world we are still learning to understand.",
    query: "Mars rover",
    live: "/media?q=Mars",
  },
] as const;

export const imageUrl = (id: string) =>
  `https://images-assets.nasa.gov/image/${id}/${id}~medium.jpg`;
export const stationImage = imageUrl("iss056e201248");
export const earthImage = imageUrl("GSFC_20171208_Archive_e001386");
export function topicName(slug: string) {
  return topics.find((t) => t.slug === slug)?.name || slug;
}
export function shortDate(value?: string | Date) {
  return value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : "";
}
export function readingTime(content: string) {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}
