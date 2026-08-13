"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllRoomsAdmin } from "@/lib/admin/rooms";
import type { Room } from "@/lib/types";

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllRoomsAdmin().then((r) => {
      setRooms(r);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-ink">Rooms</h1>
      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <div className="rounded-xl border border-line bg-white divide-y divide-line">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/admin/rooms/${room.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-surface transition-colors"
            >
              <div>
                <p className="text-ink font-medium">{room.name}</p>
                <p className="text-muted text-xs">{room.slug}</p>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  room.published ? "bg-olive/15 text-olive-deep" : "bg-sand/50 text-muted"
                }`}
              >
                {room.published ? "Published" : "Draft"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}