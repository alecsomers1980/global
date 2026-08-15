import Link from "next/link";
import Image from "next/image";
import type { Room } from "@/lib/types";

// Image-on-top, info-below card — matches the reference site's room-grid
// pattern precisely (square corners, no text-over-photo overlay) instead of
// the earlier full-bleed image-forward card. Reused on Home's Featured
// Rooms and the Accommodation index so both stay in sync automatically.
export default function RoomCard({ room }: { room: Room }) {
  return (
    <Link href={`/accommodation/${room.slug}`} className="group block bg-white">
      <div className="relative h-64 overflow-hidden">
        {room.hero_image && (
          <Image
            src={room.hero_image}
            alt={room.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        )}
      </div>
      <div className="border border-t-0 border-line p-5">
        <p className="font-display text-lg text-ink mb-1">{room.name}</p>
        <p className="text-muted text-sm line-clamp-2 mb-4">{room.description}</p>
        <div className="flex items-center justify-between border-t border-line pt-4">
          {room.rate_from ? (
            <p className="text-sm text-muted">
              From <span className="text-ink font-semibold">R{room.rate_from}</span> / night
            </p>
          ) : (
            <p className="text-sm text-muted">
              {room.bed_type} · {room.max_guests} guest{room.max_guests !== 1 ? "s" : ""}
            </p>
          )}
          <span className="text-xs font-medium tracking-widest uppercase text-terracotta group-hover:text-terracotta-deep transition-colors">
            View Room
          </span>
        </div>
      </div>
    </Link>
  );
}
