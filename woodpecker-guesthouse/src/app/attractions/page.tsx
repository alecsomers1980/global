import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/site/Reveal";

export const metadata: Metadata = {
  title: "Attractions",
  description: "The best attractions near Woodpecker Guesthouse in Hazyview: Kruger National Park, God's Window, Blyde River Canyon, Bourke's Luck Potholes.",
};

const ATTRACTIONS = [
  {
    name: "Kruger National Park",
    desc: "Enjoy a day out exploring the biggest park in the country, boasting a high density of wildlife including the Big Five. Explore the rich mountains, bush plains and tropical forests on exciting game drives.",
  },
  {
    name: "God's Window",
    desc: "God's Window gives a panoramic view of the Lowveld. If you're a lover of wildlife or plants, there are a number of exciting species to spot in what's considered one of the best views on the Panorama Route.",
  },
  {
    name: "Blyde River Canyon",
    desc: "Take a tour through one of the largest green canyons in the world — the Blyde River Canyon is a sight for sore eyes, with wildlife and astounding views along the way.",
  },
  {
    name: "Bourke's Luck Potholes",
    desc: "Visit one of South Africa's geological wonders. As one of the major tourist attractions in South Africa, the Bourke's Luck Potholes tell a story of the past, centred around the Blyde River.",
  },
];

export default function AttractionsPage() {
  return (
    <main>
      <div className="relative h-[52vh] min-h-[360px] overflow-hidden">
        <Image
          src="/images/attractions-hero.webp"
          alt="Mpumalanga landscape near Woodpecker Guesthouse"
          fill
          priority
          className="object-cover hero-photo"
          sizes="100vw"
        />
        <div className="absolute inset-0 hero-scrim" />
        <Reveal className="absolute bottom-0 left-0 right-0 max-w-4xl mx-auto px-6 pb-8 text-white">
          <p className="text-sand text-sm tracking-[0.3em] uppercase mb-2">Why Us</p>
          <h1 className="font-display text-4xl md:text-5xl">Attractions</h1>
        </Reveal>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-muted mb-10">
          A stay at Woodpecker gives you the perks of exploring and experiencing the most majestic sightings and
          nature&apos;s wonders of Mpumalanga. Travel into the wonders of the world without leaving the feeling
          behind — at the end of the day, you retire back home into a sanctuary as spectacular as the day&apos;s
          sightings.
        </p>
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          {ATTRACTIONS.map((a, i) => (
            <Reveal key={a.name} delay={(i % 2) * 100} className="rounded-xl border border-line bg-white p-5">
              <p className="text-ink font-medium mb-1">{a.name}</p>
              <p className="text-muted text-sm">{a.desc}</p>
            </Reveal>
          ))}
        </div>
        <Link
          href="/contact"
          className="inline-block rounded-full bg-terracotta text-white px-8 py-3 font-semibold hover:bg-terracotta-deep transition-colors"
        >
          Book Now
        </Link>
      </div>
    </main>
  );
}