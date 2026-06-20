import { getActiveProducts } from "@/lib/shop";
import { formatRands } from "@/lib/ebook";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Shop & Services",
  description:
    "CV preparation, document verification and instant downloads to help you land your next job — from H&S Labour Brokers.",
  alternates: { canonical: "/shop" },
};
export const revalidate = 3600;

export default async function ShopPage() {
  const products = await getActiveProducts();

  return (
    <div className="min-h-screen bg-mint/40">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="text-3xl font-bold text-navy">Shop &amp; online services</h1>
        <p className="mt-2 text-slate-600">
          CV templates, cover letters, CV revamps and more.
        </p>

        {products.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            No products available yet — please check back soon.
          </p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/shop/${p.slug}`}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 hover:border-green"
              >
                <span className="self-start rounded-full bg-mint px-2 py-1 text-xs font-semibold text-green-dark">
                  {p.kind === "service" ? "Service" : "Instant download"}
                </span>
                <h2 className="mt-3 text-lg font-bold text-navy">{p.name}</h2>
                {p.description && (
                  <p className="mt-1 line-clamp-3 text-sm text-slate-600">
                    {p.description}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between pt-2">
                  <span className="text-lg font-bold text-green-dark">
                    {formatRands(p.price_cents)}
                  </span>
                  <ArrowRight className="h-4 w-4 text-navy" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}