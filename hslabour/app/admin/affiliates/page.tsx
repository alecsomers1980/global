import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AffiliateRow, { type Affiliate } from "./AffiliateRow";
import Link from "next/link";

export const metadata = { title: "Affiliates | Admin" };

export default async function AdminAffiliatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (me?.role !== "admin") redirect("/");

  const admin = createAdminClient();
  const { data: affiliates } = await admin
    .from("profiles")
    .select("id, first_name, last_name, email, created_at, is_approved, affiliate_code")
    .eq("role", "affiliate")
    .order("created_at", { ascending: false });

  const list = (affiliates ?? []) as Affiliate[];

  return (
    <div className="min-h-screen bg-mint/40">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Link href="/admin" className="text-sm text-green-dark hover:text-green">
          ← Admin
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-navy">Affiliates</h1>
        <p className="mt-1 text-slate-600">
          {list.length} application(s). Approve to issue a tracking code.
        </p>

        {list.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            No affiliate applications yet.
          </p>
        ) : (
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Applied</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((a) => (
                    <AffiliateRow key={a.id} affiliate={a} />
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