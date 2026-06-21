import { createAdminClient } from "@/lib/supabase/admin";

export interface InsightPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  content: string;
  category: string;
  image_url: string | null;
  status: "DRAFT" | "APPROVED" | "PUBLISHED" | "DISCARDED";
  scheduled_for: string | null;
  created_at: string;
  published_at: string | null;
}

export async function getPublishedPosts(): Promise<InsightPost[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("insights_posts")
    .select("*")
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false });
  return (data ?? []) as InsightPost[];
}

export async function getPostBySlug(slug: string): Promise<InsightPost | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("insights_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .maybeSingle();
  return (data as InsightPost) ?? null;
}

export async function getPublishedSlugs(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("insights_posts")
    .select("slug")
    .eq("status", "PUBLISHED");
  return (data ?? []).map((r: { slug: string }) => r.slug);
}
