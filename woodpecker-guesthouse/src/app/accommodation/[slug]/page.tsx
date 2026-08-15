import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRoomBySlug, getRooms } from "@/lib/rooms";
import NightsbridgeWidget from "@/components/booking/NightsbridgeWidget";
import Reveal from "@/components/site/Reveal";
import RoomGallery from "@/components/site/RoomGallery";
import { GuestsIcon, BedIcon, RoomsIcon, BathIcon, AmenitiesIcon } from "@/components/site/DetailIcons";

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

  const images = room.gallery_images.length > 0 ? room.gallery_images : room.hero_image ? [room.hero_image] : [];

  const details = [
    { label: "Guests", value: `${room.max_guests}`, Icon: GuestsIcon },
    { label: "Bed Type", value: room.bed_type || "—", Icon: BedIcon },
    { label: "Bedrooms", value: `${room.bedrooms}`, Icon: RoomsIcon },
    { label: "Bathrooms", value: `${room.bathrooms}`, Icon: BathIcon },
  ];

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <Reveal className="text-center mb-10">
        <h1 className="font-display text-3xl md:text-5xl text-ink mb-3">{room.name}</h1>
        <p className="text-muted max-w-2xl mx-auto">{room.description}</p>
      </Reveal>
      <div className="border-t border-line mb-10" />

      <Reveal delay={100} className="mb-14">
        <RoomGallery images={images} alt={room.name} />
      </Reveal>

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          <div className="border border-line p-6 mb-6">
            <p className="font-display text-lg text-ink mb-5">Details</p>
            <div className="grid sm:grid-cols-2 gap-5">
              {details.map((d) => (
                <div key={d.label} className="flex items-start gap-3">
                  <d.Icon className="w-5 h-5 text-terracotta shrink-0 mt-0.5" />
                  <div>
                    <p className="text-muted text-xs">{d.label}</p>
                    <p className="text-ink font-medium">{d.value}</p>
                  </div>
                </div>
              ))}
              {room.amenities.length > 0 && (
                <div className="flex items-start gap-3 sm:col-span-2">
                  <AmenitiesIcon className="w-5 h-5 text-terracotta shrink-0 mt-0.5" />
                  <div>
                    <p className="text-muted text-xs">Amenities</p>
                    <p className="text-ink font-medium">{room.amenities.join(", ")}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <div className="sticky top-28 border border-line">
            <NightsbridgeWidget />
          </div>
        </div>
      </div>
    </main>
  );
}
