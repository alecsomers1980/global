// Red Litchi Farm Café data helper (gallery images + menu) — backed by Supabase.
// Reads go straight to the DB with the public anon key (RLS allows public
// SELECT). Writes go through /api/admin/* routes, which check the admin
// session cookie server-side and use the service_role key.
import { supabase } from "@/lib/supabaseClient";

export async function getImages() {
  const { data, error } = await supabase
    .from("red_litchi_images")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function addImage(src) {
  const res = await fetch("/api/admin/red-litchi/images", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ src }),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to add image");
  return res.json();
}

export async function updateImage(id, src) {
  const res = await fetch(`/api/admin/red-litchi/images/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ src }),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to update image");
  return res.json();
}

export async function deleteImage(id) {
  const res = await fetch(`/api/admin/red-litchi/images/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to delete image");
}

export async function getMenuUrl() {
  const { data, error } = await supabase
    .from("red_litchi_settings")
    .select("menu_url")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  return data?.menu_url || "";
}

export async function setMenuUrl(url) {
  const res = await fetch("/api/admin/red-litchi/menu", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ menuUrl: url }),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to update menu");
  return res.json();
}
