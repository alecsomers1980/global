import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { PlayCard } from '@/components/catalogue/PlayCard'
import { listPlays } from '@/lib/plays'

export const revalidate = 300

export default async function HomePage() {
  const plays = (await listPlays({ genres: [] })).slice(0, 4)

  return (
    <>
      <Container className="py-24 md:py-32">
        <p className="text-xs uppercase tracking-[0.25em] text-accent">
          Theatrical licensing for the global South
        </p>
        <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.05] md:text-7xl">
          The work of Africa&rsquo;s greatest playwrights, properly represented.
        </h1>
        <p className="mt-8 max-w-2xl text-xl text-muted">
          South Canon licenses plays for performance worldwide &mdash; and makes sure the writers
          who made them are paid, on time, with a full account of where their work is playing.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/plays"
            className="bg-accent px-8 py-4 text-sm uppercase tracking-wide text-paper hover:opacity-90"
          >
            Browse the catalogue
          </Link>
          <Link
            href="/about"
            className="border border-ink px-8 py-4 text-sm uppercase tracking-wide hover:bg-ink hover:text-paper"
          >
            For writers
          </Link>
        </div>
      </Container>

      {plays.length > 0 && (
        <Container className="pb-24">
          <h2 className="font-display text-3xl">From the catalogue</h2>
          <div className="mt-4">
            {plays.map((p) => (
              <PlayCard key={p.id} play={p} />
            ))}
          </div>
        </Container>
      )}
    </>
  )
}
