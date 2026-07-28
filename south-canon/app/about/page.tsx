import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'

export const metadata: Metadata = {
  title: 'About',
  description:
    'South Canon is a premium rights organisation representing playwrights across Africa and the global South.',
}

export default function AboutPage() {
  return (
    <Container className="py-16">
      <h1 className="font-display text-5xl md:text-6xl">About South Canon</h1>
      <div className="mt-10 max-w-3xl space-y-6 text-lg">
        <p>
          South Canon represents playwrights across Africa and the global South, licensing their
          work for performance to schools, community theatres, professional producers and
          international companies.
        </p>
        <p>
          We are built around a simple commitment: writers should know exactly where their work is
          playing, what it has earned, and when they will be paid. Every writer we represent gets a
          full account of their catalogue and their royalties.
        </p>
        <p>
          If you are a producer, start with the{' '}
          <Link href="/plays" className="text-accent hover:underline">catalogue</Link>. If you are a
          writer looking for representation,{' '}
          <Link href="/contact" className="text-accent hover:underline">get in touch</Link>.
        </p>
      </div>
    </Container>
  )
}
