import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getRooms } from "@/lib/rooms";
import NightsbridgeWidget from "@/components/booking/NightsbridgeWidget";

export const revalidate = 60; // ISR: admin edits go live within a minute, no redeploy needed

export const metadata: Metadata = {
  title: "Home",
  description:
    "Affordable, family-friendly guesthouse and conferencing venue in Hazyview, Mpumalanga — minutes from the Kruger National Park.",
};

const FACILITIES = [
  { name: "Swimming Pool", desc: "Cool off after a day on the Panorama Route." },
  { name: "Braai Area", desc: "Fire up an evening braai under the bushveld sky." },
  { name: "Jumping Castle", desc: "Kept the kids happy on the old site — kept here too." },
  { name: "Parking", desc: "Secure on-site parking for every guest." },
];

export default async function HomePage() {
  const rooms = await getRooms();
  const featured = rooms.slice(0, 3);

  return (
    <main>
      <section className="relative bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <p className="text-terracotta text-sm tracking-widest uppercase mb-3">Hazyview, Mpumalanga</p>
          <h1 className="font-display text-4xl md:text-5xl text-ink max-w-2xl mb-4">
            A home away from home, minutes from the Kruger.
          </h1>
          <p className="text-muted max-w-xl mb-8">
            Affordable, family-friendly accommodation, conferencing and a restaurant serving homely meals — Woodpecker
            Guesthouse is built for guests who live for serene spaces and the outdoors.
          </p>
          <div className="max-w-md">
            <NightsbridgeWidget />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="font-display text-2xl text-ink mb-8">Facilities</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {FACILITIES.map((f) => (
            <div key={f.name} className="rounded-xl border border-line bg-white p-5">
              <p className="text-ink font-medium mb-1">{f.name}</p>
              <p className="text-muted text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-display text-2xl text-ink">Featured Rooms</h2>
            <Link href="/accommodation" className="text-terracotta text-sm hover:underline">
              View all rooms →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featured.map((room) => (
              <Link
                key={room.id}
                href={`/accommodation/${room.slug}`}
                className="rounded-xl border border-line bg-white overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] bg-sand/40 relative">
                  {room.hero_image && (
                    <Image src={room.hero_image} alt={room.name} fill className="object-cover" />
                  )}
                </div>
                <div className="p-4">
                  <p className="text-ink font-medium">{room.name}</p>
                  <p className="text-muted text-sm mt-1">
                    {room.bedrooms} bed{room.bedrooms !== 1 ? "s" : ""} · {room.bathrooms} bathroom
                    {room.bathrooms !== 1 ? "s" : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-olive text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h2 className="font-display text-2xl mb-3">Ready to book your stay?</h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Get in touch and we'll help you find the right room for your visit.
          </p>
          <Link
            href="/contact"
            className="inline-block rounded-full bg-white text-olive-deep px-8 py-3 font-semibold hover:bg-sand transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
}