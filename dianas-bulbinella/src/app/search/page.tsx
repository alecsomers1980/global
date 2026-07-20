import type { Metadata } from 'next';
import { searchProducts } from '@/lib/catalog';
import SearchBox from '@/components/shop/SearchBox';
import ProductCard from '@/components/shop/ProductCard';
import AuroraSquiggle from '@/components/motion/AuroraSquiggle';
import PageBanner from '@/components/site/PageBanner';

export const metadata: Metadata = {
  title: 'Search',
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q ?? '';
  const results = query ? await searchProducts(query) : [];

  return (
    <div className="relative">
      <AuroraSquiggle variant="page" />
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <PageBanner video="/videos/botanical-banner.mp4"
            eyebrow="SEARCH"
            title="Find your"
            accent="favourite"
            subtitle="Search all 366 products by name, category or concern."
          />
          <SearchBox initialQ={query} />
          {query && (
            <div className="mt-8">
              <p className="text-sm text-muted mb-6">
                {results.length} result{results.length !== 1 && 's'} for &ldquo;{query}&rdquo;
              </p>
              {results.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {results.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <p className="text-muted">Nothing matched your search. Try different keywords.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
