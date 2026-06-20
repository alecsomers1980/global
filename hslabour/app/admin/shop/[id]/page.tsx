import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProductById } from "@/lib/shop";
import { updateProduct, uploadProductFile } from "../actions";
import Link from "next/link";

export const metadata = { title: "Edit product | Admin" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <div className="min-h-screen bg-mint/40">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link
          href="/admin/shop"
          className="text-sm text-green-dark hover:text-green"
        >
          &larr; Shop products
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-navy">{product.name}</h1>

        {/* Settings card */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <form
            action={async (formData) => {
              "use server";
              await updateProduct(formData);
            }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <input type="hidden" name="id" value={product.id} />

            <div>
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
                defaultValue={product.name}
                className="w-full rounded border border-slate-300 px-3 py-2 text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
              />
            </div>

            <div>
              <label
                htmlFor="slug"
                className="text-sm font-medium text-slate-700"
              >
                Slug
              </label>
              <input
                id="slug"
                name="slug"
                required
                defaultValue={product.slug}
                className="w-full rounded border border-slate-300 px-3 py-2 text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-slate-700"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={product.description ?? ""}
                className="w-full rounded border border-slate-300 px-3 py-2 text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
              />
            </div>

            <div>
              <label
                htmlFor="price"
                className="text-sm font-medium text-slate-700"
              >
                Price (R)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={(product.price_cents / 100).toString()}
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
                defaultValue={product.kind}
                className="w-full rounded border border-slate-300 px-3 py-2 text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
              >
                <option value="instant">Instant download</option>
                <option value="service">Done-for-you service</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="revisions"
                className="text-sm font-medium text-slate-700"
              >
                Revisions
              </label>
              <input
                id="revisions"
                name="revisions"
                type="number"
                min="0"
                defaultValue={String(product.revisions)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
              />
            </div>

            <div>
              <label
                htmlFor="sort_order"
                className="text-sm font-medium text-slate-700"
              >
                Sort order
              </label>
              <input
                id="sort_order"
                name="sort_order"
                type="number"
                defaultValue={String(product.sort_order)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                name="requires_upload"
                id="requires_upload"
                defaultChecked={product.requires_upload}
                className="h-4 w-4"
              />
              <label
                htmlFor="requires_upload"
                className="text-sm font-medium text-slate-700"
              >
                Buyer uploads their CV (service)
              </label>
            </div>

            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                defaultChecked={product.is_active}
                className="h-4 w-4"
              />
              <label
                htmlFor="is_active"
                className="text-sm font-medium text-slate-700"
              >
                Active (visible in the shop)
              </label>
            </div>

            <div>
              <label
                htmlFor="sla_hours"
                className="text-sm font-medium text-slate-700"
              >
                SLA hours (0 = none)
              </label>
              <input
                id="sla_hours"
                name="sla_hours"
                type="number"
                min="0"
                defaultValue={String(product.sla_hours)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                name="requires_consent"
                id="requires_consent"
                defaultChecked={product.requires_consent}
                className="h-4 w-4"
              />
              <label
                htmlFor="requires_consent"
                className="text-sm font-medium text-slate-700"
              >
                Require POPIA consent at checkout (verification)
              </label>
            </div>

            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                name="requires_appointment"
                id="requires_appointment"
                defaultChecked={product.requires_appointment}
                className="h-4 w-4"
              />
              <label
                htmlFor="requires_appointment"
                className="text-sm font-medium text-slate-700"
              >
                Require fingerprint appointment booking (criminal check)
              </label>
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded bg-green px-6 py-3 text-sm font-semibold text-navy hover:bg-green-dark"
              >
                Save
              </button>
            </div>
          </form>
        </div>

        {/* File upload card */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-navy">Download file</h2>
          {product.file_path ? (
            <p className="mt-1 text-sm text-green-dark">A file is uploaded.</p>
          ) : (
            <p className="mt-1 text-sm text-amber-600">No file uploaded yet.</p>
          )}
          <form
            action={async (formData) => {
              "use server";
              await uploadProductFile(formData);
            }}
            className="mt-4 flex items-center gap-3"
          >
            <input type="hidden" name="id" value={product.id} />
            <input type="file" name="file" className="text-sm" />
            <button
              type="submit"
              className="rounded bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-dark"
            >
              Upload
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}