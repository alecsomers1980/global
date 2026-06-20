"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type SvcResult = { success?: boolean; error?: string };

async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return me?.role === "admin";
}

const STATUSES = ["received", "in_progress", "awaiting_client", "delivered"];

export async function setJobStatus(formData: FormData): Promise<SvcResult> {
  if (!(await isAdmin())) return { error: "Unauthorized" };
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !STATUSES.includes(status)) return { error: "Invalid status" };
  const admin = createAdminClient();
  const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === "delivered") patch.delivered_at = new Date().toISOString();
  const { error } = await admin.from("service_jobs").update(patch).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/services/${id}`);
  revalidatePath("/admin/services");
  return { success: true };
}

export async function uploadDeliverable(formData: FormData): Promise<SvcResult> {
  if (!(await isAdmin())) return { error: "Unauthorized" };
  const id = String(formData.get("id") ?? "");
  const file = formData.get("file");
  if (!id) return { error: "Missing job" };
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a file" };
  const admin = createAdminClient();
  const ext = file.name.split(".").pop() || "pdf";
  const path = `deliverables/${id}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await admin.storage
    .from("shop")
    .upload(path, buffer, { contentType: file.type || "application/octet-stream", upsert: true });
  if (upErr) return { error: upErr.message };
  const { error } = await admin
    .from("service_jobs")
    .update({ deliverable_path: path, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/admin/services/${id}`);
  return { success: true };
}