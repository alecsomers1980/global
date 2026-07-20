import Link from "next/link";
import Image from "next/image";
import { CONCERNS, DISCLAIMER } from "@/lib/nav";

export default function Footer() {
  return (
    <footer className="bg-forest text-paper/75 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Image
              src="/images/logo.png"
              alt="Diana's Bulbinella"
              width={139}
              height={80}
              className="h-20 w-auto brightness-0 invert opacity-90"
            />
            <p className="text-sm leading-relaxed text-paper/60">
              Small‑batch botanical skincare rooted in indigenous South African
              plants. Prepared by hand with generations of trust.
            </p>
            <p className="text-xs text-paper/40">
              Handmade in White River, Mpumalanga, South Africa.
            </p>
          </div>

          {/* Shop by concern */}
          <div>
            <h3 className="font-medium text-paper mb-4 text-sm uppercase tracking-wider">
              Shop by concern
            </h3>
            <ul className="space-y-2 text-sm">
              {CONCERNS.map((concern) => (
                <li key={concern.slug}>
                  <Link
                    href={`/shop/${concern.slug}`}
                    className="hover:text-amber transition-colors"
                  >
                    {concern.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer care */}
          <div>
            <h3 className="font-medium text-paper mb-4 text-sm uppercase tracking-wider">
              Customer care
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { name: "FAQ", href: "/faq" },
                { name: "Contact", href: "/contact" },
                { name: "Find a dealer", href: "/dealers" },
                { name: "Disclaimer", href: "/disclaimer" },
                { name: "Specials", href: "/specials" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-amber transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Stay in touch */}
          <div>
            <h3 className="font-medium text-paper mb-4 text-sm uppercase tracking-wider">
              Stay in touch
            </h3>
            <p className="text-sm text-paper/60 mb-4 leading-relaxed">
              Monthly specials and new products — only with your consent.
              Unsubscribe anytime.
            </p>
            <form action="#" className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 rounded-full bg-moss/40 border border-paper/20 placeholder:text-paper/40 px-4 py-2.5 text-sm outline-none focus:border-amber/50 transition-colors"
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                className="rounded-full bg-amber text-paper px-6 py-2.5 text-sm font-medium hover:bg-amber-deep transition-colors shrink-0"
              >
                Sign up
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-paper/15 pt-6 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-paper/50">
          <p>
            &copy; 2026 Diana&apos;s Bulbinella. All rights reserved.
          </p>
          <p>Natural products, honestly described.</p>
        </div>

        {/* Disclaimer */}
        <p className="max-w-3xl text-[11px] leading-relaxed text-paper/40 mt-8">
          {DISCLAIMER}
        </p>
      </div>
    </footer>
  );
}
