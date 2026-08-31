"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { rands } from "@/lib/money";
import type { Product, Variant } from "@/lib/catalog";
import { useSelectedVariant } from "./SelectedVariant";

export function VariantSelector({ product }: { product: Product }) {
  // The chosen size lives above this component because the photograph in the
  // other column follows it too.
  const { selected, select } = useSelectedVariant();
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);

  if (!selected) return null;

  // Takes the size as an argument rather than closing over it: the guard above
  // narrows `selected` for the JSX below, but not inside a function body.
  function addToCart(variant: Variant) {
    add({
      variantId: variant.id,
      productSlug: product.slug,
      name: product.name,
      sizeLabel: variant.sizeLabel,
      priceRetail: variant.priceRetail,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      {product.variants.length > 1 && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-xs uppercase tracking-[0.18em] text-ink-mute">Size</legend>
          <div className="flex flex-wrap gap-3">
            {product.variants.map((v) => {
              const active = v.id === selected.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => select(v.id)}
                  aria-pressed={active}
                  className={`min-h-[48px] border px-5 text-sm transition-colors ${
                    active
                      ? "border-transparent text-brand-ink"
                      : "border-hairline text-ink hover:border-brand"
                  }`}
                  style={active ? { backgroundColor: product.accentHex } : undefined}
                >
                  {v.sizeLabel}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <p className="font-display text-4xl text-ink">{rands(selected.priceRetail)}</p>

      <button
        type="button"
        onClick={() => addToCart(selected)}
        className="flex min-h-[54px] w-full items-center justify-center bg-brand px-9 text-sm uppercase tracking-[0.06em] text-brand-ink hover:bg-brand-deep sm:w-auto"
      >
        {added ? "Added to cart" : "Add to cart"}
      </button>

      {selected.barcode && (
        <p className="text-[13px] text-ink-mute">Barcode {selected.barcode}</p>
      )}
    </div>
  );
}
