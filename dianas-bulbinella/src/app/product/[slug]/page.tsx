import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProduct, getAllProducts, relatedProducts } from '@/lib/catalog';
import { concernBySlug, rangeBySlug, DISCLAIMER } from '@/lib/nav';
import ProductGallery from '@/components/product/ProductGallery';
import ProductCard from '@/components/shop/ProductCard';
import ReviewsSection from '@/components/reviews/ReviewsSection';
import Stars from '@/components/reviews/Stars';
import { getApprovedReviews } from '@/lib/reviews';

type Params = { params: Promise<{ slug: string }> };

/** Reviews are approved after build, so product pages can't be frozen at build
 *  time or a newly approved review would never appear. Revalidate hourly. */
export const revalidate = 3600;

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Product not found' };
  const description = product.excerpt
    ? product.excerpt
    : 'A premium botanical skincare product from Diana’s Bulbinella, traditionally used in daily self-care routines.';
  return { title: product.title, description };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const allProducts = await getAllProducts();
  const product = allProducts.find((p) => p.slug === slug);
  if (!product) notFound();

  const concernSlug = product.concerns?.[0];
  const concernName = concernSlug ? concernBySlug(concernSlug)?.name : null;
  const truncatedTitle =
    product.title.length > 25 ? product.title.slice(0, 25) + '…' : product.title;

  // breadcrumb
  const breadcrumb = (
    <nav className="text-xs text-muted mb-3">
      <Link href="/shop" className="hover:text-forest transition-colors">
        Shop
      </Link>
      {concernName && (
        <>
          {' '}
          /{' '}
          <Link
            href={`/concern/${concernSlug}`}
            className="hover:text-forest transition-colors capitalize"
          >
            {concernName}
          </Link>
        </>
      )}{' '}
      / <span className="text-ink">{truncatedTitle}</span>
    </nav>
  );

  // title (+ star summary, only once the product actually has approved reviews)
  const titleElement = (
    <>
      <h1 className="text-3xl lg:text-4xl font-serif text-ink mb-2">{product.title}</h1>
      {product.ratingCount > 0 && (
        <a
          href="#reviews"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted hover:text-forest transition-colors"
        >
          <Stars rating={product.ratingAvg} size="md" />
          <span>
            {product.ratingAvg.toFixed(1)} · {product.ratingCount} review
            {product.ratingCount === 1 ? '' : 's'}
          </span>
        </a>
      )}
    </>
  );

  // chips (format + ranges, no size chip)
  const chips = (
    <div className="flex flex-wrap gap-2 mb-6">
      <span className="rounded-full bg-surface-2 px-3 py-1 text-xs capitalize">
        {product.format}
      </span>
      {product.ranges.map((rangeSlug) => (
        <Link
          key={rangeSlug}
          href={`/range/${rangeSlug}`}
          className="rounded-full border border-line px-3 py-1 text-xs capitalize hover:border-forest transition-colors"
        >
          {rangeBySlug(rangeSlug)?.name ?? rangeSlug}
        </Link>
      ))}
    </div>
  );

  // excerpt
  const excerpt = product.excerpt ? (
    <section className="mt-8">
      <h2 className="text-lg font-serif text-ink mb-2">About this product</h2>
      <p className="text-muted leading-relaxed">{product.excerpt}</p>
    </section>
  ) : null;

  // accordion
  const accordion = (
    <div className="mt-10 border-t border-line divide-y divide-line">
      <details className="py-4 group">
        <summary className="cursor-pointer text-ink font-medium text-sm list-none flex items-center justify-between">
          How to use
          <span className="transition-transform group-open:rotate-180 text-muted">▼</span>
        </summary>
        <p className="mt-2 text-muted text-sm leading-relaxed">
          Apply as part of your usual routine. Detailed usage guidance is printed on every label.
        </p>
      </details>
      <details className="py-4 group">
        <summary className="cursor-pointer text-ink font-medium text-sm list-none flex items-center justify-between">
          Ingredients
          <span className="transition-transform group-open:rotate-180 text-muted">▼</span>
        </summary>
        <p className="mt-2 text-muted text-sm leading-relaxed">
          Full INCI ingredient lists are being added with our new packaging. Ask us any time in the
          meanwhile.
        </p>
      </details>
      <details className="py-4 group">
        <summary className="cursor-pointer text-ink font-medium text-sm list-none flex items-center justify-between">
          Delivery &amp; dealers
          <span className="transition-transform group-open:rotate-180 text-muted">▼</span>
        </summary>
        <p className="mt-2 text-muted text-sm">
          Delivered nationwide, or collect from a dealer near you.{' '}
          <Link href="/dealers" className="underline hover:text-forest transition-colors">
            Find a dealer
          </Link>
        </p>
      </details>
    </div>
  );

  // disclaimer
  const disclaimerContent = (
    <div className="mt-8 rounded-2xl bg-amber-soft/50 border border-line p-5 text-xs leading-relaxed text-muted">
      {DISCLAIMER}
    </div>
  );

  const related = relatedProducts(product, allProducts, 4);
  const reviews = await getApprovedReviews(product.id);

  // Product schema. aggregateRating/review are emitted ONLY when real approved
  // reviews exist — never fabricate ratings (Google penalises it, and this is a
  // YMYL catalogue where trust signals are scrutinised).
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.excerpt || undefined,
    ...(product.ratingCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.ratingAvg,
        reviewCount: product.ratingCount,
        bestRating: 5,
        worstRating: 1,
      },
      review: reviews.slice(0, 5).map((r) => ({
        '@type': 'Review',
        reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
        author: { '@type': 'Person', name: r.authorName },
        datePublished: r.createdAt,
        ...(r.title && { name: r.title }),
        reviewBody: r.body,
      })),
    }),
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <ProductGallery
        product={product}
        breadcrumb={breadcrumb}
        title={titleElement}
        chips={chips}
        excerpt={excerpt}
        accordion={accordion}
        disclaimer={disclaimerContent}
      />

      <div className="mt-20">
        <ReviewsSection
          slug={product.slug}
          reviews={reviews}
          ratingAvg={product.ratingAvg}
          ratingCount={product.ratingCount}
        />
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-serif text-ink mb-6">Pairs well with</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((rp) => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
