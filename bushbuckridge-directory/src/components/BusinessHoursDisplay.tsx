const ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const LABEL: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
}
const JS_TO_KEY = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export default function BusinessHoursDisplay({ hours }: { hours: any }) {
  if (!hours || typeof hours !== 'object') return null
  const hasAny = ORDER.some((d) => hours[d])
  if (!hasAny) return null

  const todayKey = JS_TO_KEY[new Date().getDay()]

  return (
    <div className="rounded-2xl border border-primary/5 overflow-hidden">
      {ORDER.map((d) => {
        const day = hours[d]
        if (!day) return null
        const isToday = d === todayKey
        return (
          <div
            key={d}
            className={`flex items-center justify-between px-5 py-3 text-sm ${isToday ? 'bg-primary/5 font-black text-primary' : 'font-medium text-muted-foreground'} border-b border-primary/5 last:border-0`}
          >
            <span>{LABEL[d]}{isToday ? ' (today)' : ''}</span>
            <span>{day.closed ? 'Closed' : `${day.open || '—'} – ${day.close || '—'}`}</span>
          </div>
        )
      })}
    </div>
  )
}
