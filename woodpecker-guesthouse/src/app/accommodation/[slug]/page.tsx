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

  const galleryRest = room.gallery_images.filter((src) => src !== room.hero_image);

  return (
    <main>
      <div className="relative h-[56vh] min-h-[380px]">
        {room.hero_image && (
          <Image src={room.hero_image} alt={room.name} fill priority className="object-cover" sizes="100vw" />
        )}
        <div className="absolute inset-0 hero-scrim" />
        <div className="absolute bottom-0 left-0 right-0 max-w-6xl mx-auto px-6 pb-8 text-white">
          <h1 className="font-display text-4xl md:text-5xl">{room.name}</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          <p className="text-muted mb-6">{room.description}</p>
          <dl className="grid grid-cols-3 gap-4 text-sm mb-10">
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
            <ul className="flex flex-wrap gap-2 mb-10">
              {room.amenities.map((a) => (
                <li key={a} className="rounded-full bg-surface border border-line px-3 py-1 text-xs text-ink">
                  {a}
                </li>
              ))}
            </ul>
          )}
          {galleryRest.length > 0 && (
            <div>
              <p className="font-display text-lg text-ink mb-4">Photos</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {galleryRest.map((src) => (
                  <div key={src} className="aspect-square relative rounded-lg overflow-hidden bg-sand/40">
                    <Image src={src} alt={room.name} fill className="object-cover" sizes="(max-width: 640px) 50vw, 33vw" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="sticky top-24">
            <NightsbridgeWidget />
          </div>
        </div>
      </div>
    </main>
  );
}