import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Users, Clock } from "lucide-react";

export default async function AdminHome() {
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
  const { count: total } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "affiliate");

  const { count: pending } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "affiliate")
    .eq("is_approved", false);

  return (
    <div className="min-h-screen bg-mint/40">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-bold text-navy">Admin</h1>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <Link
            href="/admin/affiliates"
            className="block rounded-2xl border border-slate-200 bg-white p-6 hover:border-green"
          >
            <Users className="h-5 w-5" />
            <h2 className="mt-4 text-lg font-bold text-navy">Affiliates</h2>
            <p className="mt-1 text-sm text-slate-600">
              {total ?? 0} total · {pending ?? 0} pending approval
            </p>
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <Clock className="h-5 w-5" />
            <h2 className="mt-4 text-lg font-bold text-navy">More coming</h2>
            <p className="mt-1 text-sm text-slate-600">
              Shop orders and verification jobs will appear here in later phases.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}