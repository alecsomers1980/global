import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getRoomBySlug, getRooms } from "@/lib/rooms";
import NightsbridgeWidget from "@/components/booking/NightsbridgeWidget";

export const revalidate = 60; // ISR: admin edits go live within a minute, no redeploy needed

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const rooms = await getRooms();
  return rooms.map((room) => ({ slug: room.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const room = await getRoomBySlug(slug);
  if (!room) return { title: "Room not found" };
  return { title: room.name, description: room.description };
}

export default async function RoomDetailPage({ params }: Props) {
  const { slug } = await params;
  const room = await getRoomBySlug(slug);
  if (!room) notFound();

  return (
    <main className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-10">
      <div className="md:col-span-2">
        <div className="aspect-[16/10] bg-sand/40 rounded-xl relative mb-6 overflow-hidden">
          {room.hero_image && <Image src={room.hero_image} alt={room.name} fill className="object-cover" />}
        </div>
        <h1 className="font-display text-3xl text-ink mb-3">{room.name}</h1>
        <p className="text-muted mb-6">{room.description}</p>
        <dl className="grid grid-cols-3 gap-4 text-sm mb-6">
          <div>
            <dt className="text-muted">Bed type</dt>
            <dd className="text-ink font-medium">{room.bed_type || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">Bathrooms</dt>
            <dd className="text-ink font-medium">{room.bathrooms}</dd>
          </div>
          <div>
            <dt className="text-muted">Max guests</dt>
            <dd className="text-ink font-medium">{room.max_guests}</dd>
          </div>
        </dl>
        {room.amenities.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {room.amenities.map((a) => (
              <li key={a} className="rounded-full bg-surface border border-line px-3 py-1 text-xs text-ink">
                {a}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <NightsbridgeWidget />
      </div>
    </main>
  );
}