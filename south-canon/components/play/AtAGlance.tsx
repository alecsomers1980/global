import type { PlayDetail } from '@/lib/types'

export function AtAGlance({ play }: { play: PlayDetail }) {
  const items: { label: string; value: string }[] = []
  if (play.castSummary) items.push({ label: 'Cast', value: play.castSummary })
  if (play.durationMin) items.push({ label: 'Duration', value: `${play.durationMin} min` })
  if (play.acts) items.push({ label: 'Acts', value: String(play.acts) })
  if (play.genres.length) items.push({ label: 'Genre', value: play.genres.join(', ') })
  if (play.languages.length) items.push({ label: 'Language', value: play.languages.join(', ') })
  if (play.targetAudience) items.push({ label: 'Audience', value: play.targetAudience })
  if (play.contentWarnings.length)
    items.push({ label: 'Content warnings', value: play.contentWarnings.join(', ') })

  if (items.length === 0) return null

  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-6 border-y border-rule py-8 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs uppercase tracking-wide text-muted">{item.label}</dt>
          <dd className="mt-1">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
