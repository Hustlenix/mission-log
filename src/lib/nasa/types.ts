export type Feed<T> = {
  data: T | null;
  fetchedAt: string | null;
  stale: boolean;
  source: string;
};
export type Apod = {
  title: string;
  url: string;
  alt: string;
  date: string;
  media_type: string;
  explanation: string;
  copyright: string;
  sourceUrl: string;
};
export type Approach = {
  date: string;
  time: string;
  distance: number;
  lunar: number;
  speed: number;
};
export type Asteroid = {
  id: string;
  name: string;
  diameterMin: number;
  diameterMax: number;
  hazardous: boolean;
  sourceUrl: string;
  approaches: Approach[];
};
export type WeatherEvent = {
  id: string;
  type: string;
  time: string;
  classification: string;
  sourceUrl: string;
  explanation: string;
};
export type EarthFrame = {
  id: string;
  date: string;
  image: string;
  caption: string;
  lat: number;
  lon: number;
};
export type MediaItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
  image: string;
  credit: string;
  sourceUrl: string;
};
