"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { siteConfig, nav } from "@/lib/content";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-brand-cream relative">
      <div className="container mx-auto flex items-center justify-between py-4 px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src="/images/nyoni-logo.png"
            alt={siteConfig.name}
            width={160}
            height={48}
            priority
            className="h-12"
          />
        </Link>

        {/* Desktop Nav + CTA */}
        <div className="hidden md:flex items-center gap-6">
          <nav aria-label="Main navigation" className="flex items-center gap-6">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-heading text-brand-navy hover:text-brand-teal transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/admissions"
            className="inline-block bg-brand-sand text-white font-semibold rounded-full px-5 py-2 hover:bg-brand-sand/90 transition-colors"
          >
            Enquire Now
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          aria-label={isOpen ? "Close menu" : "Open menu"}
          className="md:hidden p-2 text-brand-navy"
          onClick={toggleMenu}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-brand-cream border-t border-brand-sky/30 shadow-lg">
          <nav aria-label="Mobile navigation" className="flex flex-col items-center gap-4 py-8 px-4">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-heading text-brand-navy text-lg hover:text-brand-teal transition-colors"
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/admissions"
              className="mt-4 inline-block bg-brand-sand text-white font-semibold rounded-full px-6 py-3 hover:bg-brand-sand/90 transition-colors"
              onClick={closeMenu}
            >
              Enquire Now
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
