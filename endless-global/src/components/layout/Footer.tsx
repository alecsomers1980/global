import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="pleated relative text-white">
      {/* Dark overlay for legibility */}
      <div className="absolute inset-0 bg-brand/80" />
      <div className="relative z-10">
        <div className="eg-container py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <img
                src="/images/endlessLogo.png"
                alt="Endless Global Point"
                className="h-12 w-auto mb-4"
              />
              <p className="text-white/80 text-sm">
                Your bridge to the right solutions, reliable partners, real results.
              </p>
            </div>

            {/* Services */}
            <div>
              <h4 className="uppercase font-semibold mb-4">Services</h4>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/investment-services"
                    className="block py-1 text-sm text-white/80 hover:text-white transition"
                  >
                    Investment Services
                  </Link>
                </li>
                <li>
                  <Link
                    href="/financial-services"
                    className="block py-1 text-sm text-white/80 hover:text-white transition"
                  >
                    Financial Services
                  </Link>
                </li>
                <li>
                  <Link
                    href="/trade-services"
                    className="block py-1 text-sm text-white/80 hover:text-white transition"
                  >
                    Trade Services
                  </Link>
                </li>
                <li>
                  <Link
                    href="/consulting-services"
                    className="block py-1 text-sm text-white/80 hover:text-white transition"
                  >
                    Consulting Services
                  </Link>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="uppercase font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/"
                    className="block py-1 text-sm text-white/80 hover:text-white transition"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about-us"
                    className="block py-1 text-sm text-white/80 hover:text-white transition"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/talk-to-us"
                    className="block py-1 text-sm text-white/80 hover:text-white transition"
                  >
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Details */}
            <div>
              <h4 className="uppercase font-semibold mb-4">Contact Details</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-white/60 text-xs">Phone Number:</p>
                  <a
                    href="tel:+27833727295"
                    className="text-white text-sm hover:underline"
                  >
                    +27 83 372 7295
                  </a>
                </div>
                <div>
                  <p className="text-white/60 text-xs">Email Address:</p>
                  <a
                    href="mailto:philipokoh24@gmail.com"
                    className="text-white text-sm break-words hover:underline"
                  >
                    philipokoh24@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/15 my-8" />

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-white/70 text-xs">
            <p>© 2025 Endless Global Point. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link
                href="/terms-and-conditions"
                className="hover:text-white transition"
              >
                Terms of Use
              </Link>
              <Link
                href="/privacy-policy"
                className="hover:text-white transition"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
