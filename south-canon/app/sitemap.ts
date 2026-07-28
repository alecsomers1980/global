import type { MetadataRoute } from 'next'
import { listPlaySlugs } from '@/lib/plays'
import { listPlaywrightSlugs } from '@/lib/playwrights'
import { SITE_URL } from '@/lib/seo'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [plays, playwrights] = await Promise.all([listPlaySlugs(), listPlaywrightSlugs()])
  const staticRoutes = ['', '/plays', '/playwrights', '/about', '/contact']

  return [
    ...staticRoutes.map((r) => ({ url: `${SITE_URL}${r}`, changeFrequency: 'weekly' as const })),
    ...plays.map((slug) => ({ url: `${SITE_URL}/plays/${slug}`, changeFrequency: 'monthly' as const })),
    ...playwrights.map((slug) => ({
      url: `${SITE_URL}/playwrights/${slug}`,
      changeFrequency: 'monthly' as const,
    })),
  ]
}