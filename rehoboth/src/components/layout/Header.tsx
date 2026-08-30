"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "Our Story" },
  { href: "/journal", label: "Journal" },
  { href: "/stockists", label: "Stockists" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-hairline bg-ground">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-5 md:px-16">
        <Link href="/" aria-label="Rehoboth Herbal Co. home">
          <Image
            src="/brand/wordmark-dark.png"
            alt="Rehoboth Herbal Co."
            width={620}
            height={118}
            priority
            className="h-6 w-auto md:h-7"
          />
        </Link>

        <nav className="hidden items-center gap-9 text-sm md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-ink hover:text-brand">
              {item.label}
            </Link>
          ))}
          <Link href="/cart" aria-label="Cart" className="text-ink hover:text-brand">
            <CartIcon />
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
            <span className="block h-px w-6 bg-ink" />
            <span className="block h-px w-6 bg-ink" />
            <span className="block h-px w-6 bg-ink" />
          </span>
        </button>
      </div>

      {open && (
        <nav className="flex flex-col border-t border-hairline px-6 pb-4 md:hidden">
          {[...NAV, { href: "/cart", label: "Cart" }].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex min-h-[44px] items-center border-b border-hairline text-sm last:border-0"
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
