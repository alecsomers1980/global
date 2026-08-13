import { createPublicClient, supabasePublicConfigured } from "@/lib/supabase/public";
import type { BlogPost } from "@/lib/types";

/** Public read: only published posts. Guarded the same way lib/rooms.ts and
 *  lib/gallery.ts are — createPublicClient() throws synchronously when env
 *  vars are unset, so every exported function checks supabasePublicConfigured()
 *  first and returns an empty/null fallback instead of crashing the page. */
export async function getBlogPosts(): Promise<BlogPost[]> {
  if (!supabasePublicConfigured()) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) {
    console.error("[blog] getBlogPosts failed:", error.message);
    return [];
  }
  return data as BlogPost[];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!supabasePublicConfigured()) return null;
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  if (error || !data) return null;
  return data as BlogPost;
}