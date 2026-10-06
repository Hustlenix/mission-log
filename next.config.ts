import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images-assets.nasa.gov" },
      { protocol: "https", hostname: "assets.science.nasa.gov" },
      { protocol: "https", hostname: "epic.gsfc.nasa.gov" },
      { protocol: "https", hostname: "www.nasa.gov" },
      { protocol: "https", hostname: "science.nasa.gov" },
    ],
  },
};

export default nextConfig;
