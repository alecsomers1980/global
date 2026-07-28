import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminPlaywrights() {
  const db = createServiceClient()
  const { data } = await db.from('playwrights').select('id, name, slug, status').order('name')

  return (
    <Container className="py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Playwrights</h1>
        <Link href="/admin/playwrights/new" className="bg-accent px-6 py-3 text-sm uppercase tracking-wide text-paper">
          Add playwright
        </Link>
      </div>
      <ul className="mt-10 divide-y divide-rule border-t border-rule">
        {(data ?? []).map((w) => (
          <li key={w.id} className="flex items-center justify-between py-4">
            <Link href={`/admin/playwrights/${w.id}`} className="hover:text-accent">{w.name}</Link>
            <span className="text-xs uppercase tracking-wide text-muted">{w.status}</span>
          </li>
        ))}
      </ul>
    </Container>
  )
}