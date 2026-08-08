'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { PILLARS } from '@/data/taxonomy';

const links = [
  { href: '/', label: 'Home' },
  ...PILLARS,
  { href: '/contact', label: 'Contact' },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  const closeMenu = useCallback(() => {
    setOpen(false);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, closeMenu]);

  return (
    <>
      {/* Hamburger */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="ml-auto mr-5 lg:hidden"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay panel */}
      {open && (
        <div className="fixed inset-0 z-50 bg-ink text-white flex flex-col p-8">
          {/* Close button */}
          <button
            onClick={closeMenu}
            aria-label="Close menu"
            className="absolute top-4 right-4"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation links */}
          <nav className="flex-1 flex flex-col justify-center space-y-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="block text-lg uppercase tracking-wide3 py-4 border-b border-white/10"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Bottom CTA */}
          <div className="mt-auto">
            <Link
              href="/request-a-quote"
              onClick={closeMenu}
              className="block w-full bg-amber text-ink text-center py-4 uppercase font-semibold tracking-wide3 text-sm"
            >
              Request a Quote
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
