import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.BETTER_AUTH_URL || "https://mission-log-omega.vercel.app";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/studio",
        "/post",
        "/api/",
        "/account",
        "/collections/",
        "/search",
        "/signin",
        "/signup",
        "/login",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
