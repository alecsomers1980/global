"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type ShopResult = { success?: boolean; error?: string };

async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return me?.role === "admin";
}

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function createProduct(formData: FormData): Promise<ShopResult> {
  if (!(await isAdmin())) return { error: "Unauthorized" };
  const name = String(formData.get("name") ?? "").trim();
  const kind = String(formData.get("kind") ?? "instant");
  if (!name) return { error: "Name is required" };
  if (kind !== "instant" && kind !== "service") return { error: "Invalid kind" };
  const admin = createAdminClient();
  const { error } = await admin.from("shop_products").insert({ name, slug: slugify(name), kind });
  if (error) return { error: error.message };
  revalidatePath("/admin/shop");
  return { success: true };
}

export async function updateProduct(formData: FormData): Promise<ShopResult> {
  if (!(await isAdmin())) return { error: "Unauthorized" };
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceRands = Number(formData.get("price") ?? 0);
  const kind = String(formData.get("kind") ?? "instant");
  const requires_upload = formData.get("requires_upload") != null;
  const revisions = Number(formData.get("revisions") ?? 0);
  const is_active = formData.get("is_active") != null;
  const sort_order = Number(formData.get("sort_order") ?? 0);
  const requires_consent = formData.get("requires_consent") != null;
  const requires_appointment = formData.get("requires_appointment") != null;
  const sla_hours = Number(formData.get("sla_hours") ?? 0);
  if (!id || !name || !slug) return { error: "Name and slug are required" };
  if (kind !== "instant" && kind !== "service") return { error: "Invalid kind" };
  const admin = createAdminClient();
  const { error } = await admin
    .from("shop_products")
    .update({
      name,
      slug,
      description: description || null,
      price_cents: Math.round(priceRands * 100),
      kind,
      requires_upload,
      revisions,
      is_active,
      sort_order,
      requires_consent,
      requires_appointment,
      sla_hours,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/shop");
  revalidatePath("/shop");
  return { success: true };
}

export async function uploadProductFile(formData: FormData): Promise<ShopResult> {
  if (!(await isAdmin())) return { error: "Unauthorized" };
  const id = String(formData.get("id") ?? "");
  const file = formData.get("file");
  if (!id) return { error: "Missing product" };
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a file to upload" };
  const admin = createAdminClient();
  const ext = file.name.split(".").pop() || "pdf";
  const path = `products/${id}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await admin.storage
    .from("shop")
    .upload(path, buffer, { contentType: file.type || "application/octet-stream", upsert: true });
  if (upErr) return { error: upErr.message };
  const { error } = await admin
    .from("shop_products")
    .update({ file_path: path, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/shop/${id}`);
  return { success: true };
}