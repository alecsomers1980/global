import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import type { ProductWithVariants, SignatureType } from '@/lib/supabase/types';
import { formatZAR } from '@/lib/money';

interface SignatureShowcaseProps {
  products: ProductWithVariants[];
  /** teaser = homepage beat (max 3, "View the collection" CTA at the end);
      full = every product, used on the standalone /signature page. */
  variant: 'teaser' | 'full';
}

const TYPE_LABELS: Record<SignatureType, string> = {
  wildlife: 'Wildlife panel',
  hide: 'Game hide panel',
  floral: 'Floral panel',
};

export default function SignatureShowcase({ products, variant }: SignatureShowcaseProps) {
  const shown = variant === 'teaser' ? products.slice(0, 3) : products;

  return (
    <div className="bg-canvas py-20">
      <Reveal>
        {/*
          grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 -- three across on
          desktop, pairs on tablet, stacked on mobile. Same card pattern as
          ProductCard.tsx for visual consistency with the rest of the site.
        */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shown.map((product) => {
            const image = product.images.find((i) => i.colour_name === null) ?? product.images[0];
            return (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="group block bg-surface rounded-lg overflow-hidden border border-text/5 hover:border-accent transition-colors"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-canvas">
                  {image && (
                    <Image
                      src={image.url}
                      alt={image.alt || product.name}
                      fill
                      sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-4">
                  {product.signature_type && (
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">
                      {TYPE_LABELS[product.signature_type]}
                    </p>
                  )}
                  <h3 className="text-sm font-medium text-text mt-1">{product.name}</h3>
                  <p className="text-sm text-text mt-2">{formatZAR(product.base_price)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </Reveal>

      {variant === 'teaser' && (
        <div className="flex justify-center pt-12">
          <Link
            href="/signature"
            className="rounded-md border border-text/30 px-6 py-3 text-sm uppercase tracking-[0.15em] text-text transition-colors hover:border-text"
          >
            View the Signature Collection
          </Link>
        </div>
      )}
    </div>
  );
}
