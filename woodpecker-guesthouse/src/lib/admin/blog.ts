import { createClient } from "@/lib/supabase/client";
import type { BlogPost } from "@/lib/types";

/** Admin read: ALL posts regardless of status (RLS: is_staff() allows this;
 *  the public getBlogPosts() in lib/blog.ts only ever sees status: 'published'). */
export async function getAllPostsAdmin(): Promise<BlogPost[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("[admin/blog] getAllPostsAdmin failed:", error.message);
    return [];
  }
  return data as BlogPost[];
}

export async function getPostByIdAdmin(id: string): Promise<BlogPost | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id).single();
  if (error || !data) return null;
  return data as BlogPost;
}

export async function updatePost(id: string, patch: Partial<BlogPost>): Promise<{ error: string | null }> {
  const supabase = createClient();
  const finalPatch: Partial<BlogPost> = { ...patch };
  // Approving a draft that has no schedule must get one, otherwise the daily
  // publish cron (scheduled_for <= now(), see the publish cron route) skips it forever.
  if (patch.status === "approved") {
    const current = await getPostByIdAdmin(id);
    if (current && !current.scheduled_for) {
      finalPatch.scheduled_for = new Date().toISOString();
    }
  }
  const { error } = await supabase.from("blog_posts").update(finalPatch).eq("id", id);
  return { error: error?.message ?? null };
}

export async function deletePost(id: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  return { error: error?.message ?? null };
}