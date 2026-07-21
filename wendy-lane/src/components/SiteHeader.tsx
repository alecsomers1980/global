"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BUSINESS } from "@/data/business";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Wendy Houses", path: "/wendy-houses" },
  { name: "Frame Built Range", path: "/frame-built" },
  { name: "Gallery", path: "/gallery" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (path: string) => pathname === path;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-cream/85 backdrop-blur-md border-b border-ink/10 shadow-soft"
          : "bg-cream border-b border-transparent"
      }`}
    >
      {/* Utility bar */}
      <div className="hidden md:flex items-center justify-between bg-ink text-white/70 text-xs tracking-wide px-6 py-2">
        <div className="flex items-center gap-5">
          <a href={BUSINESS.phone.href} className="hover:text-white transition-colors">
            {BUSINESS.phone.display}
          </a>
          <span className="text-white/20">|</span>
          <a href={`mailto:${BUSINESS.email}`} className="hover:text-white transition-colors">
            {BUSINESS.email}
          </a>
        </div>
        <span className="uppercase tracking-[0.15em] text-white/50">
          Est. 1993 · Nelspruit
        </span>
      </div>

      {/* Main bar */}
      <div className="flex items-center justify-between px-4 lg:px-8 py-3">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/images/logo.png"
            alt="Wendy Lane"
            width={200}
            height={43}
            priority
            className="h-auto w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`relative py-1 text-[0.95rem] transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-brand after:transition-transform after:duration-300 ${
                isActive(link.path)
                  ? "text-ink font-semibold after:scale-x-100"
                  : "text-ink/60 hover:text-ink after:scale-x-0 hover:after:scale-x-100"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* CTA + WhatsApp + Hamburger */}
        <div className="flex items-center gap-3">
          {/* CTA button – visible on sm+ */}
          <Link
            href="/quote"
            className="hidden sm:inline-flex rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition-all hover:bg-brand-600 hover:shadow-lift"
          >
            Get a Quote
          </Link>

          {/* WhatsApp icon */}
          <a
            href={BUSINESS.whatsapp.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp us"
            className="text-ink/70 hover:text-brand transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.768.966-.94 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.787-1.48-1.76-1.653-2.058-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.074-.149-.67-1.611-.918-2.205-.242-.579-.487-.5-.67-.51-.172-.009-.37-.012-.57-.012-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.478 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.078 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.032-1.378l-.36-.214-3.74.981.998-3.649-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.027 6.988 2.892a9.82 9.82 0 0 1 2.892 6.992c-.001 5.45-4.436 9.885-9.889 9.885m8.413-18.297A11.82 11.82 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413z" />
            </svg>
          </a>

          {/* Hamburger toggle */}
          <button
            type="button"
            className="lg:hidden text-ink/70 hover:text-brand transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden absolute left-0 w-full border-t border-ink/10 bg-cream/95 backdrop-blur-md shadow-lift"
        >
          <div className="px-4 py-5 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`block text-lg transition-colors ${
                  isActive(link.path)
                    ? "text-brand font-semibold"
                    : "text-ink/70 hover:text-brand"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <hr className="border-ink/10" />
            <a
              href={BUSINESS.phone.href}
              className="block text-ink/70 hover:text-brand transition-colors"
            >
              {BUSINESS.phone.display}
            </a>
            <a
              href={BUSINESS.whatsapp.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-ink/70 hover:text-brand transition-colors"
            >
              WhatsApp {BUSINESS.whatsapp.display}
            </a>
            <Link
              href="/quote"
              className="inline-flex rounded-full bg-brand px-6 py-2.5 font-semibold text-white transition-colors hover:bg-brand-600"
              onClick={() => setMenuOpen(false)}
            >
              Get a Quote
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
