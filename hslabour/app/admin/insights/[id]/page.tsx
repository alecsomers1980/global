import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CATEGORIES } from "@/lib/insights/generator";
import { saveInsight, approveInsight, publishInsightNow, discardInsight } from "../actions";

export const metadata = { title: "Review insight | Admin" };
export const dynamic = "force-dynamic";

function statusCls(status: string) {
  switch (status) {
    case "DRAFT": return "bg-amber-100 text-amber-700";
    case "APPROVED": return "bg-blue-100 text-blue-700";
    case "PUBLISHED": return "bg-green/15 text-green-dark";
    case "DISCARDED": return "bg-slate-100 text-slate-500";
    default: return "bg-slate-100 text-slate-500";
  }
}

export default async function ReviewInsightPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ msg?: string; error?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/");

  const { id } = await params;
  const { msg, error } = await searchParams;
  const admin = createAdminClient();
  const { data: post } = await admin
    .from("insights_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-mint/40">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link href="/admin/insights" className="text-sm text-green-dark hover:text-green">
          ← Insights
        </Link>

        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-navy">Review insight</h1>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusCls(post.status)}`}
          >
            {post.status}
          </span>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}
        {msg && !error && (
          <div className="mt-4 rounded-lg border border-green/30 bg-mint px-4 py-3 text-sm text-navy">
            {msg}
          </div>
        )}

        {/* Edit form */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <form action={saveInsight} className="grid gap-4">
            <input type="hidden" name="id" value={post.id} />

            <div>
              <label htmlFor="title" className="text-sm font-medium text-slate-700">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                defaultValue={post.title}
                required
                className="w-full rounded border border-slate-300 px-3 py-2 text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
              />
            </div>

            <div>
              <label htmlFor="slug" className="text-sm font-medium text-slate-700">
                Slug
              </label>
              <input
                id="slug"
                name="slug"
                type="text"
                defaultValue={post.slug}
                required
                className="w-full rounded border border-slate-300 px-3 py-2 text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
              />
            </div>

            <div>
              <label htmlFor="category" className="text-sm font-medium text-slate-700">
                Category
              </label>
              <select
                id="category"
                name="category"
                defaultValue={post.category}
                className="w-full rounded border border-slate-300 px-3 py-2 text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="excerpt" className="text-sm font-medium text-slate-700">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                rows={2}
                defaultValue={post.excerpt ?? ""}
                className="w-full rounded border border-slate-300 px-3 py-2 text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
              />
            </div>

            <div>
              <label htmlFor="meta_title" className="text-sm font-medium text-slate-700">
                Meta title
              </label>
              <input
                id="meta_title"
                name="meta_title"
                type="text"
                defaultValue={post.meta_title ?? ""}
                className="w-full rounded border border-slate-300 px-3 py-2 text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
              />
            </div>

            <div>
              <label htmlFor="meta_description" className="text-sm font-medium text-slate-700">
                Meta description
              </label>
              <textarea
                id="meta_description"
                name="meta_description"
                rows={2}
                defaultValue={post.meta_description ?? ""}
                className="w-full rounded border border-slate-300 px-3 py-2 text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
              />
            </div>

            <div>
              <label htmlFor="scheduled_for" className="text-sm font-medium text-slate-700">
                Scheduled for
              </label>
              <input
                id="scheduled_for"
                name="scheduled_for"
                type="datetime-local"
                defaultValue={
                  post.scheduled_for
                    ? new Date(post.scheduled_for).toISOString().slice(0, 16)
                    : ""
                }
                className="w-full rounded border border-slate-300 px-3 py-2 text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
              />
            </div>

            <div>
              <label htmlFor="content" className="text-sm font-medium text-slate-700">
                Content (markdown)
              </label>
              <textarea
                id="content"
                name="content"
                rows={18}
                defaultValue={post.content}
                className="w-full rounded border border-slate-300 px-3 py-2 font-mono text-xs text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
              />
            </div>

            <button
              type="submit"
              className="rounded bg-green px-6 py-3 text-sm font-semibold text-navy hover:bg-green-dark w-fit"
            >
              Save changes
            </button>
          </form>
        </div>

        {/* Actions card */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 flex flex-wrap gap-3">
          <form action={approveInsight}>
            <input type="hidden" name="id" value={post.id} />
            <button className="rounded bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-dark">
              Approve (schedule)
            </button>
          </form>

          <form action={publishInsightNow}>
            <input type="hidden" name="id" value={post.id} />
            <button className="rounded bg-green px-5 py-2.5 text-sm font-semibold text-navy hover:bg-green-dark">
              Publish now
            </button>
          </form>

          <form action={discardInsight}>
            <input type="hidden" name="id" value={post.id} />
            <button className="rounded border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100">
              Discard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}