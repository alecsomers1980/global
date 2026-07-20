import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CONCERNS, concernBySlug } from "@/lib/nav";
import { getByConcern } from "@/lib/catalog";
import ProductCard from "@/components/shop/ProductCard";
import Link from "next/link";
import AuroraSquiggle from "@/components/motion/AuroraSquiggle";
import PageBanner from "@/components/site/PageBanner";

export async function generateStaticParams() {
  return CONCERNS.map((c) => ({ concern: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ concern: string }>;
}): Promise<Metadata> {
  const { concern } = await params;
  const data = concernBySlug(concern);
  if (!data) return { title: "Concern not found" };
  return { title: data.name };
}

export default async function ConcernPage({
  params,
}: {
  params: Promise<{ concern: string }>;
}) {
  const { concern } = await params;
  const concernData = concernBySlug(concern);

  if (!concernData) notFound();

  const products = await getByConcern(concernData.slug);
  const otherConcerns = CONCERNS.filter((c) => c.slug !== concernData.slug);

  return (
    <div className="relative">
      <AuroraSquiggle variant="page" />
      <div className="relative z-10">
        <main className="min-h-screen">
          <PageBanner video="/videos/dew-banner.mp4"
            eyebrow="SHOP BY CONCERN"
            title={concernData.name}
            subtitle={concernData.blurb}
          />

          {/* Products grid or empty state */}
          {products.length === 0 ? (
            <div className="text-center py-24 px-6">
              <p className="text-lg text-muted">
                Products for this concern are being added — browse the full range
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

          {/* Other concerns */}
          {otherConcerns.length > 0 && (
            <div className="px-6 max-w-7xl mx-auto mt-16 mb-16">
              <div className="border-t border-line pt-10">
                <h2 className="text-lg font-medium mb-6">Other concerns</h2>
                <div className="flex flex-wrap gap-3">
                  {otherConcerns.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/shop/${c.slug}`}
                      className="rounded-full bg-surface border border-line px-4 py-2 text-sm text-ink hover:border-forest transition-colors"
                    >
                      {c.name}
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
