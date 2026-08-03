import type { MetadataRoute } from "next";

const base = "https://endlessglobalpoint.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/about-us",
    "/investment-services",
    "/financial-services",
    "/trade-services",
    "/consulting-services",
    "/talk-to-us",
    "/terms-and-conditions",
    "/privacy-policy",
  ];
  const now = new Date();
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
