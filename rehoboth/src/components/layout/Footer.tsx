"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SocialRow } from "./SocialRow";
import { fetchSocialLinks } from "@/app/_actions/social";
import { EMPTY_SOCIAL, type SocialLinks } from "@/lib/social";

/**
 * The footer carries the brand teal as a ground rather than an accent — it is
 * the one full-width block on every page where the colour can do that without
 * competing with product photography. --brand-night is deep enough that white
 * at 70% still clears 4.5:1, which is what makes the fine print legible on it.
 */
export function Footer() {
  const [social, setSocial] = useState<SocialLinks>(EMPTY_SOCIAL);

  useEffect(() => {
    fetchSocialLinks().then(setSocial).catch(() => {
      // Leaving the icons out is the right failure: a row of links that go
      // nowhere reads worse than no row at all.
    });
  }, []);

  return (
    <footer className="mt-24 bg-brand-night text-white">
      <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Image
              src="/brand/wordmark-light.png"
              alt="Rehoboth Herbal Co."
              width={620}
              height={118}
              className="h-7 w-auto"
            />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/70">
              Grown, dried and packed at Rehoboth Farm — Portion 21 of Farm 277JU
              Lovedale, Honeybird, Low&rsquo;s Creek, Mpumalanga.
            </p>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <h2 className="font-display text-base text-white">Shop</h2>
            <Link href="/shop" className="text-white/70 transition-colors hover:text-white">All products</Link>
            <Link href="/stockists" className="text-white/70 transition-colors hover:text-white">Become a stockist</Link>
            <Link href="/about" className="text-white/70 transition-colors hover:text-white">Our story</Link>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <h2 className="font-display text-base text-white">Contact</h2>
            <p className="text-white/70">Frieda Grobler</p>
            <a href="tel:+27828249023" className="text-white/70 transition-colors hover:text-white">082 824 9023</a>
            <a
              href="mailto:friedsgrobler@gmail.com"
              className="break-all text-white/70 transition-colors hover:text-white"
            >
              friedsgrobler@gmail.com
            </a>
            <Link href="/contact" className="text-white/70 transition-colors hover:text-white">Contact us</Link>
            <div className="-ml-3 mt-1">
              <SocialRow links={social} tone="dark" />
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/15 pt-7 text-[13px] text-white/70 md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} Rehoboth Herbal Co. &middot; [REG NUMBER]</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="transition-colors hover:text-white">Privacy</Link>
            <Link href="/terms" className="transition-colors hover:text-white">Terms</Link>
            <Link href="/returns" className="transition-colors hover:text-white">Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
