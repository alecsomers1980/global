import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { PlayHero } from '@/components/play/PlayHero'
import { AtAGlance } from '@/components/play/AtAGlance'
import { Synopsis } from '@/components/play/Synopsis'
import { Characters } from '@/components/play/Characters'
import { ProductionHistory } from '@/components/play/ProductionHistory'
import { PressQuotes } from '@/components/play/PressQuotes'
import { MediaGallery } from '@/components/play/MediaGallery'
import { LicensingPanel } from '@/components/play/LicensingPanel'
import { RightsTable } from '@/components/play/RightsTable'
import { PlaywrightCard } from '@/components/play/PlaywrightCard'
import { RelatedPlays } from '@/components/play/RelatedPlays'
import { getPlayBySlug, listLicenceTiers, listPlaySlugs, listRelatedPlays } from '@/lib/plays'
import { getPlaywrightBySlug } from '@/lib/playwrights'
import { playSchema } from '@/lib/seo'

export const revalidate = 300

export async function generateStaticParams() {
  return (await listPlaySlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const play = await getPlayBySlug((await params).slug)
  if (!play) return {}
  const writers = play.credits.map((c) => c.name).join(', ')
  return {
    title: play.title,
    description: play.logline ?? play.synopsisShort ?? `${play.title} by ${writers}.`,
    openGraph: { images: play.heroImageUrl ? [play.heroImageUrl] : [] },
  }
}

export default async function PlayPage({ params }: { params: Promise<{ slug: string }> }) {
  const play = await getPlayBySlug((await params).slug)
  if (!play) notFound()

  const [tiers, related] = await Promise.all([listLicenceTiers(), listRelatedPlays(play)])
  const primary = play.credits[0]
    ? await getPlaywrightBySlug(play.credits[0].slug)
    : null

  return (
    <Container className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(playSchema(play)) }}
      />
      <PlayHero play={play} />
      <div className="mt-16 space-y-16">
        <AtAGlance play={play} />
        <Synopsis play={play} />
        <Characters roles={play.roles} />
        {(play.setting || play.timePeriod) && (
          <section>
            <h2 className="font-display text-3xl">Setting</h2>
            {play.setting && <p className="mt-4 max-w-3xl">{play.setting}</p>}
            {play.timePeriod && <p className="mt-2 text-muted">{play.timePeriod}</p>}
          </section>
        )}
        <ProductionHistory productions={play.productions} />
        <PressQuotes press={play.press} />
        <MediaGallery media={play.media} />
        <LicensingPanel tiers={tiers} />
        <RightsTable rights={play.rights} />
        {primary && <PlaywrightCard playwright={primary} />}
        <RelatedPlays plays={related} />
      </div>
    </Container>
  )
}