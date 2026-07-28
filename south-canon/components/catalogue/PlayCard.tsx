import Link from 'next/link'
import type { PlaySummary } from '@/lib/types'

export function PlayCard({ play }: { play: PlaySummary }) {
  return (
    <Link
      href={`/plays/${play.slug}`}
      className="group block border-b border-rule py-8 transition-colors hover:border-accent"
    >
      <article className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
        <div>
          <h2 className="font-display text-3xl leading-tight group-hover:text-accent md:text-4xl">
            {play.title}
          </h2>
          {play.credits.length > 0 && (
            <p className="mt-1 text-sm text-muted">
              {play.credits.map((c) => c.name).join(' · ')}
            </p>
          )}
          {play.logline && <p className="mt-3 max-w-2xl text-base">{play.logline}</p>}
        </div>
        <dl className="flex gap-6 text-xs tracking-wide uppercase text-muted md:flex-col md:gap-2 md:text-right">
          {play.genres.length > 0 && (
            <div>
              <dt className="sr-only">Genre</dt>
              <dd>{play.genres.join(', ')}</dd>
            </div>
          )}
          {play.castSummary && (
            <div>
              <dt className="sr-only">Cast</dt>
              <dd>{play.castSummary}</dd>
            </div>
          )}
          {play.durationMin && (
            <div>
              <dt className="sr-only">Duration</dt>
              <dd>{play.durationMin} min</dd>
            </div>
          )}
        </dl>
      </article>
    </Link>
  )
}
