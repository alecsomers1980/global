import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rehobothco.co.za";

/**
 * Indexing switches itself on when the site is served from its own domain.
 *
 * A preview copy on *.vercel.app must not be indexed: it would compete with
 * the real domain for the same content, and this site is still carrying
 * placeholder company details. Point NEXT_PUBLIC_SITE_URL at the live domain
 * and search engines are welcome — no code change, no flag to remember.
 */
const isPreview = /vercel\.app|localhost|127\.0\.0\.1/.test(BASE);

export default function robots(): MetadataRoute.Robots {
  if (isPreview) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/checkout", "/cart", "/account"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
