import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const roomCount = supabase
    ? (await supabase.from("rooms").select("*", { count: "exact", head: true })).count
    : 0;
  const imageCount = supabase
    ? (await supabase.from("gallery_images").select("*", { count: "exact", head: true })).count
    : 0;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-ink">Dashboard</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/admin/rooms" className="rounded-xl border border-line bg-white p-6 hover:shadow-md transition-shadow">
          <p className="text-3xl font-display text-ink">{roomCount ?? 0}</p>
          <p className="text-muted text-sm mt-1">Rooms</p>
        </Link>
        <Link href="/admin/gallery" className="rounded-xl border border-line bg-white p-6 hover:shadow-md transition-shadow">
          <p className="text-3xl font-display text-ink">{imageCount ?? 0}</p>
          <p className="text-muted text-sm mt-1">Gallery images</p>
        </Link>
      </div>
    </div>
  );
}