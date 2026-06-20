import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEbookProduct, formatRands } from "@/lib/ebook";
import { saveEbookSettings, uploadEbookFile } from "./actions";
import CommissionActions from "./CommissionActions";
import Link from "next/link";

export const metadata = { title: "E-book | Admin" };

export default async function AdminEbookPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/");

  const product = await getEbookProduct();
  const admin = createAdminClient();

  const { data: orders } = await admin
    .from("ebook_orders")
    .select("id, buyer_email, amount_cents, status, ref_code, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: commissions } = await admin
    .from("commissions")
    .select("id, amount_cents, status, created_at, affiliate_id, profiles:affiliate_id(first_name,last_name,email)")
    .order("created_at", { ascending: false })
    .limit(50);

  const orderRows = (orders ?? []) as Array<{
    id: string;
    buyer_email: string;
    amount_cents: number;
    status: string;
    ref_code: string | null;
    created_at: string;
  }>;

  const commissionRows = (commissions ?? []) as Array<{
    id: string;
    amount_cents: number;
    status: "pending" | "approved" | "paid";
    created_at: string;
    profiles:
      | { first_name: string | null; last_name: string | null; email: string | null }
      | { first_name: string | null; last_name: string | null; email: string | null }[]
      | null;
  }>;

  return (
    <div className="min-h-screen bg-mint/40">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Link href="/admin" className="text-sm text-green-dark hover:text-green">
          ← Admin
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-navy">E-book</h1>

        {/* Settings */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-navy">Product &amp; commission</h2>
          <form
            action={async (formData) => {
              "use server";
              await saveEbookSettings(formData);
            }}
            className="mt-4 grid gap-4 sm:grid-cols-2"
          >
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                name="title"
                defaultValue={product?.title ?? ""}
                required
                className="w-full rounded border border-slate-300 px-3 py-2 text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="price">
                Price (R)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product ? (product.price_cents / 100).toString() : "0"}
                className="w-full rounded border border-slate-300 px-3 py-2 text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={product?.description ?? ""}
                className="w-full rounded border border-slate-300 px-3 py-2 text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="commission_type">
                Commission type
              </label>
              <select
                id="commission_type"
                name="commission_type"
                defaultValue={product?.commission_type ?? "percent"}
                className="w-full rounded border border-slate-300 px-3 py-2 text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
              >
                <option value="percent">Percent (%)</option>
                <option value="flat">Flat (R)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="commission_value">
                Commission value
              </label>
              <input
                id="commission_value"
                name="commission_value"
                type="number"
                step="0.01"
                min="0"
                defaultValue={product ? String(product.commission_value) : "0"}
                className="w-full rounded border border-slate-300 px-3 py-2 text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
              />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                defaultChecked={product?.is_active ?? false}
                className="h-4 w-4"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
                Active (visible for sale on /ebook)
              </label>
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded bg-green px-6 py-3 text-sm font-semibold text-navy hover:bg-green-dark"
              >
                Save settings
              </button>
            </div>
          </form>
        </div>

        {/* File uploaded */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-navy">E-book file</h2>
          {product?.file_path ? (
            <p className="mt-1 text-sm text-green-dark">A file is uploaded.</p>
          ) : (
            <p className="mt-1 text-sm text-amber-600">
              No file uploaded yet — buyers can&apos;t download until you upload one.
            </p>
          )}
          <form
            action={async (formData) => {
              "use server";
              await uploadEbookFile(formData);
            }}
            className="mt-4 flex items-center gap-3"
          >
            <input type="file" name="file" accept="application/pdf" className="text-sm" />
            <button className="rounded bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-dark">
              Upload PDF
            </button>
          </form>
        </div>

        {/* Recent orders */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-navy">Recent orders</h2>
          {orderRows.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No orders yet.</p>
          ) : (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-2 font-medium">Date</th>
                    <th className="px-4 py-2 font-medium">Buyer</th>
                    <th className="px-4 py-2 font-medium">Amount</th>
                    <th className="px-4 py-2 font-medium">Ref</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orderRows.map((o) => (
                    <tr key={o.id} className="border-b last:border-0">
                      <td className="px-4 py-2">
                        {new Date(o.created_at).toLocaleDateString("en-ZA")}
                      </td>
                      <td className="px-4 py-2">{o.buyer_email}</td>
                      <td className="px-4 py-2">{formatRands(o.amount_cents)}</td>
                      <td className="px-4 py-2">{o.ref_code || "—"}</td>
                      <td className="px-4 py-2">
                        {o.status === "paid" ? (
                          <span className="inline-block rounded bg-green/15 px-2 py-0.5 text-xs font-semibold text-green-dark">
                            Paid
                          </span>
                        ) : o.status === "pending" ? (
                          <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                            Pending
                          </span>
                        ) : (
                          <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                            {o.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Commissions */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-navy">Commissions</h2>
          {commissionRows.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No commissions yet.</p>
          ) : (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-4 py-2 font-medium">Date</th>
                    <th className="px-4 py-2 font-medium">Affiliate</th>
                    <th className="px-4 py-2 font-medium">Amount</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {commissionRows.map((c) => {
                    const p = Array.isArray(c.profiles)
                      ? c.profiles[0]
                      : c.profiles;
                    const name =
                      [p?.first_name, p?.last_name].filter(Boolean).join(" ") ||
                      p?.email ||
                      "—";
                    return (
                      <tr key={c.id} className="border-b last:border-0">
                        <td className="px-4 py-2">
                          {new Date(c.created_at).toLocaleDateString("en-ZA")}
                        </td>
                        <td className="px-4 py-2">{name}</td>
                        <td className="px-4 py-2">{formatRands(c.amount_cents)}</td>
                        <td className="px-4 py-2 capitalize">{c.status}</td>
                        <td className="px-4 py-2">
                          <CommissionActions id={c.id} status={c.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}