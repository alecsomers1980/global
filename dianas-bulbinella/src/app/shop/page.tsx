import { Metadata } from "next";
import { getAllProducts, getFormats } from "@/lib/catalog";
import { applyFilters } from "@/lib/filter";
import FilterBar from "@/components/shop/FilterBar";
import ProductCard from "@/components/shop/ProductCard";
import Link from "next/link";
import AuroraSquiggle from "@/components/motion/AuroraSquiggle";
import PageBanner from "@/components/site/PageBanner";

export const metadata: Metadata = {
  title: "Shop All",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const allProducts = await getAllProducts();
  const filtered = applyFilters(allProducts, sp);
  const formats = await getFormats();

  return (
    <div className="relative">
      <AuroraSquiggle variant="page" />
      <div className="relative z-10">
        <main className="min-h-screen">
          <PageBanner video="/videos/botanical-banner.mp4"
            eyebrow="THE FULL RANGE"
            title="Every product,"
            accent="handmade"
            subtitle="366 natural products, made in small batches in White River."
          />

          <FilterBar formats={formats} total={filtered.length} />

          {filtered.length === 0 ? (
            <div className="text-center py-32 px-6">
              <p className="text-lg text-muted">
                Nothing matches those filters.
              </p>
              <Link
                href="/shop"
                className="inline-block mt-4 text-forest underline"
              >
                Clear all filters
              </Link>
            </div>
          ) : (
            <div className="px-6 max-w-7xl mx-auto py-10 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
