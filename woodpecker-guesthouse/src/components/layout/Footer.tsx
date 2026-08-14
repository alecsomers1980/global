import Link from "next/link";
import { Logo } from "@/components/site/Logo";
import { SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="bg-ink text-sand/80">
      <div className="max-w-6xl mx-auto px-6 py-16 grid gap-10 sm:grid-cols-2 md:grid-cols-4 text-sm">
        <div className="sm:col-span-2 md:col-span-1">
          <Logo dark className="mb-4" />
          <p className="text-sand/60 leading-relaxed">
            Affordable, family-friendly accommodation and conferencing, minutes from the Kruger National Park.
          </p>
          <div className="flex items-center gap-4 mt-5">
            <a
              href={SITE.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Woodpecker Guesthouse on Facebook"
              className="w-9 h-9 rounded-full border border-sand/25 flex items-center justify-center hover:border-terracotta hover:text-terracotta transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
              </svg>
            </a>
            <a
              href={SITE.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Woodpecker Guesthouse on Instagram"
              className="w-9 h-9 rounded-full border border-sand/25 flex items-center justify-center hover:border-terracotta hover:text-terracotta transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07c-1.28.06-2.15.26-2.91.56a5.87 5.87 0 0 0-2.13 1.38A5.87 5.87 0 0 0 .63 4.14c-.3.76-.5 1.63-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.28.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13.67.66 1.34 1.07 2.13 1.38.76.3 1.63.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.28-.06 2.15-.26 2.91-.56a5.87 5.87 0 0 0 2.13-1.38 5.87 5.87 0 0 0 1.38-2.13c.3-.76.5-1.63.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.28-.26-2.15-.56-2.91a5.87 5.87 0 0 0-1.38-2.13A5.87 5.87 0 0 0 19.86.63c-.76-.3-1.63-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84Zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4Zm6.41-10.4a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44Z" />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <p className="text-paper font-medium mb-4 tracking-wide">Explore</p>
          <ul className="space-y-2.5">
            <li><Link href="/accommodation" className="hover:text-terracotta transition-colors">Accommodation</Link></li>
            <li><Link href="/conferencing" className="hover:text-terracotta transition-colors">Conferencing</Link></li>
            <li><Link href="/restaurant" className="hover:text-terracotta transition-colors">Restaurant</Link></li>
            <li><Link href="/attractions" className="hover:text-terracotta transition-colors">Attractions</Link></li>
            <li><Link href="/blog" className="hover:text-terracotta transition-colors">Blog</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-paper font-medium mb-4 tracking-wide">Get In Touch</p>
          <ul className="space-y-2.5">
            <li>
              <a href={SITE.address.mapsHref} target="_blank" rel="noopener noreferrer" className="hover:text-terracotta transition-colors">
                {SITE.address.line1}<br />{SITE.address.line2}
              </a>
            </li>
            <li><a href={SITE.phone.href} className="hover:text-terracotta transition-colors">{SITE.phone.display}</a></li>
            <li><a href={SITE.phoneSecondary.href} className="hover:text-terracotta transition-colors">{SITE.phoneSecondary.display}</a></li>
            <li><a href={`mailto:${SITE.email}`} className="hover:text-terracotta transition-colors break-all">{SITE.email}</a></li>
          </ul>
        </div>

        <div>
          <p className="text-paper font-medium mb-4 tracking-wide">Legal</p>
          <ul className="space-y-2.5">
            <li><Link href="/privacy-policy" className="hover:text-terracotta transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms-conditions" className="hover:text-terracotta transition-colors">Terms &amp; Conditions</Link></li>
            <li><Link href="/contact" className="hover:text-terracotta transition-colors">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-sand/10">
        <p className="max-w-6xl mx-auto px-6 py-6 text-center text-xs text-sand/50">
          © {new Date().getFullYear()} Woodpecker Guesthouse. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
