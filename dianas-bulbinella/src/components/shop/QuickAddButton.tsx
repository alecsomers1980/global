"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import type { Product, Variant } from "@/lib/catalog";
import { hasMultipleSizes } from "@/lib/catalog";

/**
 * Quick-add pill overlaid on a product card. Sits inside the card <Link>, so
 * clicks must not navigate (same rule as WishlistButton). Single-size products
 * add straight to the basket; multi-size products send you to the page to choose.
 */
export default function QuickAddButton({
  product,
  variant,
}: {
  product: Product;
  variant: Variant;
}) {
  const router = useRouter();
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const multi = hasMultipleSizes(product);
  const inStock = variant.stock === "instock";

  // Out of stock: let the card behave as a plain link, no pill.
  if (!inStock) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (multi) {
      router.push(`/product/${product.slug}`);
      return;
    }
    add(
      {
        slug: product.slug,
        variantId: variant.id,
        title: product.title,
        price: variant.price,
        salePrice: variant.salePrice,
        image: variant.image,
        size: variant.size,
      },
      1,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="absolute inset-x-2 bottom-2 opacity-100 translate-y-0 transition-all duration-300 lg:opacity-0 lg:translate-y-2 lg:group-hover:opacity-100 lg:group-hover:translate-y-0">
      <button
        type="button"
        onClick={handleClick}
        className="w-full rounded-full bg-forest/95 text-paper text-xs font-semibold py-2.5 backdrop-blur-sm shadow-md transition-colors hover:bg-moss"
      >
        {added ? "✓ Added" : multi ? "Choose options" : "Add to basket"}
      </button>
    </div>
  );
}
