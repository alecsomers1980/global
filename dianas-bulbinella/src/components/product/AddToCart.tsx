'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/store/cart';
import type { Product, Variant } from '@/lib/catalog';

interface AddToCartProps {
  product: Product;
  onVariantChange?: (variant: Variant) => void;
}

export default function AddToCart({ product, onVariantChange }: AddToCartProps) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? '');

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];
  const inStock = selectedVariant?.stock === 'instock';
  const { add } = useCart();

  useEffect(() => {
    if (selectedVariant && onVariantChange) {
      onVariantChange(selectedVariant);
    }
    // intentionally run only on mount to notify parent of initial variant
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVariantSelect = (variant: Variant) => {
    setSelectedVariantId(variant.id);
    onVariantChange?.(variant);
  };

  const handleAdd = () => {
    if (!inStock || !selectedVariant) return;
    add(
      {
        slug: product.slug,
        variantId: selectedVariant.id,
        title: product.title,
        price: selectedVariant.price,
        salePrice: selectedVariant.salePrice,
        image: selectedVariant.image,
        size: selectedVariant.size,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="flex flex-col gap-3">
      {product.variants.length > 1 && (
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Size">
          {product.variants.map((variant) => {
            const isSelected = variant.id === selectedVariantId;
            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => handleVariantSelect(variant)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-forest text-paper'
                    : 'border border-line text-ink hover:bg-surface-2'
                }`}
                aria-checked={isSelected}
                role="radio"
              >
                {variant.size}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center border border-line rounded-full bg-surface-2">
          <button
            type="button"
            disabled={!inStock || qty <= 1}
            onClick={() => setQty((prev) => Math.max(1, prev - 1))}
            className="px-3 py-2 text-ink disabled:text-muted/50 transition-colors"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="px-2 text-sm text-ink tabular-nums min-w-[2ch] text-center">
            {qty}
          </span>
          <button
            type="button"
            disabled={!inStock || qty >= 99}
            onClick={() => setQty((prev) => Math.min(99, prev + 1))}
            className="px-3 py-2 text-ink disabled:text-muted/50 transition-colors"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <button
          onClick={handleAdd}
          disabled={!inStock}
          className={`rounded-full px-6 py-3 text-sm font-medium transition-colors w-full flex items-center justify-center ${
            inStock
              ? added
                ? 'bg-forest/90 text-paper'
                : 'bg-forest text-paper hover:bg-moss'
              : 'bg-surface-2 text-muted cursor-not-allowed'
          }`}
        >
          {inStock ? (added ? '✓ Added' : 'Add to basket') : 'Out of stock'}
        </button>
      </div>
    </div>
  );
}
