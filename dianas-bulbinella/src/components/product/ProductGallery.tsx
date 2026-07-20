'use client';

import { useState, type ReactNode } from 'react';
import Image from 'next/image';
import { formatZAR, type Product, type Variant } from '@/lib/catalog';
import AddToCart from '@/components/product/AddToCart';

type Props = {
  product: Product;
  breadcrumb: ReactNode;
  title: ReactNode;
  chips: ReactNode;
  excerpt: ReactNode;
  accordion: ReactNode;
  disclaimer: ReactNode;
};

export default function ProductGallery({
  product,
  breadcrumb,
  title,
  chips,
  excerpt,
  accordion,
  disclaimer,
}: Props) {
  const [selectedVariant, setSelectedVariant] = useState<Variant>(product.variants[0]);

  const hasSale = !!(
    selectedVariant.salePrice && selectedVariant.salePrice < selectedVariant.price
  );
  const saleDiff = hasSale ? selectedVariant.price - selectedVariant.salePrice! : 0;

  return (
    <div className="grid lg:grid-cols-2 gap-14">
      {/* Image column */}
      <div className="relative aspect-square rounded-3xl bg-white border border-line overflow-hidden self-start lg:sticky lg:top-24">
        <Image
          src={selectedVariant.image}
          alt={product.title}
          fill
          sizes="(max-width:1024px) 100vw, 50vw"
          className="object-contain p-8"
          priority
        />
        {hasSale && (
          <span className="absolute top-4 left-4 bg-amber text-paper text-xs font-semibold px-3 py-1 rounded-full">
            ON SALE
          </span>
        )}
      </div>

      {/* Details column */}
      <div>
        {breadcrumb}
        {title}
        {chips}

        {/* Price block */}
        <div className="mb-8">
          {hasSale ? (
            <>
              <span className="text-3xl font-semibold text-amber-deep">
                {formatZAR(selectedVariant.salePrice!)}
              </span>
              <span className="ml-3 text-xl line-through text-muted">
                {formatZAR(selectedVariant.price)}
              </span>
              <p className="text-sm text-amber-deep mt-1">
                You save {formatZAR(saleDiff)}
              </p>
            </>
          ) : (
            <span className="text-3xl font-semibold text-ink">
              {formatZAR(selectedVariant.price)}
            </span>
          )}
        </div>

        <AddToCart product={product} onVariantChange={setSelectedVariant} />

        {/* Assurance row — reassurance at the point of decision */}
        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
          {[
            "Cruelty-free always",
            "Handmade in South Africa",
            "Delivered nationwide",
            "Secure checkout",
          ].map((item) => (
            <li key={item} className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-forest shrink-0" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {item}
            </li>
          ))}
        </ul>

        {excerpt}
        {accordion}
        {disclaimer}
      </div>
    </div>
  );
}
