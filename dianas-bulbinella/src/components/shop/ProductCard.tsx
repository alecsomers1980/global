import Image from "next/image";
import Link from "next/link";
import type { Product, Variant } from "@/lib/catalog";
import {
  formatZAR,
  defaultVariant,
  priceFrom,
  hasMultipleSizes,
} from "@/lib/catalog";
import WishlistButton from "@/components/shop/WishlistButton";
import QuickAddButton from "@/components/shop/QuickAddButton";
import Stars from "@/components/reviews/Stars";

interface ProductCardProps {
  product: Product;
  variant?: Variant;
}

export default function ProductCard({ product, variant }: ProductCardProps) {
  const displayVariant = variant ?? defaultVariant(product);
  const showFromPrice = !variant && hasMultipleSizes(product);
  const salePrice = displayVariant.salePrice;
  const displayPrice = salePrice ?? displayVariant.price;

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-square rounded-2xl bg-white border border-line overflow-hidden shadow-[0_4px_20px_-12px_rgba(20,37,26,0.15)] transition-all duration-500 group-hover:shadow-[0_16px_40px_-16px_rgba(20,37,26,0.28)] group-hover:border-amber/50 group-hover:-translate-y-1">
        <Image
          src={displayVariant.image}
          alt={product.title}
          fill
          sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {!showFromPrice && salePrice && (
          <span className="absolute top-3 left-3 bg-amber text-white text-[11px] font-medium rounded-full px-2.5 py-1">
            ON SALE
          </span>
        )}
        <WishlistButton productId={product.id} className="absolute top-2.5 right-2.5" />
        <QuickAddButton product={product} variant={displayVariant} />
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-medium line-clamp-2 group-hover:text-forest">
          {product.title}
        </h3>
        <p className="text-xs text-muted capitalize">
          {displayVariant.size} — {product.format}
        </p>
        {product.ratingCount > 0 && (
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <Stars rating={product.ratingAvg} size="sm" />
            <span>
              {product.ratingAvg.toFixed(1)} ({product.ratingCount})
            </span>
          </p>
        )}
        <p className="text-sm font-semibold">
          {showFromPrice ? (
            `From ${formatZAR(priceFrom(product))}`
          ) : salePrice ? (
            <>
              <span className="text-amber">{formatZAR(salePrice)}</span>{" "}
              <span className="text-muted line-through font-normal text-xs">
                {formatZAR(displayVariant.price)}
              </span>
            </>
          ) : (
            formatZAR(displayPrice)
          )}
        </p>
      </div>
    </Link>
  );
}
