import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dbib.co.za";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // AI crawlers — explicit full access for GEO / AI citations
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      // Standard crawlers — allow all except restricted paths
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/portal", "/api", "/login"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
