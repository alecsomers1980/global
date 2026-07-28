import type { AvailabilityStatus } from '@/lib/types'

const LABELS: Record<AvailabilityStatus, string> = {
  available: 'Available to licence',
  restricted: 'Restricted',
  unavailable: 'Not currently available',
}

const CLASSES: Record<AvailabilityStatus, string> = {
  available: 'text-available border-available/40 bg-available/5',
  restricted: 'text-restricted border-restricted/40 bg-restricted/5',
  unavailable: 'text-unavailable border-unavailable/40 bg-unavailable/5',
}

/** Status is always carried by the label text, never by colour alone. */
export function AvailabilityBadge({
  status,
  note,
}: {
  status: AvailabilityStatus
  note?: string | null
}) {
  return (
    <span className="inline-flex flex-col gap-1">
      <span
        className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide uppercase ${CLASSES[status]}`}
      >
        {LABELS[status]}
      </span>
      {note ? <span className="text-sm text-muted">{note}</span> : null}
    </span>
  )
}
