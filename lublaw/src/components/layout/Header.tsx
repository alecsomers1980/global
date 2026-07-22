"use client";

import { useState } from "react";
import Link from "next/link";
import { NAV_GROUPS } from "@/lib/nav";

export default function Header() {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b border-line bg-paper sticky top-0 z-50">
      <div className="bg-ink text-white text-xs px-4 py-1.5 flex justify-end gap-4">
        <span>Tel: 021 554 4882</span>
        <a href="mailto:info@lublaw.co.za" className="hover:text-gold">info@lublaw.co.za</a>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-heading text-xl text-maroon font-bold">
          B Lubbe &amp; Associates
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {NAV_GROUPS.map((group) => (
            <div
              key={group.label}
              className="relative"
              onMouseEnter={() => setOpenGroup(group.label)}
              onMouseLeave={() => setOpenGroup(null)}
            >
              <Link href={group.href} className="text-sm text-ink hover:text-maroon font-medium py-2 inline-block">
                {group.label}{group.children ? " »" : ""}
              </Link>
              {group.children && openGroup === group.label && (
                <div className="absolute top-full left-0 bg-paper border border-line rounded-lg shadow-lg py-2 min-w-[280px]">
                  {group.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block px-4 py-2 text-sm text-ink hover:bg-surface hover:text-maroon"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <button
          className="lg:hidden text-ink"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {mobileOpen && (
        <nav className="lg:hidden border-t border-line px-4 py-4 space-y-1">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <Link
                href={group.href}
                className="block py-2 text-sm font-medium text-ink"
                onClick={() => setMobileOpen(false)}
              >
                {group.label}
              </Link>
              {group.children && (
                <div className="pl-4 space-y-1">
                  {group.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block py-1.5 text-sm text-muted"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      )}
    </header>
  );
}
