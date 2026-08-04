import Link from 'next/link';
import Image from 'next/image';
import { ProductWithVariants } from '@/lib/supabase/types';
import { CATEGORY_LABELS } from '@/lib/supabase/types';
import { formatZAR } from '@/lib/money';
import { groupVariants } from '@/lib/catalogue';

interface ProductCardProps {
  product: ProductWithVariants;
}

export default function ProductCard({ product }: ProductCardProps) {
  const hasImages = product.images.length > 0;
  const firstImage = hasImages
    ? product.images.find((i) => i.colour_name === null) ?? product.images[0]
    : undefined;
  const imageAlt = firstImage?.alt || `${product.name} vellie`;

  const colourGroups = groupVariants(product.variants, product.base_price);
  const displayedDots = colourGroups.slice(0, 6);
  const remainingCount = colourGroups.length - 6;
  const colourNamesList = colourGroups.map((g) => g.colourName).join(', ');

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block bg-surface rounded-lg overflow-hidden border border-text/5 hover:border-accent transition-colors"
    >
      {/* Image area */}
      <div className="aspect-[4/5] relative overflow-hidden bg-canvas">
        {hasImages ? (
          <Image
            src={firstImage!.url}
            alt={imageAlt}
            fill
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-canvas">
            <svg
              className="h-12 w-12 text-accent/30"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 48 48"
            >
              <circle cx="24" cy="24" r="20" />
              <path d="M14 20 L8 4 L20 14 Z" />
              <path d="M28 14 L40 4 L34 20 Z" />
            </svg>
            <span className="mt-2 text-xs text-muted">{product.name}</span>
          </div>
        )}

        {product.is_signature && (
          <div className="absolute top-2 left-2 bg-canvas/80 text-text text-[10px] uppercase tracking-[0.2em] px-2 py-1 border border-accent/40">
            Signature
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-text">{product.name}</h3>
        <p className="text-xs text-muted mt-0.5">{CATEGORY_LABELS[product.category]}</p>
        <p className="text-sm text-text mt-2">{formatZAR(product.base_price)}</p>

        {/* Colour dots (visually hidden, info via aria) */}
        {colourGroups.length > 0 && (
          <>
            <div className="mt-2 flex items-center gap-1" aria-hidden="true">
              {displayedDots.map((group) => (
                <span
                  key={group.colourName}
                  style={{ backgroundColor: group.colourHex }}
                  className="size-3 rounded-full border border-text/20"
                />
              ))}
              {remainingCount > 0 && (
                <span className="text-[10px] text-muted">{`+${remainingCount}`}</span>
              )}
            </div>
            <span className="sr-only">{colourNamesList ? `Colours: ${colourNamesList}` : ''}</span>
          </>
        )}
      </div>
    </Link>
  );
}