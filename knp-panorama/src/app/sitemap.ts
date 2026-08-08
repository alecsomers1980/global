import { TOURS } from '@/data/tours';
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const BASE = 'https://www.knp-panorama.com';

  const staticRoutes = [
    { route: '', priority: 1, changeFrequency: 'monthly' as const },
    { route: '/safari', priority: 0.8, changeFrequency: 'monthly' as const },
    { route: '/tours', priority: 0.8, changeFrequency: 'monthly' as const },
    { route: '/transfers', priority: 0.8, changeFrequency: 'monthly' as const },
    { route: '/accommodation', priority: 0.8, changeFrequency: 'monthly' as const },
    { route: '/contact', priority: 0.5, changeFrequency: 'monthly' as const },
    { route: '/request-a-quote', priority: 0.5, changeFrequency: 'monthly' as const },
    { route: '/image-credits', priority: 0.5, changeFrequency: 'monthly' as const },
  ];

  const tourRoutes = TOURS.map((tour) => ({
    url: `${BASE}/experiences/${tour.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const staticEntries = staticRoutes.map(({ route, priority, changeFrequency }) => ({
    url: `${BASE}${route}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  return [...staticEntries, ...tourRoutes];
}
