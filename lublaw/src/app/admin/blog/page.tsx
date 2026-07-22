import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type Post = {
  id: string;
  title: string;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
};

export default async function AdminBlogListPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("id,title,status,published_at,created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-maroon">Blog</h1>
        <Link
          href="/admin/blog/new"
          className="rounded-full bg-maroon text-white px-4 py-2 text-sm font-semibold hover:bg-maroon/90"
        >
          New post
        </Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(posts as Post[] ?? []).map((post) => (
              <tr key={post.id} className="hover:bg-surface">
                <td className="px-6 py-4">
                  <Link href={`/admin/blog/${post.id}`} className="font-medium text-maroon hover:underline">
                    {post.title}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                      post.status === "published" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-muted">
                  {new Date(post.published_at ?? post.created_at).toLocaleDateString("en-ZA")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!posts || posts.length === 0) && (
          <p className="text-center text-muted py-12">No posts yet.</p>
        )}
      </div>
    </div>
  );
}
