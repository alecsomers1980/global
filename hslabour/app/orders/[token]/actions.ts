"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export type PortalResult = { success?: boolean; error?: string };

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "odt", "rtf", "txt", "png", "jpg", "jpeg"];

export async function uploadCv(formData: FormData): Promise<PortalResult> {
  const token = String(formData.get("token") ?? "");
  const file = formData.get("file");
  if (!token) return { error: "Missing token" };
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a file to upload" };
  if (file.size > MAX_UPLOAD_BYTES) return { error: "File is too large (max 10 MB)" };

  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { error: "Unsupported file type. Upload a document or image." };
  }

  const admin = createAdminClient();
  const { data: job } = await admin.from("service_jobs").select("id").eq("token", token).maybeSingle();
  if (!job) return { error: "Order not found" };
  const path = `uploads/${job.id}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await admin.storage
    .from("shop")
    .upload(path, buffer, { contentType: file.type || "application/octet-stream", upsert: true });
  if (upErr) return { error: upErr.message };

  const { error } = await admin
    .from("service_jobs")
    .update({ upload_path: path, updated_at: new Date().toISOString() })
    .eq("id", job.id);
  if (error) return { error: error.message };
  revalidatePath(`/orders/${token}`);
  return { success: true };
}

export async function bookAppointment(formData: FormData): Promise<PortalResult> {
  const token = String(formData.get("token") ?? "");
  const location = String(formData.get("location") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  if (!token) return { error: "Missing token" };
  if (!location || !date) return { error: "Pick a location and date" };

  const admin = createAdminClient();
  const { data: job } = await admin
    .from("service_jobs")
    .select("id")
    .eq("token", token)
    .maybeSingle();
  if (!job) return { error: "Order not found" };

  const { error } = await admin
    .from("service_jobs")
    .update({
      appointment_location: location,
      appointment_date: date,
      updated_at: new Date().toISOString(),
    })
    .eq("id", job.id);
  if (error) return { error: error.message };
  revalidatePath(`/orders/${token}`);
  return { success: true };
}

export async function requestRevision(formData: FormData): Promise<PortalResult> {
  const token = String(formData.get("token") ?? "");
  if (!token) return { error: "Missing token" };

  const admin = createAdminClient();
  const { data: job } = await admin
    .from("service_jobs")
    .select("id, status, revisions_remaining")
    .eq("token", token)
    .maybeSingle();
  if (!job) return { error: "Order not found" };
  if (job.status !== "delivered" || job.revisions_remaining <= 0) {
    return { error: "No revisions available" };
  }

  const { error } = await admin
    .from("service_jobs")
    .update({
      status: "in_progress",
      revisions_remaining: job.revisions_remaining - 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", job.id);
  if (error) return { error: error.message };
  revalidatePath(`/orders/${token}`);
  return { success: true };
}