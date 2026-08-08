import Link from 'next/link';
import { PILLARS } from '@/data/taxonomy';
import { MobileNav } from './MobileNav';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-ink text-white">
      <div className="flex h-16 items-center">
        {/* Left: Wordmark */}
        <Link href="/" className="px-5 md:px-8">
          <span className="text-sm font-bold uppercase tracking-wide4">
            Kruger Panorama
          </span>
        </Link>

        {/* Centre: Desktop nav */}
        <nav className="hidden lg:flex mx-auto gap-8">
          <Link href="/" className="text-xs uppercase tracking-wide3 hover:text-amber">
            Home
          </Link>
          {PILLARS.map((pillar) => (
            <Link
              key={pillar.slug}
              href={pillar.href}
              className="text-xs uppercase tracking-wide3 hover:text-amber"
            >
              {pillar.label}
            </Link>
          ))}
          <Link href="/contact" className="text-xs uppercase tracking-wide3 hover:text-amber">
            Contact
          </Link>
        </nav>

        {/* Right: Request a Quote (desktop) */}
        <Link
          href="/request-a-quote"
          className="ml-auto hidden lg:flex h-16 items-center bg-amber px-8 text-xs font-semibold uppercase tracking-wide3 text-ink hover:bg-amber-soft"
        >
          Request a Quote
        </Link>

        {/* Mobile menu button (client component) */}
        <MobileNav />
      </div>
    </header>
  );
}
