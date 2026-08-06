import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getProductBySlug, getSiteSettings, listProducts } from '@/lib/queries/products';
import { CATEGORY_LABELS, CATEGORY_SLUGS } from '@/lib/supabase/types';
import { formatZAR } from '@/lib/money';
import ProductDetail from '@/components/product/ProductDetail';

export async function generateStaticParams() {
  const products = await listProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Not found' };
  }

  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage(
  props: { params: Promise<{ slug: string }> },
) {
  const { slug } = await props.params;

  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    getSiteSettings(),
  ]);

  if (!product) {
    notFound();
  }

  const freeDeliveryLabel = formatZAR(
    Number(settings.delivery_free_threshold),
  );
  const leadTime = settings.lead_time;

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-10 md:py-16">
      <nav aria-label="Breadcrumb" className="mb-8">
        <p className="text-xs text-muted flex flex-wrap items-center gap-1">
          <Link
            href="/range"
            className="text-muted hover:text-text transition-colors"
          >
            The Range
          </Link>
          <span>{'/'}</span>
          <Link
            href={`/range/${CATEGORY_SLUGS[product.category]}`}
            className="text-muted hover:text-text transition-colors"
          >
            {CATEGORY_LABELS[product.category]}
          </Link>
          <span>{'/'}</span>
          <span className="text-muted">{product.name}</span>
        </p>
      </nav>

      <ProductDetail
        product={product}
        leadTime={leadTime}
        freeDeliveryLabel={freeDeliveryLabel}
      />
    </div>
  );
}