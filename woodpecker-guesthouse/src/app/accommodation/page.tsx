import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getRooms } from "@/lib/rooms";

export const revalidate = 60; // ISR: admin edits go live within a minute, no redeploy needed

export const metadata: Metadata = {
  title: "Accommodation",
  description: "8 room types at Woodpecker Guesthouse, Hazyview — from budget-friendly to family suites.",
};

export default async function AccommodationPage() {
  const rooms = await getRooms();
  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-ink mb-2">Accommodation</h1>
      <p className="text-muted mb-10 max-w-2xl">
        Affordable, comfortable rooms for every kind of stay — from a solo overnighter to a family break.
      </p>
      <div className="grid md:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <Link
            key={room.id}
            href={`/accommodation/${room.slug}`}
            className="rounded-xl border border-line bg-white overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-[4/3] bg-sand/40 relative">
              {room.hero_image && <Image src={room.hero_image} alt={room.name} fill className="object-cover" />}
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
    </main>
  );
}