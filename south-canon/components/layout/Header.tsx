import Link from 'next/link'
import { Container } from '@/components/ui/Container'

const NAV = [
  { href: '/plays', label: 'Catalogue' },
  { href: '/playwrights', label: 'Playwrights' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Header() {
  return (
    <header className="border-b border-rule">
      <Container className="flex items-center justify-between py-6">
        <Link href="/" className="font-display text-xl tracking-[0.18em] uppercase">
          South Canon
        </Link>
        <nav className="flex gap-6 text-sm">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-accent">
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
    </header>
  )
}
