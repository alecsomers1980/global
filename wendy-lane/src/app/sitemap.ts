import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/business";

const routes = [
  { path: "", priority: 1.0, changeFrequency: "weekly" as const },
  { path: "/wendy-houses", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/frame-built", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/quote", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/gallery", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/care", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/about", priority: 0.5, changeFrequency: "yearly" as const },
  { path: "/contact", priority: 0.6, changeFrequency: "yearly" as const },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
