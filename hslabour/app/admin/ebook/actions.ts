"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type EbookResult = { success?: boolean; error?: string };

async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return me?.role === "admin";
}

export async function saveEbookSettings(formData: FormData): Promise<EbookResult> {
  if (!(await isAdmin())) return { error: "Unauthorized" };
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceRands = Number(formData.get("price") ?? 0);
  const commission_type = String(formData.get("commission_type") ?? "percent");
  const commission_value = Number(formData.get("commission_value") ?? 0);
  const is_active = formData.get("is_active") != null;
  if (!title) return { error: "Title is required" };
  if (commission_type !== "percent" && commission_type !== "flat") return { error: "Invalid commission type" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("ebook_product")
    .update({
      title,
      description: description || null,
      price_cents: Math.round(priceRands * 100),
      commission_type,
      commission_value,
      is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);
  if (error) return { error: error.message };
  revalidatePath("/admin/ebook");
  revalidatePath("/ebook");
  return { success: true };
}

export async function uploadEbookFile(formData: FormData): Promise<EbookResult> {
  if (!(await isAdmin())) return { error: "Unauthorized" };
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a PDF to upload" };

  const admin = createAdminClient();
  const path = `ebook-${Date.now()}.pdf`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await admin.storage
    .from("ebook")
    .upload(path, buffer, { contentType: file.type || "application/pdf", upsert: true });
  if (upErr) return { error: upErr.message };

  const { error } = await admin
    .from("ebook_product")
    .update({ file_path: path, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) return { error: error.message };
  revalidatePath("/admin/ebook");
  return { success: true };
}

export async function setCommissionStatus(
  commissionId: string,
  status: "pending" | "approved" | "paid",
): Promise<EbookResult> {
  if (!(await isAdmin())) return { error: "Unauthorized" };
  const admin = createAdminClient();
  const patch: Record<string, unknown> = { status };
  if (status === "paid") patch.paid_at = new Date().toISOString();
  else patch.paid_at = null;
  const { error } = await admin.from("commissions").update(patch).eq("id", commissionId);
  if (error) return { error: error.message };
  revalidatePath("/admin/ebook");
  return { success: true };
}