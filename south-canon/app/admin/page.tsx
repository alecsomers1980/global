import { Container } from '@/components/ui/Container'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const db = createServiceClient()
  const [plays, playwrights, enquiries] = await Promise.all([
    db.from('plays').select('id', { count: 'exact', head: true }),
    db.from('playwrights').select('id', { count: 'exact', head: true }),
    db.from('enquiries').select('id', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Plays', value: plays.count ?? 0 },
    { label: 'Playwrights', value: playwrights.count ?? 0 },
    { label: 'Enquiries', value: enquiries.count ?? 0 },
  ]

  return (
    <Container className="py-16">
      <h1 className="font-display text-4xl">Dashboard</h1>
      <dl className="mt-10 grid gap-8 md:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="border-t border-rule pt-4">
            <dt className="text-xs uppercase tracking-wide text-muted">{s.label}</dt>
            <dd className="font-display text-5xl">{s.value}</dd>
          </div>
        ))}
      </dl>
    </Container>
  )
}