import Link from 'next/link';
import { CATEGORY_LABELS, CATEGORY_SLUGS, ALL_CATEGORIES } from '@/lib/supabase/types';
import { getSiteSettings } from '@/lib/queries/products';
import { formatZAR } from '@/lib/money';

export default async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer role="contentinfo">
      {/* Top strip */}
      <div className="border-y border-accent/20 py-3">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs uppercase tracking-wider text-muted px-4">
          <span>
            Free delivery over{' '}
            {formatZAR(Number(settings.delivery_free_threshold))}
          </span>
          <span className="hidden md:inline mx-2" aria-hidden="true">·</span>
          <span>Handmade in South Africa</span>
          <span className="hidden md:inline mx-2" aria-hidden="true">·</span>
          <span>Sizes 4 to 15</span>
        </div>
      </div>

      {/* Main footer content */}
      <div className="bg-surface">
        {/*
          [&>*]:min-w-0 is load-bearing: grid items default to min-width:auto,
          so a long unbreakable token (the contact email) refuses to shrink and
          pushes the whole page 10px wider than the viewport at exactly 768px.
        */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10 [&>*]:min-w-0">
          {/* Brand column */}
          <div>
            <h2 className="display text-2xl">CARACAL</h2>
            <p className="text-xs uppercase tracking-[0.2em] text-muted mt-1">
              FOOTWEAR
            </p>
            <div className="mt-6 space-y-4 text-sm text-muted">
              <p>
                Handcrafted vellies in genuine leather, on a non-slip TPR sole.
              </p>
              <p>
                Made to order in {settings.lead_time}. Delivered countrywide.
              </p>
            </div>
          </div>

          {/* Shop column */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-text mb-4">
              Shop
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/range"
                  className="text-sm text-muted hover:text-text transition-colors"
                >
                  All Vellies
                </Link>
              </li>
              {ALL_CATEGORIES.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/range/${CATEGORY_SLUGS[cat]}`}
                    className="text-sm text-muted hover:text-text transition-colors"
                  >
                    {CATEGORY_LABELS[cat]}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/signature"
                  className="text-sm text-muted hover:text-text transition-colors"
                >
                  Signature Collection
                </Link>
              </li>
            </ul>
          </div>

          {/* Help column */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-text mb-4">
              Help
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/size-guide"
                  className="text-sm text-muted hover:text-text transition-colors"
                >
                  Size Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/care"
                  className="text-sm text-muted hover:text-text transition-colors"
                >
                  Leather Care
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping-returns"
                  className="text-sm text-muted hover:text-text transition-colors"
                >
                  Shipping &amp; Returns
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-muted hover:text-text transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted hover:text-text transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-text mb-4">
              Contact
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={`tel:${settings.contact_phone.replace(/\s/g, '')}`}
                  className="text-sm text-muted hover:text-text transition-colors"
                >
                  {settings.contact_phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="text-sm text-muted hover:text-text transition-colors block break-words"
                >
                  {settings.contact_email}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${settings.whatsapp_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted hover:text-text transition-colors"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-accent/20 bg-canvas py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2 px-4 md:px-6 max-w-7xl mx-auto text-xs text-muted">
          <p>
            &copy; {new Date().getFullYear()} Caracal Footwear. All rights
            reserved.
          </p>
          <div className="flex gap-3">
            <Link
              href="/privacy"
              className="text-xs text-muted hover:text-text transition-colors"
            >
              Privacy
            </Link>
            <span aria-hidden="true">|</span>
            <Link
              href="/terms"
              className="text-xs text-muted hover:text-text transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}