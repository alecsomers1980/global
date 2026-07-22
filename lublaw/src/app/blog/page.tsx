import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 12;

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const { data: posts, count } = await supabase
    .from("posts")
    .select("id,title,slug,excerpt,featured_image,published_at", { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="font-heading text-3xl text-maroon mb-10 text-center">Blog</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {(posts ?? []).map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="block border border-line rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
          >
            {post.featured_image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.featured_image} alt="" className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
              <h2 className="font-heading text-lg text-ink mb-1">{post.title}</h2>
              <p className="text-xs text-muted mb-2">
                {post.published_at && new Date(post.published_at).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}
              </p>
              <p className="text-sm text-muted line-clamp-3">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
      {(!posts || posts.length === 0) && <p className="text-center text-muted py-12">No posts yet.</p>}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/blog?page=${p}`}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                p === page ? "bg-maroon text-white" : "bg-surface text-ink hover:bg-line"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
