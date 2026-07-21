"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { CONCERNS, RANGES } from "@/lib/nav";
import { useCartStore, cartCount } from "@/store/cart";
import CartDrawer from "@/components/site/CartDrawer";
import { AnimatePresence, motion } from "framer-motion";

export default function Header() {
  const items = useCartStore((s) => s.items);
  const setCartOpen = useCartStore((s) => s.setOpen);
  const count = cartCount(items);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [concernsOpen, setConcernsOpen] = useState(false);
  const [rangesOpen, setRangesOpen] = useState(false);
  // One timer PER menu — a shared timer let "enter Concerns" cancel the
  // pending close of Ranges, leaving both dropdowns open.
  const concernsTimeout = useRef<NodeJS.Timeout | null>(null);
  const rangesTimeout = useRef<NodeJS.Timeout | null>(null);
  const concernsRef = useRef<HTMLDivElement>(null);
  const rangesRef = useRef<HTMLDivElement>(null);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (concernsTimeout.current) clearTimeout(concernsTimeout.current);
      if (rangesTimeout.current) clearTimeout(rangesTimeout.current);
    };
  }, []);

  const openConcerns = () => {
    if (concernsTimeout.current) clearTimeout(concernsTimeout.current);
    setRangesOpen(false);
    setConcernsOpen(true);
  };
  const openRanges = () => {
    if (rangesTimeout.current) clearTimeout(rangesTimeout.current);
    setConcernsOpen(false);
    setRangesOpen(true);
  };

  const handleConcernsMouseEnter = openConcerns;
  const handleConcernsMouseLeave = () => {
    concernsTimeout.current = setTimeout(() => setConcernsOpen(false), 200);
  };
  const handleConcernsFocus = openConcerns;
  const handleConcernsBlur = (e: React.FocusEvent) => {
    if (!concernsRef.current?.contains(e.relatedTarget as Node)) {
      concernsTimeout.current = setTimeout(() => setConcernsOpen(false), 200);
    }
  };

  const handleRangesMouseEnter = openRanges;
  const handleRangesMouseLeave = () => {
    rangesTimeout.current = setTimeout(() => setRangesOpen(false), 200);
  };
  const handleRangesFocus = openRanges;
  const handleRangesBlur = (e: React.FocusEvent) => {
    if (!rangesRef.current?.contains(e.relatedTarget as Node)) {
      rangesTimeout.current = setTimeout(() => setRangesOpen(false), 200);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur-md border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center shrink-0"
              aria-label="Diana's Bulbinella home"
            >
              <Image
                src="/images/logo.png"
                alt="Diana's Bulbinella"
                width={104}
                height={60}
                priority
                className="h-12 w-auto lg:h-14"
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1 text-sm text-ink font-medium">
              <Link
                href="/shop"
                className="px-3 py-2 hover:text-amber transition-colors rounded-full"
              >
                Shop
              </Link>

              {/* Concerns dropdown */}
              <div
                className="relative"
                ref={concernsRef}
                onMouseEnter={handleConcernsMouseEnter}
                onMouseLeave={handleConcernsMouseLeave}
                onFocus={handleConcernsFocus}
                onBlur={handleConcernsBlur}
              >
                <button
                  className="px-3 py-2 hover:text-amber transition-colors rounded-full focus:outline-none"
                  aria-expanded={concernsOpen}
                  aria-haspopup="menu"
                >
                  Concerns
                </button>
                <AnimatePresence>
                  {concernsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-72 bg-surface border border-line rounded-2xl shadow-xl p-5 z-40"
                    >
                      <div className="space-y-1">
                        {CONCERNS.map((concern) => (
                          <Link
                            key={concern.slug}
                            href={`/shop/${concern.slug}`}
                            className="block rounded-xl px-3 py-2.5 hover:bg-paper transition-colors"
                            onClick={() => setConcernsOpen(false)}
                          >
                            <span className="font-medium text-ink">
                              {concern.name}
                            </span>
                            <p className="text-xs text-muted mt-0.5">
                              {concern.blurb}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Ranges dropdown */}
              <div
                className="relative"
                ref={rangesRef}
                onMouseEnter={handleRangesMouseEnter}
                onMouseLeave={handleRangesMouseLeave}
                onFocus={handleRangesFocus}
                onBlur={handleRangesBlur}
              >
                <button
                  className="px-3 py-2 hover:text-amber transition-colors rounded-full focus:outline-none"
                  aria-expanded={rangesOpen}
                  aria-haspopup="menu"
                >
                  Ranges
                </button>
                <AnimatePresence>
                  {rangesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-[34rem] bg-surface border border-line rounded-2xl shadow-xl p-6 z-40 grid grid-cols-3 gap-x-8 gap-y-1"
                    >
                      {RANGES.map((range) => (
                        <Link
                          key={range.slug}
                          href={`/range/${range.slug}`}
                          className="block rounded-lg px-3 py-1.5 text-ink hover:text-amber hover:bg-paper transition-colors text-sm"
                          onClick={() => setRangesOpen(false)}
                        >
                          {range.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/specials"
                className="relative px-3 py-2 hover:text-amber transition-colors rounded-full inline-flex items-center"
              >
                Specials
                <span className="absolute -top-0.5 right-1 w-1.5 h-1.5 bg-amber rounded-full" />
              </Link>
              <Link
                href="/about"
                className="px-3 py-2 hover:text-amber transition-colors rounded-full"
              >
                Our Story
              </Link>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/search"
                aria-label="Search"
                className="p-2 text-ink hover:text-amber transition-colors rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </Link>

              <Link
                href="/account"
                aria-label="My account"
                className="p-2 text-ink hover:text-amber transition-colors rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>

              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-ink hover:text-amber transition-colors rounded-full"
                aria-label="Open basket"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                {mounted && count > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[1.125rem] h-[1.125rem] text-[10px] font-bold leading-none text-white bg-amber rounded-full px-1">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileOpen(true)}
                className="p-2 text-ink lg:hidden hover:text-amber transition-colors rounded-full"
                aria-label="Open menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-surface z-50 shadow-2xl flex flex-col lg:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="p-6 flex items-center justify-between border-b border-line">
                <span className="text-lg text-ink font-[family-name:var(--font-fraunces)]">
                  Menu
                </span>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 text-muted hover:text-ink transition-colors"
                  aria-label="Close menu"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <Link
                  href="/shop"
                  onClick={() => setIsMobileOpen(false)}
                  className="block text-lg font-medium text-ink hover:text-amber transition-colors"
                >
                  Shop
                </Link>

                <MobileAccordion
                  title="Concerns"
                  links={CONCERNS.map((c) => ({
                    name: c.name,
                    href: `/shop/${c.slug}`,
                  }))}
                  onClose={() => setIsMobileOpen(false)}
                />

                <MobileAccordion
                  title="Ranges"
                  links={RANGES.map((r) => ({
                    name: r.name,
                    href: `/range/${r.slug}`,
                  }))}
                  onClose={() => setIsMobileOpen(false)}
                />

                <Link
                  href="/specials"
                  onClick={() => setIsMobileOpen(false)}
                  className="block text-lg font-medium text-ink hover:text-amber transition-colors"
                >
                  Specials
                </Link>
                <Link
                  href="/about"
                  onClick={() => setIsMobileOpen(false)}
                  className="block text-lg font-medium text-ink hover:text-amber transition-colors"
                >
                  Our Story
                </Link>
                <Link
                  href="/search"
                  onClick={() => setIsMobileOpen(false)}
                  className="block text-lg font-medium text-ink hover:text-amber transition-colors"
                >
                  Search
                </Link>
                <Link
                  href="/account"
                  onClick={() => setIsMobileOpen(false)}
                  className="block text-lg font-medium text-ink hover:text-amber transition-colors"
                >
                  My account
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CartDrawer />
    </>
  );
}

function MobileAccordion({
  title,
  links,
  onClose,
}: {
  title: string;
  links: { name: string; href: string }[];
  onClose: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-line pb-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-lg font-medium text-ink py-2"
        aria-expanded={open}
      >
        <span>{title}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-1 pb-2 space-y-1 pl-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="block px-2 py-1.5 rounded-lg text-ink/80 hover:text-amber hover:bg-paper transition-colors text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
