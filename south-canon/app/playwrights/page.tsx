import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { PlaywrightCard } from '@/components/play/PlaywrightCard'
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
      <div className="mt-12">
        {playwrights.map((p) => (
          <PlaywrightCard key={p.slug} playwright={p} />
        ))}
      </div>
    </Container>
  )
}
