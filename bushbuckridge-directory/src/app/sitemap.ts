import { SITE_URL } from '@/lib/seo';
import PocketBase from 'pocketbase';
import type { MetadataRoute } from 'next';

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

// PocketBase records may carry empty or malformed date strings; fall back to now
// so a single bad record never throws "Invalid time value" during prerender.
function safeDate(value: unknown): Date {
  const d = new Date(value as string);
  return isNaN(d.getTime()) ? new Date() : d;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/find-a-service`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/opportunities`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/articles`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/list-your-business`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/buy-your-spot`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Dynamic entries – each wrapped in its own try/catch
  let businessEntries: MetadataRoute.Sitemap = [];
  try {
    const businesses = await pb.collection('businesses').getFullList({ filter: 'status = "active"' });
    businessEntries = businesses.map((b: any) => ({
      url: `${SITE_URL}/business/${b.id}`,
      lastModified: safeDate(b.updated || b.created),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (e) {
    console.error('Sitemap: businesses fetch failed', e);
  }

  let eventEntries: MetadataRoute.Sitemap = [];
  try {
    const events = await pb.collection('events').getFullList();
    eventEntries = events.map((e: any) => ({
      url: `${SITE_URL}/events/${e.slug || e.id}`,
      lastModified: safeDate(e.updated || e.created),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));
  } catch (e) {
    console.error('Sitemap: events fetch failed', e);
  }

  let jobEntries: MetadataRoute.Sitemap = [];
  try {
    const jobs = await pb.collection('jobs').getFullList();
    jobEntries = jobs.map((j: any) => ({
      url: `${SITE_URL}/jobs/${j.slug || j.id}`,
      lastModified: safeDate(j.updated || j.created),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (e) {
    console.error('Sitemap: jobs fetch failed', e);
  }

  let opportunityEntries: MetadataRoute.Sitemap = [];
  try {
    const opportunities = await pb.collection('opportunities').getFullList();
    opportunityEntries = opportunities.map((o: any) => ({
      url: `${SITE_URL}/opportunities/${o.id}`,
      lastModified: safeDate(o.updated || o.created),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (e) {
    console.error('Sitemap: opportunities fetch failed', e);
  }

  let articleEntries: MetadataRoute.Sitemap = [];
  try {
    const articles = await pb.collection('spotlight_articles').getFullList({ filter: 'status = "published"' });
    articleEntries = articles.map((a: any) => ({
      url: `${SITE_URL}/articles/${a.id}`,
      lastModified: safeDate(a.updated || a.created),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (e) {
    console.error('Sitemap: articles fetch failed', e);
  }

  return [
    ...staticRoutes,
    ...businessEntries,
    ...eventEntries,
    ...jobEntries,
    ...opportunityEntries,
    ...articleEntries,
  ];
}

export const revalidate = 3600;
