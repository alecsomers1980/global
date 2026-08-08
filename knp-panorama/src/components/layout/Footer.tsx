import Link from 'next/link';
import { PILLARS } from '@/data/taxonomy';
import { SITE } from '@/data/site';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-white py-16">
      <div className="container-kpe">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Wordmark + description */}
          <div>
            <p className="text-sm font-bold uppercase tracking-wide4 mb-4">
              Kruger Panorama Experience
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              Community‑driven safaris and tours in the Mpumalanga Lowveld, led by local guides
              who share the region’s rich biodiversity and cultural heritage.
            </p>
          </div>

          {/* Column 2: Explore */}
          <div>
            <h3 className="text-xs uppercase tracking-wide3 text-amber mb-4">Explore</h3>
            <ul className="space-y-2">
              {PILLARS.map((pillar) => (
                <li key={pillar.slug}>
                  <Link
                    href={pillar.href}
                    className="text-sm text-white/70 hover:text-amber"
                  >
                    {pillar.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="text-xs uppercase tracking-wide3 text-amber mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-sm text-white/70 hover:text-amber">
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/request-a-quote"
                  className="text-sm text-white/70 hover:text-amber"
                >
                  Request a Quote
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-xs uppercase tracking-wide3 text-amber mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-white/70 leading-relaxed">
              <li>
                <a href={`tel:${SITE.phoneHref}`}>{SITE.phone}</a>
              </li>
              <li>
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </li>
              <li>
                <a
                  href={SITE.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </li>
              <li>{SITE.region}</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/50">
            © {year} Kruger Panorama Experience. {SITE.legalName}.
          </p>
          <Link
            href="/image-credits"
            className="text-xs text-white/50 hover:text-amber"
          >
            Image Credits
          </Link>
        </div>
      </div>
    </footer>
  );
}
