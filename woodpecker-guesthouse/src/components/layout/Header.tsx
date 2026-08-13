import Link from "next/link";

const NAV = [
  { href: "/accommodation", label: "Accommodation" },
  { href: "/conferencing", label: "Conferencing" },
  { href: "/restaurant", label: "Restaurant" },
  { href: "/gallery", label: "Gallery" },
  { href: "/attractions", label: "Attractions" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  return (
    <header className="border-b border-line bg-paper/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-xl text-ink tracking-wide">
          Woodpecker Guesthouse
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-ink/80">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-terracotta transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}