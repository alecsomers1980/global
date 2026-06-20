import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAllProducts } from "@/lib/shop";
import { formatRands } from "@/lib/ebook";
import { createProduct } from "./actions";
import Link from "next/link";

export const metadata = { title: "Shop | Admin" };

export default async function AdminShopPage() {
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

  const products = await getAllProducts();

  return (
    <div className="min-h-screen bg-mint/40">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <Link
          href="/admin"
          className="text-sm text-green-dark hover:text-green"
        >
          &larr; Admin
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-navy">Shop products</h1>

        {/* Add product card */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-navy">Add a product</h2>
          <form
            action={async (formData) => {
              "use server";
              await createProduct(formData);
            }}
            className="mt-4 flex flex-wrap items-end gap-3"
          >
            <div className="min-w-[220px]">
              <label
                htmlFor="name"
                className="text-sm font-medium text-slate-700"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                required
                className="w-full rounded border border-slate-300 px-3 py-2 text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
              />
            </div>
            <div>
              <label
                htmlFor="kind"
                className="text-sm font-medium text-slate-700"
              >
                Type
              </label>
              <select
                id="kind"
                name="kind"
                className="w-full rounded border border-slate-300 px-3 py-2 text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
              >
                <option value="instant">Instant download</option>
                <option value="service">Done-for-you service</option>
              </select>
            </div>
            <button
              type="submit"
              className="rounded bg-green px-5 py-2 text-sm font-semibold text-navy hover:bg-green-dark"
            >
              Add
            </button>
          </form>
        </div>

        {/* Products table card */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {products.length === 0 ? (
            <p className="p-8 text-center text-slate-500">No products yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Active</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100">
                      <td className="px-4 py-3 text-sm font-medium text-navy">
                        {p.name}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {p.kind === "service" ? "Service" : "Instant"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {formatRands(p.price_cents)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {p.is_active ? (
                          <span className="rounded-full bg-green/15 px-2 py-1 text-xs font-semibold text-green-dark">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Link
                          href={`/admin/shop/${p.id}`}
                          className="text-sm font-semibold text-green-dark hover:text-green"
                        >
                          Edit
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