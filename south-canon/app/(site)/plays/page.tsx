import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { CatalogueFilters } from '@/components/catalogue/CatalogueFilters'
import { PlayCard } from '@/components/catalogue/PlayCard'
import { parseFilters } from '@/lib/filters'
import { listGenres, listPlays } from '@/lib/plays'
import { listPlaywrights } from '@/lib/playwrights'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Catalogue',
  description:
    'Browse plays available for licensing from South Canon. Search by title, genre or playwright.',
}

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const filters = parseFilters(await searchParams)
  const [plays, genres, playwrights] = await Promise.all([
    listPlays(filters),
    listGenres(),
    listPlaywrights(),
  ])

  return (
    <Container className="py-16">
      <h1 className="font-display text-5xl md:text-6xl">Catalogue</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Plays represented by South Canon. Search by title, genre or playwright.
      </p>

      <div className="mt-12">
        <CatalogueFilters filters={filters} genres={genres} playwrights={playwrights} />
      </div>

      {plays.length === 0 ? (
        <p className="py-16 text-muted">No plays match those filters yet.</p>
      ) : (
        <div className="mt-4">
          <p className="py-6 text-xs uppercase tracking-wide text-muted">
            {plays.length} {plays.length === 1 ? 'play' : 'plays'}
          </p>
          {plays.map((play) => (
            <PlayCard key={play.id} play={play} />
          ))}
        </div>
      )}
    </Container>
  )
}
