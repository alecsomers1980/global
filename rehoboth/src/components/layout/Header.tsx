"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart, countOf } from "@/lib/cart";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "Our Story" },
  { href: "/stockists", label: "Stockists" },
];

/**
 * `tone="dark"` renders the header transparently for pages whose banner runs
 * full-bleed underneath it — a light bar butting against a dark banner reads
 * as a seam.
 */
export function Header({ tone = "light" }: { tone?: "light" | "dark" }) {
  const [open, setOpen] = useState(false);

  // The cart hydrates from localStorage, so the count only renders after mount
  // — otherwise the server's 0 and the client's value disagree.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = countOf(useCart((s) => s.items));

  const dark = tone === "dark";

  return (
    <header
      className={
        dark
          ? "relative z-20 bg-transparent"
          : "relative z-20 border-b border-hairline bg-ground"
      }
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-5 md:px-16">
        <Link href="/" aria-label="Rehoboth Herbal Co. home">
          <Image
            src={dark ? "/brand/wordmark-light.png" : "/brand/wordmark-dark.png"}
            alt="Rehoboth Herbal Co."
            width={620}
            height={118}
            priority
            className="h-6 w-auto md:h-7"
          />
        </Link>

        <nav className="hidden items-center gap-9 text-sm md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={dark ? "text-white/85 hover:text-white" : "text-ink hover:text-brand"}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/cart"
            aria-label={mounted && count > 0 ? `Cart, ${count} items` : "Cart"}
            className={`relative ${dark ? "text-white/85 hover:text-white" : "text-ink hover:text-brand"}`}
          >
            <CartIcon />
            {mounted && count > 0 && (
              <span
                className={`absolute -right-2 -top-2 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[11px] leading-none ${
                  dark ? "bg-white text-ink" : "bg-brand text-brand-ink"
                }`}
              >
                {count}
              </span>
            )}
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="grid h-11 w-11 place-items-center md:hidden"
        >
          <span className="flex flex-col gap-[5px]">
            <span className={`block h-px w-6 ${dark ? "bg-white" : "bg-ink"}`} />
            <span className={`block h-px w-6 ${dark ? "bg-white" : "bg-ink"}`} />
            <span className={`block h-px w-6 ${dark ? "bg-white" : "bg-ink"}`} />
          </span>
        </button>
      </div>

      {open && (
        <nav
          className={`flex flex-col px-6 pb-4 md:hidden ${
            dark ? "bg-[#10201C]" : "border-t border-hairline"
          }`}
        >
          {[...NAV, { href: "/cart", label: "Cart" }].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex min-h-[44px] items-center border-b text-sm last:border-0 ${
                dark ? "border-white/15 text-white/90" : "border-hairline text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

function CartIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M6 8h12l-1 12H7L6 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}
