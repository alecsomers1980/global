import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-ink text-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-8 sm:grid-cols-3">
        <div>
          <h3 className="font-heading text-lg mb-3">Contact Us</h3>
          <p className="text-sm text-white/70">T. 021 554 4882</p>
          <p className="text-sm text-white/70">F. 021 554 0991</p>
          <a href="mailto:info@lublaw.co.za" className="text-sm text-gold hover:underline">
            info@lublaw.co.za
          </a>
        </div>
        <div>
          <h3 className="font-heading text-lg mb-3">Address</h3>
          <p className="text-sm text-white/70">9E Sandown Road, Bloubergsands, 7441</p>
          <p className="text-sm text-white/70">P.O. Box 11476, Bloubergrant, 7443, Docex 3, Blouberg</p>
        </div>
        <div>
          <h3 className="font-heading text-lg mb-3">POPIA</h3>
          <Link href="/cookies-disclaimer" className="block text-sm text-white/70 hover:text-gold">
            Cookies Disclaimer
          </Link>
          <Link href="/popia-privacy-notice" className="block text-sm text-white/70 hover:text-gold">
            POPIA Privacy Notice
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 text-center text-xs text-white/50 py-4">
        © {new Date().getFullYear()} B Lubbe & Associates. All Rights Reserved.
      </div>
    </footer>
  );
}
