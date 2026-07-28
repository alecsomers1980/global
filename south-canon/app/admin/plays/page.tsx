import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminPlays() {
  const db = createServiceClient()
  const { data } = await db.from('plays').select('id, title, status').order('title')

  return (
    <Container className="py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Plays</h1>
        <Link href="/admin/plays/new" className="bg-accent px-6 py-3 text-sm uppercase tracking-wide text-paper">
          Add play
        </Link>
      </div>
      <ul className="mt-10 divide-y divide-rule border-t border-rule">
        {(data ?? []).map((p) => (
          <li key={p.id} className="flex items-center justify-between py-4">
            <Link href={`/admin/plays/${p.id}`} className="hover:text-accent">{p.title}</Link>
            <span className="text-xs uppercase tracking-wide text-muted">{p.status}</span>
          </li>
        ))}
      </ul>
    </Container>
  )
}