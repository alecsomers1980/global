import type { Metadata } from "next";
import Image from "next/image";
import { getRooms } from "@/lib/rooms";
import Reveal from "@/components/site/Reveal";
import RoomCard from "@/components/site/RoomCard";

export const revalidate = 60; // ISR: admin edits go live within a minute, no redeploy needed

export const metadata: Metadata = {
  title: "Accommodation",
  description: "8 room types at Woodpecker Guesthouse, Hazyview — from budget-friendly to family suites.",
};

export default async function AccommodationPage() {
  const rooms = await getRooms();
  return (
    <main>
      <section className="relative h-[42vh] min-h-[320px] flex items-center justify-center text-center text-white overflow-hidden">
        <Image
          src="/images/home-pool.webp"
          alt="Woodpecker Guesthouse grounds"
          fill
          priority
          className="object-cover hero-photo"
          sizes="100vw"
        />
        <div className="absolute inset-0 hero-scrim" />
        <Reveal className="relative z-10 px-6">
          <p className="text-sand text-sm tracking-[0.3em] uppercase mb-3">Rest Like Royalty</p>
          <h1 className="font-display text-4xl md:text-5xl">Accommodation</h1>
        </Reveal>
      </section>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <p className="text-muted mb-8 max-w-2xl mx-auto text-center">
          Affordable, comfortable rooms for every kind of stay — from a solo overnighter to a family break.
        </p>
        <div className="border-t border-line mb-12" />
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
          {rooms.map((room, i) => (
            <Reveal key={room.id} delay={(i % 3) * 100}>
              <RoomCard room={room} />
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  );
}
