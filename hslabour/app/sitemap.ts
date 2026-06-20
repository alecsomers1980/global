import type { MetadataRoute } from "next";
import { services } from "@/lib/site/services";
import { cities } from "@/lib/site/cities";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://hslabour.co.za";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/services`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/jobs`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/employers`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.5 },
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

  return [...staticRoutes, ...servicePages, ...cityServicePages];
}