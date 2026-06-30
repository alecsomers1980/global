import type { MetadataRoute } from "next";
import { services } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://eastlakedrilling.co.za";

  const staticPages = [
    { url: "/", changeFrequency: "monthly" as const, priority: 1 },
    { url: "/boreholes", changeFrequency: "monthly" as const, priority: 0.6 },
    { url: "/services", changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "/gallery", changeFrequency: "monthly" as const, priority: 0.6 },
    { url: "/faq", changeFrequency: "monthly" as const, priority: 0.6 },
    { url: "/contact", changeFrequency: "monthly" as const, priority: 0.6 },
  ];

  const staticEntries = staticPages.map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const serviceEntries = services.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...serviceEntries];
}