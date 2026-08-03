"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { nav, serviceLinks } from "@/data/site";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  const closeMobileMenu = () => {
    setOpen(false);
    setServicesOpen(false);
  };

  return (
    <header className="absolute top-0 left-0 w-full z-50">
      <div className="el-container flex items-center justify-between h-24">
        <Link href="/">
          <Image
            src="/images/logoWhite.png"
            alt="Endless Luxury"
            width={190}
            height={48}
            className="h-auto w-auto max-h-12"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {nav.map((item) => {
            const isActive = pathname === item.href;
            if (item.label === "Services") {
              return (
                <div key={item.label} className="relative group">
                  <Link
                    href={item.href}
                    className={`text-sm uppercase tracking-wide font-heading transition ${
                      isActive
                        ? "text-gold"
                        : "text-white/90 hover:text-gold"
                    }`}
                  >
                    {item.label}
                  </Link>
                  <div className="absolute left-0 mt-2 min-w-[240px] bg-white text-navy rounded-[10px] shadow-lg py-2 hidden group-hover:block">
                    {serviceLinks.map((sl) => (
                      <Link
                        key={sl.anchor}
                        href={`/services#${sl.anchor}`}
                        className="block px-4 py-2 text-sm hover:bg-cream hover:text-gold"
                      >
                        {sl.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm uppercase tracking-wide font-heading transition ${
                  isActive
                    ? "text-gold"
                    : "text-white/90 hover:text-gold"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden text-white"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {open ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="absolute top-full left-0 w-full bg-navy-dark/95 backdrop-blur lg:hidden">
          <nav className="flex flex-col">
            {nav.map((item) => {
              if (item.label === "Services") {
                return (
                  <div key={item.label}>
                    <button
                      onClick={() => setServicesOpen(!servicesOpen)}
                      className="block w-full text-left px-5 py-3 text-white border-b border-white/10 hover:text-gold uppercase text-sm font-heading tracking-wide"
                    >
                      {item.label}
                    </button>
                    {servicesOpen && (
                      <div className="pl-6 flex flex-col border-b border-white/10">
                        {serviceLinks.map((sl) => (
                          <Link
                            key={sl.anchor}
                            href={`/services#${sl.anchor}`}
                            onClick={closeMobileMenu}
                            className="block px-5 py-2 text-white/80 text-sm hover:text-gold"
                          >
                            {sl.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="block px-5 py-3 text-white border-b border-white/10 hover:text-gold uppercase text-sm font-heading tracking-wide"
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
