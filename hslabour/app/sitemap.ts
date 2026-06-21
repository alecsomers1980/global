import type { MetadataRoute } from "next";
import { services } from "@/lib/site/services";
import { cities } from "@/lib/site/cities";
import { getPublishedPosts } from "@/lib/insights/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://hslabour.co.za";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/services`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/jobs`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/submit-cv`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/employers`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/shop`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/ebook`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/insights`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/affiliate-program`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/privacy-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/paia`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const servicePages: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${base}/services/${service.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const cityServicePages: MetadataRoute.Sitemap = cities.flatMap((city) =>
    services.map((service) => ({
      url: `${base}/${city.slug}/${service.locationSlug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }))
  );

  let insightPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await getPublishedPosts();
    insightPages = posts.map((post) => ({
      url: `${base}/insights/${post.slug}`,
      lastModified: post.published_at ?? undefined,
      changeFrequency: "monthly",
      priority: 0.6,
    }));
  } catch {
    // Supabase unavailable at build — skip article URLs rather than fail the sitemap.
  }

  return [...staticRoutes, ...servicePages, ...cityServicePages, ...insightPages];
}
