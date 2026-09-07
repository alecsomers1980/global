"use client";

import type { Product } from "@/lib/catalog";
import { copyFor } from "@/lib/product-copy";
import { useSelectedVariant } from "./SelectedVariant";

/**
 * The wording on a product page, following the size the shopper has picked.
 *
 * Two components rather than one because the description sits above the buy
 * box and the rest sits below it, with the price and the add-to-cart button in
 * between. Both read the same selection and resolve through the same fallback.
 */

export function VariantSummary({ product }: { product: Product }) {
  const { selected } = useSelectedVariant();
  const copy = copyFor(product, selected);

  return <p className="mt-5 text-[17px] leading-relaxed text-ink-soft">{copy.summary}</p>;
}

export function VariantDetails({ product }: { product: Product }) {
  const { selected } = useSelectedVariant();
  const copy = copyFor(product, selected);

  return (
    <dl className="flex flex-col gap-6 border-t border-hairline pt-8">
      {copy.traditionalUse && (
        <Entry label="Traditional use">{copy.traditionalUse}</Entry>
      )}
      <Entry label="Ingredients">{copy.ingredients}</Entry>
      <Entry label="Directions">{copy.directions}</Entry>
      <Entry label="Storage">{copy.storage}</Entry>
    </dl>
  );
}

function Entry({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="mb-2 text-xs uppercase tracking-[0.18em] text-ink-mute">{label}</dt>
      <dd className="text-[15px] leading-relaxed text-ink-soft">{children}</dd>
    </div>
  );
}
