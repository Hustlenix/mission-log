import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.BETTER_AUTH_URL || "https://mission-log-omega.vercel.app";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/post", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
