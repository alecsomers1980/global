import Link from "next/link";
import Image from "next/image";

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t-4 border-green bg-navy-dark text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/images/HSL-Logo-112x112.png"
                alt="H&S Labour Brokers"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <span className="text-white font-bold">H&S Labour Brokers</span>
            </div>
            <p className="text-sm text-slate-400">
              Your partner in recruitment, TES, payroll, vetting and HR —
              forging lasting partnerships since 1998.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="block text-sm hover:text-green transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/services" className="block text-sm hover:text-green transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/insights" className="block text-sm hover:text-green transition-colors">
                  Insights
                </Link>
              </li>
              <li>
                <Link href="/employers" className="block text-sm hover:text-green transition-colors">
                  Employers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="block text-sm hover:text-green transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Job Seekers */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Job Seekers
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/jobs" className="block text-sm hover:text-green transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/submit-cv" className="block text-sm hover:text-green transition-colors">
                  Submit your CV
                </Link>
              </li>
              <li>
                <Link href="/shop" className="block text-sm hover:text-green transition-colors">
                  Shop &amp; Services
                </Link>
              </li>
              <li>
                <Link href="/ebook" className="block text-sm hover:text-green transition-colors">
                  Job-Hunting E-book
                </Link>
              </li>
              <li>
                <Link
                  href="/affiliate-program"
                  className="block text-sm hover:text-green transition-colors"
                >
                  Affiliate Program
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Contact
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:info@hslabour.co.za" className="hover:text-green transition-colors">
                  info@hslabour.co.za
                </a>
              </li>
              <li>
                <a href="tel:0114684192" className="hover:text-green transition-colors">
                  011 468 4192
                </a>
              </li>
              <li>Mon–Fri 8:30–16:00</li>
              <li>
                <Link href="/login" className="hover:text-green transition-colors">
                  Affiliate login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-slate-400 text-center sm:text-left">
            © {currentYear} H&S Labour Brokers. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <li>
              <Link href="/privacy-policy" className="hover:text-green transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-green transition-colors">
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link href="/paia" className="hover:text-green transition-colors">
                PAIA
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
