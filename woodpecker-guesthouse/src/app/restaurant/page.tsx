import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/site/Reveal";

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
    <main>
      <div className="relative h-[52vh] min-h-[360px] overflow-hidden">
        <Image
          src="/images/home-garden.webp"
          alt="Woodpecker Guesthouse grounds"
          fill
          priority
          className="object-cover hero-photo"
          sizes="100vw"
        />
        <div className="absolute inset-0 hero-scrim" />
        <Reveal className="absolute bottom-0 left-0 right-0 max-w-4xl mx-auto px-6 pb-8 text-white">
          <p className="text-sand text-sm tracking-[0.3em] uppercase mb-2">Enjoy Our Homely Meals</p>
          <h1 className="font-display text-4xl md:text-5xl">Restaurant</h1>
        </Reveal>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-muted mb-10">
          Come tantalise your tastebuds at our newest facility addition. Taste the most scrumptious, mouthwatering
          African cuisine and exotic dishes prepared to perfection by our highly trained chefs — the relaxed
          ambience? That&apos;s a plus.
        </p>
        <h2 className="font-display text-xl text-ink mb-4">Our Menus</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {MENUS.map((menu, i) => (
            <Reveal key={menu.name} delay={(i % 2) * 100}>
              <a
                href={menu.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-line bg-white p-5 hover:shadow-md transition-shadow flex items-center justify-between"
              >
                <span className="text-ink font-medium">{menu.name}</span>
                <span className="text-terracotta text-sm">View PDF →</span>
              </a>
            </Reveal>
          ))}
        </div>
        <Link
          href="/contact"
          className="inline-block rounded-full bg-terracotta text-white px-8 py-3 font-semibold hover:bg-terracotta-deep transition-colors"
        >
          Contact Us
        </Link>
      </div>
    </main>
  );
}