import { listProducts, listColours } from '@/lib/queries/products';
import RangeFilters from '@/components/shop/RangeFilters';
import ProductCard from '@/components/shop/ProductCard';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Range',
  description:
    'Handcrafted vellies, genuine leather, sizes 4 to 15. Wild by Nature.',
};

export default async function Page(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await props.searchParams;

  const colour = typeof sp.colour === 'string' ? sp.colour : undefined;
  let size: number | undefined;
  if (typeof sp.size === 'string') {
    const parsed = Number(sp.size);
    if (!isNaN(parsed) && parsed >= 4 && parsed <= 15) {
      size = parsed;
    }
  }
  const signatureOnly = sp.signature === '1';

  const filter = {
    ...(colour && { colour }),
    ...(size !== undefined && { size }),
    ...(signatureOnly && { signatureOnly: true }),
  };

  const [products, colours] = await Promise.all([
    listProducts(filter),
    listColours(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
      <div className="mb-8 md:mb-12">
        <h1 className="display rule-accent text-4xl sm:text-6xl">THE RANGE</h1>
        <p className="mt-2 text-muted">
          Handcrafted in South Africa. Sizes 4 to 15.
        </p>
      </div>

      <RangeFilters
        colours={colours}
        activeColour={colour}
        activeSize={size}
        signatureOnly={signatureOnly}
        resultCount={products.length}
      />

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center text-text mt-16">
          <p>No vellies match those filters.</p>
          <Link
            href="/range"
            className="text-sm text-text underline underline-offset-4 mt-2 inline-block"
          >
            Clear all filters
          </Link>
        </div>
      )}
    </div>
  );
}