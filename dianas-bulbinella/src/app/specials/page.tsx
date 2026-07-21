import { Metadata } from "next";
import { getSpecials } from "@/lib/catalog";
import ProductCard from "@/components/shop/ProductCard";
import AuroraSquiggle from "@/components/motion/AuroraSquiggle";
import PageBanner from "@/components/site/PageBanner";

export const metadata: Metadata = {
  title: "Monthly Specials",
};

export default async function SpecialsPage() {
  const specials = await getSpecials();

  return (
    <div className="relative">
      <AuroraSquiggle variant="page" />
      <div className="relative z-10">
        <main className="min-h-screen">
          <PageBanner
            video="/videos/flowers-banner.mp4"
            eyebrow="JULY ONLY · WHILE STOCKS LAST"
            title="This month's"
            accent="specials"
            subtitle="New specials every month — scheduled by Diana herself. Prices include the discount."
          />
          <div className="px-6 max-w-7xl mx-auto mt-[-1px] mb-10 pt-6">
            <p className="text-sm text-paper/60 bg-forest p-4 rounded-t-2xl border-t border-amber-soft/20">
              Prices shown include the discount. While stocks last.
            </p>
          </div>
          {specials.length === 0 ? (
            <div className="text-center py-24 px-6">
              <p className="text-lg text-muted">
                No specials this month. Check back soon.
              </p>
            </div>
          ) : (
            <div className="px-6 max-w-7xl mx-auto py-10 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
              {specials.map((special) => (
                <ProductCard
                  key={`${special.product.id}-${special.variant.id}`}
                  product={special.product}
                  variant={special.variant}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
