"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getRoomByIdAdmin, updateRoom } from "@/lib/admin/rooms";
import type { Room } from "@/lib/types";

export default function AdminRoomEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getRoomByIdAdmin(params.id).then(setRoom);
  }, [params.id]);

  if (!room) return <p className="text-muted">Loading…</p>;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    const { error: updateError } = await updateRoom(room.id, {
      name: room.name,
      description: room.description,
      bed_type: room.bed_type,
      bedrooms: room.bedrooms,
      bathrooms: room.bathrooms,
      max_guests: room.max_guests,
      rate_from: room.rate_from,
      hero_image: room.hero_image,
      published: room.published,
    });
    setSaving(false);
    if (updateError) setError(updateError);
    else {
      setSaved(true);
      router.refresh();
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display text-2xl text-ink">{room.name}</h1>
      <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-line bg-white p-6">
        <div>
          <label className="block text-sm text-ink mb-1">Name</label>
          <input
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
            value={room.name}
            onChange={(e) => setRoom({ ...room, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-ink mb-1">Description</label>
          <textarea
            rows={4}
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta resize-y"
            value={room.description}
            onChange={(e) => setRoom({ ...room, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-ink mb-1">Bed type</label>
            <input
              className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
              value={room.bed_type}
              onChange={(e) => setRoom({ ...room, bed_type: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-ink mb-1">Rate from (ZAR/night)</label>
            <input
              type="number"
              step="0.01"
              className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
              value={room.rate_from ?? ""}
              onChange={(e) => setRoom({ ...room, rate_from: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-ink mb-1">Bedrooms</label>
            <input
              type="number"
              className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
              value={room.bedrooms}
              onChange={(e) => setRoom({ ...room, bedrooms: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm text-ink mb-1">Bathrooms</label>
            <input
              type="number"
              className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
              value={room.bathrooms}
              onChange={(e) => setRoom({ ...room, bathrooms: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm text-ink mb-1">Max guests</label>
            <input
              type="number"
              className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
              value={room.max_guests}
              onChange={(e) => setRoom({ ...room, max_guests: Number(e.target.value) })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-ink mb-1">Hero image URL</label>
          <input
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
            placeholder="Uploaded via the Gallery admin, or paste a site-media URL"
            value={room.hero_image ?? ""}
            onChange={(e) => setRoom({ ...room, hero_image: e.target.value || null })}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
          <input
            type="checkbox"
            className="accent-terracotta"
            checked={room.published}
            onChange={(e) => setRoom({ ...room, published: e.target.checked })}
          />
          Published (visible on the public site)
        </label>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        {saved && <p className="text-sm text-olive-deep bg-olive/10 rounded-lg px-3 py-2">Saved.</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-terracotta text-white px-6 py-2.5 text-sm font-semibold hover:bg-terracotta-deep transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}