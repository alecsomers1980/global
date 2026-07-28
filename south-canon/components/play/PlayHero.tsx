import Link from 'next/link'
import { AvailabilityBadge } from '@/components/ui/AvailabilityBadge'
import { resolveAvailability } from '@/lib/availability'
import type { PlayDetail } from '@/lib/types'

export function PlayHero({ play }: { play: PlayDetail }) {
  const { status, note } = resolveAvailability(play.rights, 'South Africa')

  return (
    <section className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center">
      <div>
        <AvailabilityBadge status={status} note={note} />
        <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-7xl">{play.title}</h1>
        {play.credits.length > 0 && (
          <p className="mt-4 text-lg">
            {play.credits.map((c, i) => (
              <span key={c.slug}>
                {i > 0 && <span className="text-muted"> &middot; </span>}
                <Link href={`/playwrights/${c.slug}`} className="hover:text-accent">
                  {c.name}
                </Link>
              </span>
            ))}
          </p>
        )}
        {play.logline && <p className="mt-6 max-w-xl text-xl text-muted">{play.logline}</p>}

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href={`/contact?play=${play.slug}&intent=perusal`}
            className="border border-ink px-6 py-3 text-sm uppercase tracking-wide hover:bg-ink hover:text-paper"
          >
            Request perusal script
          </Link>
          <Link
            href={`/contact?play=${play.slug}&intent=licence`}
            className="bg-accent px-6 py-3 text-sm uppercase tracking-wide text-paper hover:opacity-90"
          >
            Apply for licence
          </Link>
        </div>
      </div>

      {play.heroImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={play.heroImageUrl}
          alt={`Production photograph from ${play.title}`}
          className="aspect-[4/5] w-full object-cover"
        />
      )}
    </section>
  )
}
