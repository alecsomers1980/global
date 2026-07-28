import { PlayCard } from '@/components/catalogue/PlayCard'
import type { PlaySummary } from '@/lib/types'

export function RelatedPlays({ plays }: { plays: PlaySummary[] }) {
  if (plays.length === 0) return null
  return (
    <section>
      <h2 className="font-display text-3xl">Also represented</h2>
      <div className="mt-4">
        {plays.map((p) => (
          <PlayCard key={p.id} play={p} />
        ))}
      </div>
    </section>
  )
}
