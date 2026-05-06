import { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rvrinc.co.za'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const staticRoutes = [
    { url: SITE_URL, priority: 1 },
    { url: `${SITE_URL}/about`, priority: 0.8 },
    { url: `${SITE_URL}/contact`, priority: 0.8 },
    { url: `${SITE_URL}/insights`, priority: 0.7 },
    { url: `${SITE_URL}/practice-areas`, priority: 0.9 },
    { url: `${SITE_URL}/team`, priority: 0.8 },
    { url: `${SITE_URL}/book`, priority: 0.6 },
    { url: `${SITE_URL}/start-claim`, priority: 0.7 },
    { url: `${SITE_URL}/login`, priority: 0.3 },
    { url: `${SITE_URL}/privacy-policy`, priority: 0.3 },
    { url: `${SITE_URL}/paia-manual`, priority: 0.3 },
  ]

  const practiceAreas = [
    'litigation', 'family', 'commercial', 'property', 'personal-injury', 'criminal',
  ]

  const teamSlugs = [
    'marius-roets', 'johan-van-rensburg', 'sarah-nkosi',
  ]

  return [
    ...staticRoutes.map((r) => ({
      url: r.url,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: r.priority,
    })),
    ...practiceAreas.map((slug) => ({
      url: `${SITE_URL}/practice-areas/${slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...teamSlugs.map((slug) => ({
      url: `${SITE_URL}/team/${slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ]
}
