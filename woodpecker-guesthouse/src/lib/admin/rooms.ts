import { createClient } from "@/lib/supabase/client";
import type { Room } from "@/lib/types";

/** Admin read: ALL rooms including unpublished (RLS: is_staff() allows this;
 *  the public getRooms() in lib/rooms.ts only ever sees published: true). */
export async function getAllRoomsAdmin(): Promise<Room[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("rooms").select("*").order("sort_order", { ascending: true });
  if (error) {
    console.error("[admin/rooms] getAllRoomsAdmin failed:", error.message);
    return [];
  }
  return data as Room[];
}

export async function getRoomByIdAdmin(id: string): Promise<Room | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("rooms").select("*").eq("id", id).single();
  if (error || !data) return null;
  return data as Room;
}

export async function updateRoom(id: string, patch: Partial<Room>): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("rooms").update(patch).eq("id", id);
  return { error: error?.message ?? null };
}