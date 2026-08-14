import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Restaurant",
  description: "Homely African cuisine at Woodpecker Guesthouse restaurant, Hazyview.",
};

const MENUS = [
  { name: "Breakfast Menu", href: "/menus/breakfast-menu.pdf" },
  { name: "Lunch Menu", href: "/menus/lunch-menu.pdf" },
  { name: "Dinner Menu", href: "/menus/dinner-menu.pdf" },
  { name: "Kids Menu", href: "/menus/kids-menu.pdf" },
];

export default function RestaurantPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-ink mb-4">Restaurant</h1>
      <p className="text-muted mb-8">
        Come tantalise your tastebuds at our newest facility addition. Taste the most scrumptious, mouthwatering
        African cuisine and exotic dishes prepared to perfection by our highly trained chefs — the relaxed
        ambience? That&apos;s a plus.
      </p>
      <div className="aspect-[16/9] relative rounded-xl overflow-hidden mb-10 bg-sand/40">
        <Image src="/images/restaurant-hero.webp" alt="Woodpecker Guesthouse restaurant" fill className="object-cover" />
      </div>
      <h2 className="font-display text-xl text-ink mb-4">Our Menus</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        {MENUS.map((menu) => (
          <a
            key={menu.name}
            href={menu.href}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-line bg-white p-5 hover:shadow-md transition-shadow flex items-center justify-between"
          >
            <span className="text-ink font-medium">{menu.name}</span>
            <span className="text-terracotta text-sm">View PDF →</span>
          </a>
        ))}
      </div>
      <Link
        href="/contact"
        className="inline-block rounded-full bg-terracotta text-white px-8 py-3 font-semibold hover:bg-terracotta-deep transition-colors"
      >
        Contact Us
      </Link>
    </main>
  );
}