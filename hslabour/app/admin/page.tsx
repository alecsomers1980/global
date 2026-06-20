import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Users, BookOpen, Store, ClipboardList } from "lucide-react";

export const metadata = { title: "Admin" };

export default async function AdminHome() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/");

  const admin = createAdminClient();
  const [{ count: total }, { count: pending }] = await Promise.all([
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "affiliate"),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "affiliate")
      .eq("is_approved", false),
  ]);

  return (
    <div className="min-h-screen bg-mint/40">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-bold text-navy">Admin</h1>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {/* Affiliates card */}
          <Link
            href="/admin/affiliates"
            className="block rounded-2xl border border-slate-200 bg-white p-6 hover:border-green"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint text-green-dark">
              <Users className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-navy">Affiliates</h2>
            <p className="mt-1 text-sm text-slate-600">
              {total ?? 0} total · {pending ?? 0} pending approval
            </p>
          </Link>

          {/* E-book card */}
          <Link
            href="/admin/ebook"
            className="block rounded-2xl border border-slate-200 bg-white p-6 hover:border-green"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint text-green-dark">
              <BookOpen className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-navy">E-book</h2>
            <p className="mt-1 text-sm text-slate-600">
              Upload the file, set price &amp; commission, view sales
            </p>
          </Link>

          {/* Shop card */}
          <Link
            href="/admin/shop"
            className="block rounded-2xl border border-slate-200 bg-white p-6 hover:border-green"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint text-green-dark">
              <Store className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-navy">Shop</h2>
            <p className="mt-1 text-sm text-slate-600">
              CV templates &amp; services — products, prices, files
            </p>
          </Link>

          {/* Service jobs card */}
          <Link
            href="/admin/services"
            className="block rounded-2xl border border-slate-200 bg-white p-6 hover:border-green"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint text-green-dark">
              <ClipboardList className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-navy">Service jobs</h2>
            <p className="mt-1 text-sm text-slate-600">
              Done-for-you orders — status, uploads, deliverables
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}