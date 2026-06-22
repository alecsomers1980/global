"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { pickNextCategory, generateInsight, CATEGORIES } from "@/lib/insights/generator";

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

// Redirect back to the editor with a success or error message in the query string.
function backTo(id: string, msg?: string, error?: string): never {
  const qs = error
    ? `?error=${encodeURIComponent(error)}`
    : msg
      ? `?msg=${encodeURIComponent(msg)}`
      : "";
  redirect(`/admin/insights/${id}${qs}`);
}

export async function saveInsight(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  if (!(await isAdmin())) backTo(id, undefined, "Not authorised — please log in again.");
  const title = String(formData.get("title") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const scheduledRaw = String(formData.get("scheduled_for") ?? "").trim();
  let errMsg = "";
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("insights_posts").update({
      title,
      slug: slugRaw ? slugify(slugRaw) : slugify(title),
      excerpt: String(formData.get("excerpt") ?? "").trim() || null,
      meta_title: String(formData.get("meta_title") ?? "").trim() || null,
      meta_description: String(formData.get("meta_description") ?? "").trim() || null,
      category: String(formData.get("category") ?? "").trim(),
      content: String(formData.get("content") ?? ""),
      scheduled_for: scheduledRaw ? new Date(scheduledRaw).toISOString() : null,
    }).eq("id", id);
    if (error) errMsg = error.message;
  } catch (e) {
    errMsg = e instanceof Error ? e.message : "Save failed.";
  }
  revalidatePath(`/admin/insights/${id}`);
  revalidatePath("/admin/insights");
  backTo(id, "Changes saved.", errMsg || undefined);
}

// Create a blank draft and jump straight into the editor (write one by hand).
export async function createBlankInsight(): Promise<void> {
  if (!(await isAdmin())) return;
  const admin = createAdminClient();
  const { data } = await admin
    .from("insights_posts")
    .insert({
      title: "Untitled article",
      slug: `untitled-${Date.now()}`,
      content: "",
      category: CATEGORIES[0],
      status: "DRAFT",
    })
    .select("id")
    .single();
  revalidatePath("/admin/insights");
  if (data?.id) redirect(`/admin/insights/${data.id}`);
}

// Trigger the AI generator on demand (one draft, least-used category).
// Requires DEEPSEEK_API_KEY (and optionally GEMINI/UNSPLASH) to be set.
// Returns an error string so the UI can show what went wrong; redirects on success.
export type GenerateState = { error?: string } | undefined;

export async function generateInsightNow(
  _prev: GenerateState,
  _formData: FormData,
): Promise<GenerateState> {
  if (!(await isAdmin())) return { error: "Not authorised." };
  let newId: string | null = null;
  try {
    const admin = createAdminClient();
    const { data: recent } = await admin
      .from("insights_posts")
      .select("title, category")
      .order("created_at", { ascending: false })
      .limit(12);
    const recentTitles = (recent ?? []).map((p: { title: string }) => p.title);
    const recentCategories = (recent ?? []).map(
      (p: { category: string }) => p.category,
    );
    const category = pickNextCategory(recentCategories);
    const post = await generateInsight(category, recentTitles);
    const { data, error } = await admin
      .from("insights_posts")
      .insert({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        meta_title: post.meta_title,
        meta_description: post.meta_description,
        content: post.body_md,
        image_url: post.image_url,
        category,
        status: "DRAFT",
      })
      .select("id")
      .single();
    if (error) return { error: error.message };
    newId = data?.id ?? null;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Generation failed." };
  }
  revalidatePath("/admin/insights");
  if (newId) redirect(`/admin/insights/${newId}`);
  return { error: "Draft could not be created." };
}

export async function approveInsight(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  if (!(await isAdmin())) backTo(id, undefined, "Not authorised — please log in again.");
  let errMsg = "";
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("insights_posts").update({ status: "APPROVED" }).eq("id", id);
    if (error) errMsg = error.message;
  } catch (e) {
    errMsg = e instanceof Error ? e.message : "Approve failed.";
  }
  revalidatePath(`/admin/insights/${id}`);
  revalidatePath("/admin/insights");
  backTo(id, "Approved — it will publish on its scheduled date.", errMsg || undefined);
}

export async function publishInsightNow(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  if (!(await isAdmin())) backTo(id, undefined, "Not authorised — please log in again.");
  let errMsg = "";
  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from("insights_posts")
      .update({ status: "PUBLISHED", published_at: new Date().toISOString() })
      .eq("id", id);
    if (error) errMsg = error.message;
  } catch (e) {
    errMsg = e instanceof Error ? e.message : "Publish failed.";
  }
  revalidatePath(`/admin/insights/${id}`);
  revalidatePath("/admin/insights");
  revalidatePath("/insights");
  backTo(id, "Published — it is now live on /insights.", errMsg || undefined);
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