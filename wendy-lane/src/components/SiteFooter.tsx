import Link from "next/link";
import Image from "next/image";
import { BUSINESS } from "@/data/business";

const productLinks = [
  { name: "Wendy Houses", path: "/wendy-houses" },
  { name: "Frame Built Range", path: "/frame-built" },
  { name: "Get a Quote", path: "/quote" },
  { name: "Gallery", path: "/gallery" },
  { name: "Timber care guide", path: "/care" },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-white/80">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div>
            <div className="bg-white rounded-card inline-block p-2 mb-4">
              <Link href="/">
                <Image
                  src="/images/logo.png"
                  alt="Wendy Lane"
                  width={180}
                  height={39}
                  className="h-auto"
                />
              </Link>
            </div>
            <p className="mb-4 leading-relaxed">
              Fast, affordable space solutions for the Lowveld since {BUSINESS.established}.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={BUSINESS.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="hover:text-leaf transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href={BUSINESS.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-leaf transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Products column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Products</h4>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="hover:text-leaf transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <div className="space-y-2">
              <p>
                <a
                  href={BUSINESS.phone.href}
                  className="hover:text-leaf transition-colors"
                >
                  {BUSINESS.phone.display}
                </a>
              </p>
              <p>
                Sales:{" "}
                <a
                  href={BUSINESS.sales.href}
                  className="hover:text-leaf transition-colors"
                >
                  {BUSINESS.sales.display}
                </a>
              </p>
              <p>
                <a
                  href={BUSINESS.whatsapp.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-leaf transition-colors"
                >
                  WhatsApp {BUSINESS.whatsapp.display}
                </a>
              </p>
              <p>
                <a
                  href={`mailto:${BUSINESS.email}`}
                  className="hover:text-leaf transition-colors"
                >
                  {BUSINESS.email}
                </a>
              </p>
              <address className="not-italic mt-3">
                <p>{BUSINESS.address.street}</p>
                <p>
                  {BUSINESS.address.city}, {BUSINESS.address.region}{" "}
                  {BUSINESS.address.postalCode}
                </p>
              </address>
            </div>
          </div>

          {/* Office hours column */}
          <div>
            <h4 className="text-white font-semibold mb-4">Office Hours</h4>
            <ul className="space-y-1">
              {BUSINESS.hours.map((item) => (
                <li key={item.days} className="flex justify-between">
                  <span>{item.days}</span>
                  <span className="font-medium text-white/90">{item.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Service areas */}
        <div className="border-t border-white/10 mt-10 pt-8">
          <p className="text-white/50 text-sm">
            We deliver across the Lowveld:{" "}
            {BUSINESS.serviceAreas.join(", ")}.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-white/50">
          <p>© {year} {BUSINESS.legalName}. All rights reserved.</p>
          <p>Est. {BUSINESS.established}</p>
        </div>
      </div>
    </footer>
  );
}
