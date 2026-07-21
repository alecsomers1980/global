import { Metadata } from "next";
import { notFound } from "next/navigation";
import { RANGES, rangeBySlug } from "@/lib/nav";
import { getByRange } from "@/lib/catalog";
import ProductCard from "@/components/shop/ProductCard";
import Link from "next/link";
import AuroraSquiggle from "@/components/motion/AuroraSquiggle";
import PageBanner from "@/components/site/PageBanner";

export async function generateStaticParams() {
  return RANGES.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = rangeBySlug(slug);
  if (!data) return { title: "Range not found" };
  return { title: data.name };
}

export default async function RangePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const rangeData = rangeBySlug(slug);

  if (!rangeData) notFound();

  const products = await getByRange(rangeData.slug);
  const otherRanges = RANGES.filter((r) => r.slug !== rangeData.slug);

  return (
    <div className="relative">
      <AuroraSquiggle variant="page" />
      <div className="relative z-10">
        <main className="min-h-screen">
          <PageBanner video="/videos/leaves-banner.mp4"
            eyebrow="SIGNATURE RANGE"
            title={rangeData.name}
            subtitle="A range built on one plant, done properly."
          />

          {/* Products grid / empty */}
          {products.length === 0 ? (
            <div className="text-center py-24 px-6">
              <p className="text-lg text-muted">
                Products for this range are being added — browse the full shop
                meanwhile.
              </p>
              <Link
                href="/shop"
                className="inline-block mt-4 text-forest underline"
              >
                Visit the full shop
              </Link>
            </div>
          ) : (
            <div className="px-6 max-w-7xl mx-auto py-10 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Other ranges */}
          {otherRanges.length > 0 && (
            <div className="px-6 max-w-7xl mx-auto mt-16 mb-16">
              <div className="border-t border-line pt-10">
                <h2 className="text-lg font-medium mb-6">Other ranges</h2>
                <div className="flex flex-wrap gap-3">
                  {otherRanges.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/range/${r.slug}`}
                      className="rounded-full bg-surface border border-line px-4 py-2 text-sm text-ink hover:border-forest transition-colors"
                    >
                      {r.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
