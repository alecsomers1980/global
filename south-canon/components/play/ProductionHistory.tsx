import type { Production } from '@/lib/types'

function year(date: string | null) {
  return date ? new Date(date).getFullYear() : null
}

export function ProductionHistory({ productions }: { productions: Production[] }) {
  if (productions.length === 0) return null
  return (
    <section>
      <h2 className="font-display text-3xl">Production history</h2>
      <ul className="mt-6 divide-y divide-rule border-t border-rule">
        {productions.map((p) => (
          <li key={p.id} className="grid gap-1 py-4 md:grid-cols-[120px_1fr]">
            <p className="text-sm text-muted">{year(p.startsOn) ?? '—'}</p>
            <div>
              <p>
                {p.company}
                {p.isPremiere && (
                  <span className="ml-2 text-xs uppercase tracking-wide text-accent">Premiere</span>
                )}
              </p>
              <p className="text-sm text-muted">
                {[p.venue, p.city, p.country].filter(Boolean).join(', ')}
                {p.director ? ` · directed by ${p.director}` : ''}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
