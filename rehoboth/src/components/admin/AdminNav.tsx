"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";

export type NavItem = { href: string; label: string };
export type NavGroup = { heading: string; items: NavItem[] };

/**
 * The admin rail.
 *
 * Grouped rather than one flat run of six links, because the flat row it
 * replaces gave no hint that Orders and Products are the same job and Settings
 * is a different one. The headings name the job, not the table: "Enquiries"
 * holds Messages and Stockists because answering people is one sitting.
 *
 * It is the deep brand teal, the same colour as the site footer — the admin is
 * meant to feel like the back of the same shop, not a different application.
 */
const GROUPS: NavGroup[] = [
  { heading: "Overview", items: [{ href: "/admin", label: "Dashboard" }] },
  {
    heading: "Selling",
    items: [
      { href: "/admin/orders", label: "Orders" },
      { href: "/admin/products", label: "Products" },
    ],
  },
  {
    heading: "Enquiries",
    items: [
      { href: "/admin/messages", label: "Messages" },
      { href: "/admin/stockists", label: "Stockists" },
    ],
  },
  { heading: "Setup", items: [{ href: "/admin/settings", label: "Settings" }] },
];

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  /**
   * Longest-prefix match rather than startsWith per item: /admin is a prefix
   * of every other route, so a plain prefix test lights up Dashboard on every
   * screen. Matching the most specific href is the only rule that also gets a
   * future /admin/orders/<id> right.
   */
  const activeHref = GROUPS.flatMap((g) => g.items)
    .filter((i) => pathname === i.href || pathname.startsWith(`${i.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  async function signOut() {
    setSigningOut(true);
    await getBrowserClient().auth.signOut();
    router.replace("/account/login");
  }

  const nav = (
    <nav className="flex flex-col gap-7">
      {GROUPS.map((group) => (
        <div key={group.heading}>
          <p className="px-5 text-[10px] uppercase tracking-[0.26em] text-white/35">
            {group.heading}
          </p>
          <ul className="mt-3 flex flex-col">
            {group.items.map((item) => {
              const active = item.href === activeHref;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`block border-l-2 py-2.5 pl-[calc(1.25rem-2px)] pr-5 text-[14px] transition-colors ${
                      active
                        ? "border-brand bg-brand-lift text-white"
                        : "border-transparent text-white/60 hover:bg-brand-lift/50 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const footer = (
    <div className="border-t border-white/10 px-5 pt-5">
      <p className="truncate text-[13px] text-white/80">{email}</p>
      <span className="mt-2 inline-flex bg-brand/25 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/85">
        Admin
      </span>
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
        <Link
          href="/"
          className="text-[11px] uppercase tracking-[0.16em] text-white/45 transition-colors hover:text-white"
        >
          View shop
        </Link>
        <button
          type="button"
          onClick={signOut}
          disabled={signingOut}
          className="text-[11px] uppercase tracking-[0.16em] text-white/45 transition-colors hover:text-white disabled:opacity-50"
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );

  const wordmark = (
    <Image
      src="/brand/wordmark-light.png"
      alt="Rehoboth Herbal Co. admin"
      width={620}
      height={118}
      className="h-5 w-auto"
    />
  );

  return (
    <>
      {/* Phone: the rail is too tall to inline, so it becomes a drawer. */}
      <div className="flex items-center justify-between gap-4 bg-brand-night px-5 py-4 lg:hidden">
        <Link href="/admin">{wordmark}</Link>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="flex min-h-[44px] items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-white"
        >
          {open ? "Close" : "Menu"}
          <span aria-hidden className="flex flex-col gap-[3px]">
            <span className="block h-px w-4 bg-white" />
            <span className="block h-px w-4 bg-white" />
            <span className="block h-px w-4 bg-white" />
          </span>
        </button>
      </div>
      {open && (
        <div className="bg-brand-night pb-8 lg:hidden">
          {nav}
          <div className="mt-8">{footer}</div>
        </div>
      )}

      {/* Desktop: sticky and self-scrolling, so a long orders table never
          pushes the navigation off the screen. */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto bg-brand-night py-7 lg:flex">
        <Link href="/admin" className="mb-9 px-5">
          {wordmark}
        </Link>
        {nav}
        <div className="mt-auto pt-9">{footer}</div>
      </aside>
    </>
  );
}
