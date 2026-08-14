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
    <main>
      <section className="relative h-[42vh] min-h-[320px] flex items-center justify-center text-center text-white">
        <Image
          src="/images/home-pool.webp"
          alt="Woodpecker Guesthouse grounds"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 hero-scrim" />
        <div className="relative z-10 px-6">
          <p className="text-sand text-sm tracking-[0.3em] uppercase mb-3">Rest Like Royalty</p>
          <h1 className="font-display text-4xl md:text-5xl">Accommodation</h1>
        </div>
      </section>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <p className="text-muted mb-10 max-w-2xl">
          Affordable, comfortable rooms for every kind of stay — from a solo overnighter to a family break.
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/accommodation/${room.slug}`}
              className="group relative block h-[440px] rounded-2xl overflow-hidden"
            >
              {room.hero_image && (
                <Image
                  src={room.hero_image}
                  alt={room.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              )}
              <div className="absolute inset-0 card-scrim" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="font-display text-2xl mb-1">{room.name}</p>
                <p className="text-white/75 text-sm line-clamp-2 mb-3">{room.description}</p>
                <div className="flex items-center gap-4 text-xs text-white/70">
                  <span>{room.bed_type}</span>
                  <span>·</span>
                  <span>
                    {room.max_guests} guest{room.max_guests !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}