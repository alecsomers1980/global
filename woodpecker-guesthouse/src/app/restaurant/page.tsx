import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/site/Reveal";
import { MENUS } from "@/lib/menu-data";

export const metadata: Metadata = {
  title: "Restaurant",
  description: "Breakfast, lunch, dinner and kids menus at Woodpecker Guesthouse restaurant, Hazyview.",
};

export default function RestaurantPage() {
  return (
    <main>
      <div className="relative h-[52vh] min-h-[360px] overflow-hidden">
        <Image
          src="/images/restaurant-dining.webp"
          alt="Dining room at Woodpecker Guesthouse"
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

        <nav className="flex flex-wrap gap-4 border-y border-line py-4 mb-14 text-sm">
          {MENUS.map((menu) => (
            <a key={menu.slug} href={`#${menu.slug}`} className="text-ink font-medium hover:text-terracotta transition-colors">
              {menu.name} Menu
            </a>
          ))}
        </nav>

        {MENUS.map((menu, mi) => (
          <section key={menu.slug} id={menu.slug} className="mb-16 scroll-mt-24">
            <Reveal className="flex items-baseline justify-between mb-8">
              <h2 className="font-display text-2xl text-ink">{menu.name} Menu</h2>
              {menu.priceNote && <p className="text-terracotta font-semibold">{menu.priceNote}</p>}
            </Reveal>
            <div className="grid sm:grid-cols-2 gap-x-10">
              {menu.sections.map((section, si) => (
                <Reveal key={section.name} delay={(si % 2) * 80} className="mb-8">
                  <h3 className="text-ink font-semibold tracking-wide uppercase text-sm mb-3">{section.name}</h3>
                  <ul>
                    {section.items.map((item) => (
                      <li key={item.name} className="flex items-baseline justify-between gap-4 border-b border-line py-2.5">
                        <span>
                          <span className="text-ink">{item.name}</span>
                          {item.desc && <span className="block text-muted text-xs mt-0.5">{item.desc}</span>}
                        </span>
                        {item.price && <span className="text-ink font-medium whitespace-nowrap">{item.price}</span>}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
            {mi < MENUS.length - 1 && <div className="border-t border-line mt-2" />}
          </section>
        ))}

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
