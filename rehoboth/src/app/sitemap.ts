import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/catalog";
import { getNews } from "@/lib/news";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rehobothco.co.za";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const news = await getNews();
  const now = new Date();

  const staticRoutes = ["", "/shop", "/news", "/about", "/stockists", "/contact", "/privacy", "/terms", "/returns"];

  return [
    ...staticRoutes.map((path) => ({
      url: `${BASE}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
    ...products.map((p) => ({
      url: `${BASE}/product/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...news.map((n) => ({
      url: `${BASE}/news/${n.slug}`,
      // The article's own date, not today's: telling a crawler that every
      // article changed this morning is how a sitemap stops being believed.
      lastModified: n.publishedAt ? new Date(n.publishedAt) : now,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
