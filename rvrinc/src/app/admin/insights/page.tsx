import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { pickNextCategory, generateInsight } from "@/utils/ai/insightsGenerator";

export const maxDuration = 60;

const statusStyles: Record<string, string> = {
  DRAFT: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-blue-100 text-blue-800",
  PUBLISHED: "bg-green-100 text-green-800",
  DISCARDED: "bg-red-100 text-red-800",
};

async function generateNewInsight() {
  "use server";
  const supabase = await createClient();

  const { data: recentPosts } = await supabase
    .from("insights_posts")
    .select("title")
    .order("created_at", { ascending: false })
    .limit(12);

  const recentTitles = recentPosts?.map((post: { title: string }) => post.title) ?? [];
  const category = pickNextCategory(recentTitles as any);
  const insight = await generateInsight({ category, recentTitles });

  const { data: newPost, error } = await supabase
    .from("insights_posts")
    .insert({
      title: insight.title,
      slug: insight.slug,
      excerpt: insight.excerpt,
      meta_title: insight.meta_title,
      meta_description: insight.meta_description,
      content: insight.body_md,
      image_url: insight.image_url,
      category,
      status: "DRAFT",
      scheduled_for: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    console.error("Manual generate failed:", error.message);
    return;
  }

  revalidatePath("/admin/insights");
  redirect(`/admin/insights/${newPost.id}`);
}

export default async function AdminInsightsPage() {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from("insights_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Error loading posts: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Insights Posts</h1>
        <form action={generateNewInsight}>
          <Button variant="brand" size="sm" type="submit">Generate New Insight</Button>
        </form>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden w-full text-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Scheduled For</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Created At</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts && posts.length > 0 ? (
              posts.map((post) => (
                <tr key={post.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{post.title}</td>
                  <td className="px-4 py-3 text-gray-600">{post.category || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        statusStyles[post.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {post.scheduled_for
                      ? new Date(post.scheduled_for).toLocaleDateString("en-ZA")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(post.created_at).toLocaleDateString("en-ZA")}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/insights/${post.id}`}>
                      <Button variant="outline" size="sm">Manage</Button>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No posts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
