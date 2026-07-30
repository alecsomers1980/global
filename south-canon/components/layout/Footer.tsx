'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Container } from '@/components/ui/Container'

export function Footer() {
  const pathname = usePathname()
  if (pathname === '/coming-soon') return null

  return (
    <footer className="mt-24 border-t border-rule py-10 text-sm text-muted">
      <Container className="flex flex-col gap-4 md:flex-row md:justify-between">
        <p>
          South Canon &mdash; theatrical licensing for the global South.
        </p>
        <nav className="flex gap-6">
          <Link href="/privacy" className="hover:text-accent">Privacy</Link>
          <Link href="/terms" className="hover:text-accent">Terms</Link>
        </nav>
      </Container>
    </footer>
  )
}
