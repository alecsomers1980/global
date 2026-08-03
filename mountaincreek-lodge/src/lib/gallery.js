// Photo gallery data helper (categories + images) — backed by Supabase.
// Reads go straight to the DB with the public anon key (RLS allows public
// SELECT). Writes go through /api/admin/* routes, which check the admin
// session cookie server-side and use the service_role key.
import { supabase } from "@/lib/supabaseClient";

function imageFromRow(row) {
  return { id: row.id, src: row.src, categoryId: row.category_id };
}

export async function getCategories() {
  const { data, error } = await supabase
    .from("gallery_categories")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function addCategory(name) {
  const res = await fetch("/api/admin/gallery/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to add category");
  return res.json();
}

export async function updateCategory(id, name) {
  const res = await fetch(`/api/admin/gallery/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to update category");
  return res.json();
}

export async function deleteCategory(id) {
  const res = await fetch(`/api/admin/gallery/categories/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to delete category");
}

export async function getImages() {
  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map(imageFromRow);
}

export async function getImagesByCategory(categoryId) {
  if (!categoryId) return getImages();
  return (await getImages()).filter((img) => img.categoryId === categoryId);
}

export async function addImage({ src, categoryId }) {
  const res = await fetch("/api/admin/gallery/images", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ src, category_id: categoryId || null }),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to add image");
  return imageFromRow(await res.json());
}

export async function updateImage(id, updates) {
  const body = {};
  if ("src" in updates) body.src = updates.src;
  if ("categoryId" in updates) body.category_id = updates.categoryId || null;

  const res = await fetch(`/api/admin/gallery/images/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to update image");
  return imageFromRow(await res.json());
}

export async function deleteImage(id) {
  const res = await fetch(`/api/admin/gallery/images/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error((await res.json()).error || "Failed to delete image");
}
