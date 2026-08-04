import Link from 'next/link';
import Image from 'next/image';
import type { SiteConfig } from '@/sites/types';
import SearchBox from './SearchBox';

export default function SiteHeader({ site }: { site: SiteConfig }) {
  return (
    <header className="w-full bg-white border-b border-[var(--color-hairline)]">
      <div className="max-w-[1300px] mx-auto px-6 h-[72px] flex items-center gap-8">
        <Link href="/" className="shrink-0">
          <Image
            src={site.logo.src}
            alt={site.logo.alt}
            width={site.logo.width}
            height={site.logo.height}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-7 flex-1">
          <Link
            href="/"
            className="text-[13px] font-bold uppercase tracking-wide hover:text-[var(--brand-accent)] transition-colors"
          >
            Home
          </Link>
          {site.nav.map(item => (
            <Link
              key={item.slug}
              href={`/${item.slug}`}
              className="text-[13px] font-bold uppercase tracking-wide hover:text-[var(--brand-accent)] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto lg:ml-0">
          <SearchBox />
        </div>
      </div>

      <nav className="lg:hidden border-t border-[var(--color-hairline)] overflow-x-auto">
        <div className="flex gap-5 px-6 py-3 whitespace-nowrap">
          {site.nav.map(item => (
            <Link
              key={item.slug}
              href={`/${item.slug}`}
              className="text-[12px] font-bold uppercase tracking-wide"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}