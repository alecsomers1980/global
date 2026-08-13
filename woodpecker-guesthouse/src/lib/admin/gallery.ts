import { createClient } from "@/lib/supabase/client";
import type { GalleryCategory, GalleryImage } from "@/lib/types";

export async function getCategories(): Promise<GalleryCategory[]> {
  const supabase = createClient();
  const { data } = await supabase.from("gallery_categories").select("*").order("sort_order");
  return (data as GalleryCategory[]) ?? [];
}

export async function getImages(): Promise<GalleryImage[]> {
  const supabase = createClient();
  const { data } = await supabase.from("gallery_images").select("*").order("sort_order");
  return (data as GalleryImage[]) ?? [];
}

export async function addCategory(name: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("gallery_categories").insert({ name });
}

export async function updateCategory(id: string, name: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("gallery_categories").update({ name }).eq("id", id);
}

/** category_id → null on every image in this category (ON DELETE SET NULL on
 *  the FK already does this at the DB level; deleting explicitly here too
 *  keeps the in-memory UI state consistent without a full reload). */
export async function deleteCategory(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("gallery_categories").delete().eq("id", id);
}

export async function addImage(src: string, categoryId: string | null): Promise<void> {
  const supabase = createClient();
  await supabase.from("gallery_images").insert({ src, category_id: categoryId });
}

export async function updateImageCategory(id: string, categoryId: string | null): Promise<void> {
  const supabase = createClient();
  await supabase.from("gallery_images").update({ category_id: categoryId }).eq("id", id);
}

export async function deleteImage(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("gallery_images").delete().eq("id", id);
}

export async function uploadFiles(
  files: File[],
  folder: string
): Promise<{ urls: string[]; errors: string[] }> {
  const urls: string[] = [];
  const errors: string[] = [];
  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) errors.push(`${file.name}: ${data.error ?? "upload failed"}`);
    else urls.push(data.url);
  }
  return { urls, errors };
}