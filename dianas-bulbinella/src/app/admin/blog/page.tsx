import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { generateBlogPost, pickNextCategory } from "@/lib/blog/generator";

export const maxDuration = 60;

type Post = {
  id: string;
  title: string;
  category: string;
  status: "draft" | "approved" | "published" | "discarded";
  scheduled_for: string | null;
  published_at: string | null;
  created_at: string;
};

const statusBadge = {
  draft: "bg-amber-100 text-amber-800",
  approved: "bg-blue-100 text-blue-800",
  published: "bg-green-100 text-green-800",
  discarded: "bg-gray-100 text-gray-600",
} as const;

/** Manually draft a post now, instead of waiting for the monthly cron.
 *  Same generator + compliance guard; lands as a draft for Diana to review. */
async function generateDraftNow() {
  "use server";
  const supabase = await createClient();

  const { data: recent } = await supabase
    .from("blog_posts")
    .select("title, category, slug")
    .order("created_at", { ascending: false })
    .limit(12);

  const recentTitles = (recent ?? []).map((p) => p.title as string);
  const recentCategories = (recent ?? []).map((p) => p.category as string);
  const existingSlugs = new Set((recent ?? []).map((p) => p.slug as string));

  const category = pickNextCategory(recentCategories);
  const post = await generateBlogPost({ category, recentTitles });

  // Keep the slug unique (the column is UNIQUE — a collision would fail insert).
  let slug = post.slug || "post";
  while (existingSlugs.has(slug)) slug = `${post.slug}-${Math.random().toString(36).slice(2, 6)}`;

  const { data: created, error } = await supabase
    .from("blog_posts")
    .insert({
      title: post.title,
      slug,
      excerpt: post.excerpt,
      meta_title: post.meta_title,
      meta_description: post.meta_description,
      content: post.body_md,
      image_url: post.image_url,
      category,
      status: "draft",
      scheduled_for: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    console.error("Manual generate failed:", error.message);
    return;
  }

  revalidatePath("/admin/blog");
  redirect(`/admin/blog/${created.id}`);
}

export default async function AdminBlogQueuePage() {
  const supabase = await createClient();
  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("id,title,category,status,scheduled_for,published_at,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching blog posts:", error);
  }

  const sortedPosts = posts
    ? [...posts].sort((a, b) => {
        if (a.status === "draft" && b.status !== "draft") return -1;
        if (b.status === "draft" && a.status !== "draft") return 1;
        return 0;
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-forest">Journal</h1>
          <p className="mt-1 text-sm text-muted">
            Drafts are AI-generated monthly; approve to schedule.
            Approved posts will automatically publish on their scheduled date.
          </p>
        </div>
        <form action={generateDraftNow}>
          <button
            type="submit"
            className="rounded-lg bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest/90"
          >
            Generate a draft now
          </button>
        </form>
      </div>

      {sortedPosts.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center text-muted">
          No journal posts yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedPosts.map((post: Post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/blog/${post.id}`}
                      className="font-medium text-forest underline underline-offset-4 hover:text-aurora-gold"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-muted">{post.category}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusBadge[post.status]}`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted">
                    {post.status === "published" && post.published_at
                      ? new Date(post.published_at).toLocaleDateString("en-ZA", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : post.scheduled_for
                      ? new Date(post.scheduled_for).toLocaleDateString("en-ZA", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : new Date(post.created_at).toLocaleDateString("en-ZA", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
