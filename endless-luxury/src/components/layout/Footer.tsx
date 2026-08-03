import Link from "next/link";
import Image from "next/image";
import Newsletter from "./Newsletter";
import { site, serviceLinks } from "@/data/site";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Who We Are", href: "/who-we-are" },
  { label: "Vehicles", href: "/vehicles" },
  { label: "Contact Us", href: "/talk-to-us" },
];

export default function Footer() {
  const firstEightServices = serviceLinks.slice(0, 8);

  return (
    <>
      <Newsletter />
      <footer className="bg-cream border-t border-black/5 pt-16 pb-8">
        <div className="el-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1 */}
          <div>
            <Image
              src="/images/EndlessLuxuryLogo.png"
              alt="Endless Luxury"
              width={190}
              height={52}
              className="h-auto w-auto max-h-12"
            />
            <h4 className="font-heading text-navy font-semibold uppercase text-sm tracking-wide mt-6 mb-3">
              About Company
            </h4>
            <p className="text-muted text-sm">{site.tagline}</p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-heading text-navy font-semibold uppercase text-sm tracking-wide mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-2 text-navy hover:text-gold transition"
                  >
                    <span className="text-gold">›</span> {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="font-heading text-navy font-semibold uppercase text-sm tracking-wide mb-3">
              Hire Services
            </h4>
            <ul className="space-y-2 text-sm">
              {firstEightServices.map((sl) => (
                <li key={sl.anchor}>
                  <Link
                    href={`/services#${sl.anchor}`}
                    className="inline-flex items-center gap-2 text-navy hover:text-gold transition"
                  >
                    <span className="text-gold">›</span> {sl.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="font-heading text-navy font-semibold uppercase text-sm tracking-wide mb-3">
              Contact Details
            </h4>
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-navy text-sm">Phone Number</p>
                <Link
                  href={site.phoneHref}
                  className="text-muted hover:text-gold text-sm transition"
                >
                  {site.phone}
                </Link>
              </div>
              <div>
                <p className="font-semibold text-navy text-sm">Email Address</p>
                <Link
                  href={site.emailHref}
                  className="text-muted hover:text-gold text-sm transition"
                >
                  {site.email}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-black/10 my-8" />

        <div className="el-container flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>
            Copyright Endless Luxury &copy; 2025 | Designed and Marketed by
            Macrocosm Ultra Digital
          </p>
          <div className="flex gap-4">
            <Link href="/terms-and-conditions" className="hover:text-gold transition">
              Terms of Use
            </Link>
            <Link href="/privacy-policy" className="hover:text-gold transition">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
