import { createPublicClient } from "@/lib/supabase/public";
import type { Room } from "@/lib/types";

export async function getRooms(): Promise<Room[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[rooms] getRooms failed:", error.message);
    return [];
  }
  return data as Room[];
}

export async function getRoomBySlug(slug: string): Promise<Room | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  if (error || !data) return null;
  return data as Room;
}