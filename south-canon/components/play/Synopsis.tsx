import type { PlayDetail } from '@/lib/types'

export function Synopsis({ play }: { play: PlayDetail }) {
  if (!play.synopsisShort && !play.synopsisFull) return null
  return (
    <section>
      <h2 className="font-display text-3xl">Synopsis</h2>
      {play.synopsisShort && <p className="mt-4 max-w-3xl text-lg">{play.synopsisShort}</p>}
      {play.synopsisFull && (
        <details className="mt-4 max-w-3xl">
          <summary className="cursor-pointer text-sm uppercase tracking-wide text-accent">
            Read the full synopsis
          </summary>
          <div className="mt-4 space-y-4 whitespace-pre-line">{play.synopsisFull}</div>
        </details>
      )}
    </section>
  )
}
