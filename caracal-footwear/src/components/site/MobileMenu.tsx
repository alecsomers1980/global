'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface MobileMenuProps {
  links: { href: string; label: string }[];
}

export default function MobileMenu({ links }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const toggle = () => setOpen((prev) => !prev);
  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      closeRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) close();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  return (
    <>
      {/* Hamburger button – visible only below md */}
      <button
        ref={triggerRef}
        className="md:hidden inline-flex items-center justify-center p-2 text-text hover:text-accent transition-colors"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="mobile-menu-overlay"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay */}
      {open && (
        <div
          id="mobile-menu-overlay"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-canvas flex flex-col"
        >
          <div className="flex justify-end p-4">
            <button
              ref={closeRef}
              onClick={close}
              className="p-2 text-text hover:text-accent transition-colors"
              aria-label="Close menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav
            className="flex-1 flex flex-col items-center justify-center gap-8 text-2xl display"
            aria-label="Main navigation"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className="text-text hover:text-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}