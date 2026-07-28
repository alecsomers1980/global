import type { PressQuote } from '@/lib/types'

export function PressQuotes({ press }: { press: PressQuote[] }) {
  if (press.length === 0) return null
  return (
    <section>
      <h2 className="font-display text-3xl">Press</h2>
      <div className="mt-6 space-y-8">
        {press.map((q) => (
          <blockquote key={q.id} className="border-l-2 border-accent pl-6">
            <p className="font-display text-2xl leading-snug">&ldquo;{q.quote}&rdquo;</p>
            <footer className="mt-2 text-sm text-muted">{q.source}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  )
}
