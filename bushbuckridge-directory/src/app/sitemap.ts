import type { MetadataRoute } from "next";
import { createClient } from "@/utils/pocketbase/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dbib.co.za";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Static routes ──────────────────────────────────────────────
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, priority: 1.0 },
    { url: `${SITE_URL}/find-a-service`, lastModified: now, priority: 0.9 },
    { url: `${SITE_URL}/jobs`, lastModified: now, priority: 0.9 },
    { url: `${SITE_URL}/opportunities`, lastModified: now, priority: 0.8 },
    { url: `${SITE_URL}/events`, lastModified: now, priority: 0.8 },
    { url: `${SITE_URL}/articles`, lastModified: now, priority: 0.8 },
    { url: `${SITE_URL}/list-your-business`, lastModified: now, priority: 0.7 },
    { url: `${SITE_URL}/employer-services`, lastModified: now, priority: 0.7 },
    { url: `${SITE_URL}/enquiries`, lastModified: now, priority: 0.6 },
    { url: `${SITE_URL}/privacy`, lastModified: now, priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, priority: 0.3 },
  ];

  // ── Dynamic routes (each collection wrapped in its own try/catch) ──
  const pb = await createClient();

  let businessRoutes: MetadataRoute.Sitemap = [];
  try {
    const businesses = await pb.collection("businesses").getFullList({
      filter: 'status = "active"',
    });
    businessRoutes = businesses.map((b: any) => ({
      url: `${SITE_URL}/business/${b.slug}`,
      lastModified: b.updated ? new Date(b.updated) : now,
      priority: 0.7,
    }));
  } catch {
    // fail silently
  }

  let jobRoutes: MetadataRoute.Sitemap = [];
  try {
    const jobs = await pb.collection("jobs").getFullList({
      filter: 'status = "published"',
    });
    jobRoutes = jobs.map((j: any) => ({
      url: `${SITE_URL}/jobs/${j.slug || j.id}`,
      lastModified: j.updated ? new Date(j.updated) : now,
      priority: 0.8,
    }));
  } catch {
    // fail silently
  }

  let eventRoutes: MetadataRoute.Sitemap = [];
  try {
    const events = await pb.collection("events").getFullList();
    eventRoutes = events
      .filter((e: any) => !!e.slug)
      .map((e: any) => ({
        url: `${SITE_URL}/events/${e.slug}`,
        lastModified: e.updated ? new Date(e.updated) : now,
        priority: 0.7,
      }));
  } catch {
    // fail silently
  }

  let articleRoutes: MetadataRoute.Sitemap = [];
  try {
    const articles = await pb.collection("articles").getFullList();
    articleRoutes = articles.map((a: any) => ({
      url: `${SITE_URL}/articles/${a.id}`,
      lastModified: a.updated ? new Date(a.updated) : now,
      priority: 0.7,
    }));
  } catch {
    // fail silently
  }

  let opportunityRoutes: MetadataRoute.Sitemap = [];
  try {
    const opportunities = await pb.collection("opportunities").getFullList();
    opportunityRoutes = opportunities.map((o: any) => ({
      url: `${SITE_URL}/opportunities/${o.id}`,
      lastModified: o.updated ? new Date(o.updated) : now,
      priority: 0.7,
    }));
  } catch {
    // fail silently
  }

  return [
    ...staticRoutes,
    ...businessRoutes,
    ...jobRoutes,
    ...eventRoutes,
    ...articleRoutes,
    ...opportunityRoutes,
  ];
}
