import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/shop", label: "Shop" },
  { href: "/affiliate-program", label: "Affiliates" },
  { href: "/jobs", label: "Jobs" },
  { href: "/employers", label: "Employers" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo + Brand */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/HSL-Logo-112x112.png"
            alt="H&S Labour Brokers"
            width={48}
            height={48}
            className="h-12 w-12"
          />
          <span className="text-lg font-bold tracking-tight text-navy hidden sm:inline">
            H&S Labour Brokers
          </span>
        </Link>

        {/* Desktop Navigation + CTA */}
        <div className="flex items-center gap-4 md:gap-6">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-navy transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/login"
            className="hidden md:inline text-sm font-medium text-slate-700 hover:text-navy transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/employers"
            className="hidden sm:inline-flex rounded-lg bg-green px-5 py-2.5 text-sm font-semibold text-navy shadow-sm transition-all duration-300 hover:bg-green-dark hover:-translate-y-0.5"
          >
            Hire Staff
          </Link>
        </div>
      </div>
    </header>
  );
}
