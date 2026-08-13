import { createPublicClient, supabasePublicConfigured } from "@/lib/supabase/public";
import type { GalleryCategory, GalleryImage } from "@/lib/types";

export async function getGalleryCategories(): Promise<GalleryCategory[]> {
  if (!supabasePublicConfigured()) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("gallery_categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[gallery] getGalleryCategories failed:", error.message);
    return [];
  }
  return data as GalleryCategory[];
}

export async function getGalleryImages(): Promise<GalleryImage[]> {
  if (!supabasePublicConfigured()) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[gallery] getGalleryImages failed:", error.message);
    return [];
  }
  return data as GalleryImage[];
}