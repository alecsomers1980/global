import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createBlankInsight, generateInsightNow } from "./actions";

export const metadata = { title: "Insights | Admin" };
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

export default async function AdminInsightsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/");

  const admin = createAdminClient();
  const { data } = await admin
    .from("insights_posts")
    .select("id, title, category, status, scheduled_for, created_at")
    .order("created_at", { ascending: false });
  const posts = data ?? [];

  return (
    <div className="min-h-screen bg-mint/40">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Link href="/admin" className="text-sm text-green-dark hover:text-green">
          ← Admin
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-navy">Insights</h1>
        <p className="mt-1 text-sm text-slate-600">
          Drafts appear here for review. Approve them to schedule, or discard. Use the
          buttons below to add one now.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <form action={createBlankInsight}>
            <button
              type="submit"
              className="rounded-lg bg-green px-5 py-2.5 text-sm font-semibold text-navy hover:bg-green-dark"
            >
              Write a new article
            </button>
          </form>
          <form action={generateInsightNow}>
            <button
              type="submit"
              className="rounded-lg border border-navy/20 px-5 py-2.5 text-sm font-semibold text-navy hover:bg-mint"
            >
              Generate with AI
            </button>
          </form>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {posts.length === 0 ? (
            <p className="p-8 text-center text-slate-500">
              No insights yet. The monthly generator will create drafts here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Scheduled</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">{""}</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100">
                      <td className="px-4 py-3 text-sm font-medium text-navy">
                        {p.title}
                      </td>
                      <td className="px-4 py-3 text-sm">{p.category}</td>
                      <td className="px-4 py-3 text-sm">
                        {p.scheduled_for
                          ? new Date(p.scheduled_for).toLocaleDateString("en-ZA")
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${statusCls(p.status)}`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Link
                          href={`/admin/insights/${p.id}`}
                          className="text-sm font-semibold text-green-dark hover:text-green"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}