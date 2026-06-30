"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";
import { company, nav } from "@/lib/content";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setMobileOpen((prev) => !prev);
  const closeMenu = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/80">
      <div className="container-px flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/images/logo.png"
            width={1628}
            height={597}
            alt={company.name}
            className="h-[44px] w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors ${
                pathname === item.href
                  ? "text-brand"
                  : "text-ink/70 hover:text-brand"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href={company.phoneHref}
            className="text-sm font-medium text-ink/70 hover:text-brand transition-colors flex items-center gap-1"
          >
            <Phone className="w-4 h-4" />
            {company.phone}
          </Link>
          <Link
            href="/contact"
            className="rounded-full bg-brand hover:bg-brand-dark text-white px-5 py-2 text-sm font-medium transition-colors"
          >
            Get a Quote
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 text-ink/70 hover:text-brand transition-colors"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="container-px py-6 flex flex-col gap-6">
            <nav className="flex flex-col gap-4">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`text-base font-medium transition-colors ${
                    pathname === item.href
                      ? "text-brand"
                      : "text-ink/70 hover:text-brand"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link
              href={company.phoneHref}
              onClick={closeMenu}
              className="flex items-center gap-2 text-sm font-medium text-ink/70 hover:text-brand transition-colors"
            >
              <Phone className="w-4 h-4" />
              {company.phone}
            </Link>
            <Link
              href="/contact"
              onClick={closeMenu}
              className="rounded-full bg-brand hover:bg-brand-dark text-white px-5 py-2 text-sm font-medium text-center transition-colors"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}