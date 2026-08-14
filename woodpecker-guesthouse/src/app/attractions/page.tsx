import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

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
    <main className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-ink mb-4">Attractions</h1>
      <p className="text-muted mb-8">
        A stay at Woodpecker gives you the perks of exploring and experiencing the most majestic sightings and
        nature&apos;s wonders of Mpumalanga. Travel into the wonders of the world without leaving the feeling
        behind — at the end of the day, you retire back home into a sanctuary as spectacular as the day&apos;s
        sightings.
      </p>
      <div className="aspect-[21/9] relative rounded-xl overflow-hidden mb-10 bg-sand/40">
        <Image src="/images/attractions-hero.webp" alt="Mpumalanga landscape near Woodpecker Guesthouse" fill className="object-cover" />
      </div>
      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        {ATTRACTIONS.map((a) => (
          <div key={a.name} className="rounded-xl border border-line bg-white p-5">
            <p className="text-ink font-medium mb-1">{a.name}</p>
            <p className="text-muted text-sm">{a.desc}</p>
          </div>
        ))}
      </div>
      <Link
        href="/contact"
        className="inline-block rounded-full bg-terracotta text-white px-8 py-3 font-semibold hover:bg-terracotta-deep transition-colors"
      >
        Book Now
      </Link>
    </main>
  );
}