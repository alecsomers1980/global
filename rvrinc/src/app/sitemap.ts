import { MetadataRoute } from 'next'
import { practiceAreas } from '@/lib/data'
import { createClient } from '@/lib/supabase/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rvrinc.co.za'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date()
  const supabase = createClient()

  const { data: posts } = await supabase
    .from('insights_posts')
    .select('slug, published_at')
    .eq('status', 'PUBLISHED')

  const staticRoutes = [
    { url: SITE_URL, priority: 1 },
    { url: `${SITE_URL}/about`, priority: 0.8 },
    { url: `${SITE_URL}/contact`, priority: 0.8 },
    { url: `${SITE_URL}/insights`, priority: 0.7 },
    { url: `${SITE_URL}/practice-areas`, priority: 0.9 },
    { url: `${SITE_URL}/team`, priority: 0.8 },
    { url: `${SITE_URL}/case-update`, priority: 0.7 },
    { url: `${SITE_URL}/start-claim`, priority: 0.7 },
    { url: `${SITE_URL}/login`, priority: 0.3 },
    { url: `${SITE_URL}/privacy-policy`, priority: 0.3 },
    { url: `${SITE_URL}/paia-manual`, priority: 0.3 },
  ]

  return [
    ...staticRoutes.map((r) => ({
      url: r.url,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: r.priority,
    })),
    ...practiceAreas.map((area) => ({
      url: `${SITE_URL}/practice-areas/${area.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...(posts ?? []).map((post) => ({
      url: `${SITE_URL}/insights/${post.slug}`,
      lastModified: post.published_at ? new Date(post.published_at) : lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
