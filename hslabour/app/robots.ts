import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://hslabour.co.za/sitemap.xml",
    host: "https://hslabour.co.za",
  };
}