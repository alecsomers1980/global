import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { listPlaywrights } from '@/lib/playwrights'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Playwrights',
  description: 'The writers represented by South Canon.',
}

export default async function PlaywrightsPage() {
  const playwrights = await listPlaywrights()
  return (
    <Container className="py-16">
      <h1 className="font-display text-5xl md:text-6xl">Playwrights</h1>
      <ul className="mt-12 divide-y divide-rule border-t border-rule">
        {playwrights.map((p) => (
          <li key={p.slug} className="py-8">
            <Link href={`/playwrights/${p.slug}`} className="group">
              <h2 className="font-display text-3xl group-hover:text-accent">{p.name}</h2>
              {p.country && <p className="mt-1 text-sm text-muted">{p.country}</p>}
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  )
}
