import { listProducts, listColours } from '@/lib/queries/products';
import RangeFilters from '@/components/shop/RangeFilters';
import ProductCard from '@/components/shop/ProductCard';
import { categoryFromSlug, CATEGORY_LABELS } from '@/lib/supabase/types';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

type Params = Promise<{ category: string }>;

export async function generateMetadata(props: {
  params: Params;
}): Promise<Metadata> {
  const { category } = await props.params;
  const cat = categoryFromSlug(category);
  if (!cat) {
    return { title: 'Vellies | Caracal Footwear' };
  }
  return {
    title: `${CATEGORY_LABELS[cat]} Vellies`,
  };
}

export async function generateStaticParams() {
  return [
    { category: 'chukka' },
    { category: 'low-cut' },
    { category: 'chelsea' },
    { category: 'hiker' },
  ];
}

export default async function Page(props: {
  params: Params;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { category: slug } = await props.params;
  const cat = categoryFromSlug(slug);
  if (!cat) notFound();

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

  const [products, colours] = await Promise.all([
    listProducts({
      category: cat,
      ...(colour && { colour }),
      ...(size !== undefined && { size }),
      ...(signatureOnly && { signatureOnly: true }),
    }),
    listColours(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
      {/* Breadcrumb */}
      <div className="text-xs text-muted mb-4 flex items-center gap-1">
        <Link href="/range" className="hover:text-text transition-colors">
          The Range
        </Link>
        <span>/</span>
        <span>{CATEGORY_LABELS[cat]}</span>
      </div>

      <div className="mb-8 md:mb-12">
        <h1 className="display rule-accent text-4xl sm:text-6xl">
          {CATEGORY_LABELS[cat].toUpperCase()}
        </h1>
        <p className="mt-2 text-muted">
          Handcrafted in South Africa. Sizes 4 to 15.
        </p>
      </div>

      <RangeFilters
        colours={colours}
        activeCategory={cat}
        activeColour={colour}
        activeSize={size}
        signatureOnly={signatureOnly}
        lockCategory
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