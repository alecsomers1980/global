export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12 grid gap-8 sm:grid-cols-3 text-sm text-muted">
        <div>
          <p className="font-display text-lg text-ink mb-2">Woodpecker Guesthouse</p>
          <p>Hazyview, Mpumalanga — gateway to the Kruger National Park and the Panorama Route.</p>
        </div>
        <div>
          <p className="text-ink font-medium mb-2">Explore</p>
          <ul className="space-y-1">
            <li><a href="/accommodation" className="hover:text-terracotta">Accommodation</a></li>
            <li><a href="/conferencing" className="hover:text-terracotta">Conferencing</a></li>
            <li><a href="/attractions" className="hover:text-terracotta">Attractions</a></li>
          </ul>
        </div>
        <div>
          <p className="text-ink font-medium mb-2">Legal</p>
          <ul className="space-y-1">
            <li><a href="/privacy-policy" className="hover:text-terracotta">Privacy Policy</a></li>
            <li><a href="/terms-conditions" className="hover:text-terracotta">Terms &amp; Conditions</a></li>
          </ul>
        </div>
      </div>
      <p className="text-center text-xs text-muted pb-6">
        © {new Date().getFullYear()} Woodpecker Guesthouse. All rights reserved.
      </p>
    </footer>
  );
}