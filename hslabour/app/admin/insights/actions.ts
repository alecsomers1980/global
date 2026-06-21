"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

export async function saveInsight(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const title = String(formData.get("title") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const scheduledRaw = String(formData.get("scheduled_for") ?? "").trim();
  const admin = createAdminClient();
  await admin.from("insights_posts").update({
    title,
    slug: slugRaw ? slugify(slugRaw) : slugify(title),
    excerpt: String(formData.get("excerpt") ?? "").trim() || null,
    meta_title: String(formData.get("meta_title") ?? "").trim() || null,
    meta_description: String(formData.get("meta_description") ?? "").trim() || null,
    category: String(formData.get("category") ?? "").trim(),
    content: String(formData.get("content") ?? ""),
    scheduled_for: scheduledRaw ? new Date(scheduledRaw).toISOString() : null,
  }).eq("id", id);
  revalidatePath(`/admin/insights/${id}`);
  revalidatePath("/admin/insights");
}

export async function approveInsight(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const admin = createAdminClient();
  await admin.from("insights_posts").update({ status: "APPROVED" }).eq("id", id);
  revalidatePath(`/admin/insights/${id}`);
  revalidatePath("/admin/insights");
}

export async function publishInsightNow(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const admin = createAdminClient();
  await admin.from("insights_posts").update({ status: "PUBLISHED", published_at: new Date().toISOString() }).eq("id", id);
  revalidatePath(`/admin/insights/${id}`);
  revalidatePath("/admin/insights");
  revalidatePath("/insights");
}

export async function discardInsight(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const admin = createAdminClient();
  await admin.from("insights_posts").update({ status: "DISCARDED" }).eq("id", id);
  revalidatePath("/admin/insights");
  redirect("/admin/insights");
}