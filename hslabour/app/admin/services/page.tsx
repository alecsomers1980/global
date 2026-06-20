import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

export const metadata = { title: "Services | Admin" };

export default async function AdminServicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const admin = createAdminClient();
  const { data } = await admin
    .from("service_jobs")
    .select("id, product_name, buyer_email, status, revisions_remaining, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  const jobs = (data ?? []) as Array<{
    id: string;
    product_name: string;
    buyer_email: string;
    status: string;
    revisions_remaining: number;
    created_at: string;
  }>;

  const statusMap: Record<string, string> = {
    received: "bg-slate-100 text-slate-600",
    in_progress: "bg-amber-100 text-amber-700",
    awaiting_client: "bg-blue-100 text-blue-700",
    delivered: "bg-green/15 text-green-dark",
  };

  return (
    <div className="min-h-screen bg-mint/40">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Link href="/admin" className="text-sm text-green-dark hover:text-green">
          ← Admin
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-navy">Service jobs</h1>
        <p className="mt-1 text-slate-600">{jobs.length} job(s).</p>

        {jobs.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            No service jobs yet.
          </p>
        ) : (
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Buyer</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Revisions</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr key={j.id} className="border-b border-slate-100">
                      <td className="px-4 py-3 text-sm">
                        {new Date(j.created_at).toLocaleDateString("en-ZA")}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-navy">
                        {j.product_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {j.buyer_email}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            statusMap[j.status] || ""
                          }`}
                        >
                          {j.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{j.revisions_remaining}</td>
                      <td className="px-4 py-3 text-sm">
                        <Link
                          href={`/admin/services/${j.id}`}
                          className="text-sm font-semibold text-green-dark hover:text-green"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}