"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Accommodation", href: "/accommodation" },
  { label: "Packages", href: "/packages" },
  { label: "Experiences", href: "/experiences" },
  { label: "Gallery", href: "/gallery" },
  { label: "Red Litchi Café", href: "/red-litchi" },
  { label: "Contact Us", href: "/contact" },
];

const adventures = [
  "Red Litchi Farm Café",
  "Communal Pool",
  "Fishing Dam",
  "Nature Walks",
  "Bird Watching",
];

export default function Footer() {
  const pathname = usePathname();
  const [hoveredLink, setHoveredLink] = useState(null);

  if (pathname?.startsWith('/studio')) return null;

  return (
    <footer className="w-full bg-primary text-linen pt-16 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Column 1 — Branding & Vibe */}
        <div className="space-y-5">
          <div className="mb-2">
            <Image
              src="/images/logo.png"
              alt="Mountain Creek Lodge Logo"
              width={200}
              height={60}
              className="h-12 md:h-14 w-auto object-contain"
            />
          </div>
          <p className="text-sm leading-relaxed text-linen/70 max-w-xs">
            A rustic family adventure base nestled in the heart of the Sabie
            River Valley — where the mist meets the mountains and every dawn
            carries the call of the wild.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <span className="block w-8 h-px bg-accent/40" />
            <span className="text-[11px] uppercase tracking-[0.25em] text-linen/40 font-medium">
              Est. Hazyview
            </span>
          </div>
        </div>

        {/* Column 2 — Quick Links */}
        <div className="space-y-5">
          <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-linen/50 mb-2">
            Navigate
          </h3>
          <ul className="space-y-3">
            {quickLinks.map((link, i) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onMouseEnter={() => setHoveredLink(i)}
                  onMouseLeave={() => setHoveredLink(null)}
                  className={`
                    inline-flex items-center gap-2 text-sm transition-all duration-300 ease-out
                    ${
                      hoveredLink === i
                        ? "text-accent translate-x-1.5"
                        : "text-linen/70 hover:text-accent"
                    }
                  `}
                >
                  <span
                    className={`
                      inline-block w-0 h-px bg-accent transition-all duration-300
                      ${hoveredLink === i ? "w-3" : "w-0"}
                    `}
                  />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3 — Adventures & Café */}
        <div className="space-y-5">
          <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-linen/50 mb-2">
            Adventures &amp; Café
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-linen/90">
                Red Litchi Farm Café
              </p>
              <p className="text-xs text-linen/50 mt-1 leading-relaxed max-w-[220px]">
                A delightful country kitchen serving wholesome fare beneath the
                shade of ancient litchi trees.
              </p>
            </div>
            <div className="border-t border-linen/10 pt-4">
              <p className="text-xs uppercase tracking-[0.15em] text-linen/40 mb-3">
                On-Site Features
              </p>
              <ul className="space-y-2">
                {adventures.slice(1).map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-linen/65"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent/60 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Column 4 — Contact Info */}
        <div className="space-y-5">
          <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-linen/50 mb-2">
            Get in Touch
          </h3>
          <ul className="space-y-4">
            <li>
              <a
                href="tel:0829594643"
                className="group flex items-start gap-3 text-sm text-linen/70 hover:text-accent transition-colors duration-300"
              >
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0 text-accent/60 group-hover:text-accent transition-colors duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                  />
                </svg>
                <span>082 959 4643</span>
              </a>
            </li>
            <li>
              <a
                href="mailto:info@mountaincreeklodge.co.za"
                className="group flex items-start gap-3 text-sm text-linen/70 hover:text-accent transition-colors duration-300"
              >
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0 text-accent/60 group-hover:text-accent transition-colors duration-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
                <span>info@mountaincreeklodge.co.za</span>
              </a>
            </li>
            <li>
              <div className="flex items-start gap-3 text-sm text-linen/70">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0 text-accent/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
                <span className="leading-relaxed">
                  R536 Hazyview/Sabie Road,
                  <br />
                  Sabie River Valley,
                  <br />
                  Hazyview, Mpumalanga,
                  <br />
                  South Africa
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright / Bottom strip */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-16 pt-8 border-t border-linen/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-linen/40 font-medium tracking-wider">
        <p>&copy; {new Date().getFullYear()} Mountaincreek Lodge. All Rights Reserved.</p>
        <div className="flex gap-6">
          <a href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</a>
          <a href="/terms" className="hover:text-accent transition-colors">Terms of Use</a>
        </div>
      </div>
    </footer>
  );
}
