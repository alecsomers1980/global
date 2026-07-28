import { AvailabilityBadge } from '@/components/ui/AvailabilityBadge'
import { resolveAvailability } from '@/lib/availability'
import { TERRITORIES, type RightsRow } from '@/lib/types'

export function RightsTable({ rights }: { rights: RightsRow[] }) {
  if (rights.length === 0) return null
  return (
    <section>
      <h2 className="font-display text-3xl">Rights and availability</h2>
      <ul className="mt-6 divide-y divide-rule border-t border-rule">
        {TERRITORIES.map((territory) => {
          const { status, note } = resolveAvailability(rights, territory)
          return (
            <li key={territory} className="grid gap-2 py-4 md:grid-cols-[200px_1fr] md:items-center">
              <p>{territory}</p>
              <AvailabilityBadge status={status} note={note} />
            </li>
          )
        })}
      </ul>
    </section>
  )
}
