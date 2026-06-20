import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/shop";
import { formatRands } from "@/lib/ebook";
import { Download, Check } from "lucide-react";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Shop & Services" };
  return {
    title: product.name,
    description: product.description?.slice(0, 155) || undefined,
    alternates: { canonical: `/shop/${slug}` },
  };
}

export default async function ShopProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.is_active) {
    notFound();
  }

  const isService = product.kind === "service";
  const purchasable =
    product.price_cents > 0 && (isService || !!product.file_path);

  return (
    <div className="min-h-screen bg-mint/40">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <span className="self-start rounded-full bg-mint px-2 py-1 text-xs font-semibold text-green-dark">
            {isService ? "Service" : "Instant download"}
          </span>

          <h1 className="mt-3 text-3xl font-bold text-navy">{product.name}</h1>

          {product.description && (
            <p className="mt-3 whitespace-pre-line text-slate-600">
              {product.description}
            </p>
          )}

          <p className="mt-6 text-2xl font-bold text-green-dark">
            {formatRands(product.price_cents)}
          </p>

          <ul className="mt-4 space-y-1 text-sm text-slate-600">
            {isService ? (
              <>
                <li>
                  <Check className="inline h-4 w-4 text-green-dark" /> We&apos;ll deliver your completed document
                </li>
                {product.revisions > 0 && (
                  <li>
                    <Check className="inline h-4 w-4 text-green-dark" />{" "}
                    {product.revisions} revision
                    {product.revisions === 1 ? "" : "s"} included
                  </li>
                )}
              </>
            ) : (
              <li>
                <Check className="inline h-4 w-4 text-green-dark" /> Instant download after payment
              </li>
            )}
            {product.requires_appointment && (
              <li>
                <Check className="inline h-4 w-4 text-green-dark" /> Includes a fingerprint appointment at one of our hubs
              </li>
            )}
            {product.sla_hours > 0 && (
              <li>
                <Check className="inline h-4 w-4 text-green-dark" /> Results in around {product.sla_hours} hours
              </li>
            )}
            <li>
              <Check className="inline h-4 w-4 text-green-dark" /> Secure checkout via PayFast
            </li>
          </ul>

          {!purchasable ? (
            <p className="mt-6 rounded-lg bg-mint p-4 text-navy">
              This product isn&apos;t available to buy just yet.
            </p>
          ) : (
            <form action="/shop/checkout" method="post" className="mt-8 space-y-4">
              <input type="hidden" name="product_id" value={product.id} />

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Your name
                </label>
                <input
                  name="buyer_name"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  name="buyer_email"
                  type="email"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                />
              </div>

              {isService && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Tell us what you need
                  </label>
                  <textarea
                    name="brief"
                    rows={4}
                    placeholder="e.g. role you're applying for, industry, anything to highlight"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                  />
                </div>
              )}

              {product.requires_consent && (
                <label className="flex items-start gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    name="consent"
                    required
                    className="mt-1 h-4 w-4"
                  />
                  <span>
                    I consent to H&amp;S Labour processing my personal information
                    for this verification, in line with POPIA.
                  </span>
                </label>
              )}

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded bg-green px-6 py-3 text-sm font-semibold text-navy hover:bg-green-dark"
              >
                <Download className="h-4 w-4" />
                {isService ? "Pay & start" : "Buy & download"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}