import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";
import { siteConfig, nav } from "@/lib/content";

// lucide-react dropped brand/logo icons, so social marks are inline SVGs.
function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.89h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
    </svg>
  );
}
function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <rect x={2} y={2} width={20} height={20} rx={5} />
      <circle cx={12} cy={12} r={4} />
      <circle cx={17.5} cy={6.5} r={0.5} fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-navy text-white rounded-t-3xl pt-16 pb-8 px-4 md:px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Logo, description, social */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/images/nyoni-logo.png"
                alt={siteConfig.name}
                width={160}
                height={48}
                className="h-12"
              />
            </Link>
            <p className="text-brand-sky/80 text-sm">{siteConfig.description}</p>
            <div className="flex gap-4">
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-white/80 hover:text-white transition-colors"
              >
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-white/80 hover:text-white transition-colors"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Explore links */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Explore</h4>
            <nav aria-label="Footer navigation" className="flex flex-col gap-2">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-brand-sky/80 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Contact</h4>
            <div className="space-y-3 text-brand-sky/80">
              <div className="flex items-start gap-2">
                <MapPin size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p>{siteConfig.address.line1}</p>
                  <p>{siteConfig.address.line2}</p>
                  <p>{siteConfig.address.line3}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={18} className="shrink-0" />
                <a
                  href={`tel:${siteConfig.phone}`}
                  className="hover:text-white transition-colors"
                >
                  {siteConfig.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={18} className="shrink-0" />
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="hover:text-white transition-colors"
                >
                  {siteConfig.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/20 text-center text-sm text-brand-sky/60">
          &copy; {currentYear} {siteConfig.name}. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}