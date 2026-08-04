import Link from 'next/link';
import MobileMenu from './MobileMenu';

const navLinks = [
  { href: '/range', label: 'Range' },
  { href: '/signature', label: 'Signature' },
  { href: '/story', label: 'Story' },
  { href: '/journal', label: 'Journal' },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-canvas/90 backdrop-blur border-b border-accent/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 md:px-6">
        {/* Wordmark */}
        <Link href="/" className="flex flex-col items-start">
          <span className="display text-accent text-xl leading-none">CARACAL</span>
          <span className="text-[10px] tracking-[0.2em] text-muted leading-tight">
            FOOTWEAR
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-text hover:text-text transition-colors text-sm tracking-wide"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Cart + Mobile menu */}
        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="relative p-1 text-text hover:text-accent transition-colors"
            aria-label="Cart, 0 items"
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span className="absolute -top-1 -right-1 bg-accent text-canvas text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
              0
            </span>
          </Link>
          <MobileMenu links={navLinks} />
        </div>
      </div>
    </header>
  );
}