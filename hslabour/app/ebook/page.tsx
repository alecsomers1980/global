import { getEbookProduct, formatRands } from "@/lib/ebook";
import { Download, Check } from "lucide-react";

export const metadata = {
  title: "Job-Hunting E-book | H&S Labour",
};

// Always read the live product config (price/availability change in /admin/ebook).
export const dynamic = "force-dynamic";

export default async function EbookPage() {
  const product = await getEbookProduct();
  const available =
    !!product && product.is_active && product.price_cents > 0 && !!product.file_path;

  return (
    <div className="min-h-screen bg-mint/40">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <h1 className="text-3xl font-bold text-navy">
            {product?.title ?? "Job-Hunting E-book"}
          </h1>

          {product?.description && (
            <p className="mt-3 whitespace-pre-line text-slate-600">
              {product.description}
            </p>
          )}

          {!available ? (
            <p className="mt-6 rounded-lg bg-mint p-4 text-navy">
              This e-book isn&apos;t available for purchase just yet. Please
              check back soon.
            </p>
          ) : (
            <>
              <p className="mt-6 text-2xl font-bold text-green-dark">
                {formatRands(product.price_cents)}
              </p>

              <ul className="mt-4 space-y-1 text-sm text-slate-600">
                <li>
                  <Check className="inline h-4 w-4 text-green-dark" /> Instant
                  download after payment
                </li>
                <li>
                  <Check className="inline h-4 w-4 text-green-dark" /> Secure
                  checkout via PayFast
                </li>
              </ul>

              <form
                action="/ebook/checkout"
                method="post"
                className="mt-8 space-y-4"
              >
                <div>
                  <label
                    htmlFor="buyer_name"
                    className="text-sm font-medium text-slate-700"
                  >
                    Your name
                  </label>
                  <input
                    id="buyer_name"
                    name="buyer_name"
                    required
                    className="w-full rounded border border-slate-300 px-3 py-2 text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
                  />
                </div>

                <div>
                  <label
                    htmlFor="buyer_email"
                    className="text-sm font-medium text-slate-700"
                  >
                    Email for your receipt &amp; download
                  </label>
                  <input
                    id="buyer_email"
                    name="buyer_email"
                    type="email"
                    required
                    className="w-full rounded border border-slate-300 px-3 py-2 text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded bg-green px-6 py-3 text-sm font-semibold text-navy hover:bg-green-dark"
                >
                  <Download className="h-4 w-4" /> Buy &amp; download
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}