import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";
import { company, nav } from "@/lib/content";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-white/80">
      <div className="container-px py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Column 1 – Brand */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-lg p-2 inline-flex items-center w-fit">
            <Image
              src="/images/logo.png"
              width={120}
              height={44}
              alt={company.name}
              className="h-8 w-auto"
            />
          </div>
          <p className="text-sm leading-relaxed text-white/70">
            Borehole drilling, pump installation &amp; water purification
            across {company.serviceArea}.
          </p>
        </div>

        {/* Column 2 – Quick links */}
        <div>
          <h4 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">
            Quick Links
          </h4>
          <ul className="flex flex-col gap-2 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3 – Contact */}
        <div>
          <h4 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">
            Contact
          </h4>
          <ul className="flex flex-col gap-3 text-sm text-white/60">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-brand" />
              <span>{company.location}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand" />
              <a
                href={company.phoneHref}
                className="hover:text-white transition-colors"
              >
                {company.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand" />
              <a
                href={`mailto:${company.email}`}
                className="hover:text-white transition-colors"
              >
                {company.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-px py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <p>
            &copy; {year} {company.name}. All rights reserved.
          </p>
          <p>Borehole specialists in {company.location}</p>
        </div>
      </div>
    </footer>
  );
}