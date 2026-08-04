import type { JSX } from "react";
import Link from "next/link";

interface SizeOption {
  size: number;
  variantId: string;
  stockQty: number;
  priceCents: number;
}

interface Props {
  sizes: SizeOption[];
  selected: number | null;
  onSelect: (size: number) => void;
}

export default function SizeSelector({
  sizes,
  selected,
  onSelect,
}: Props): JSX.Element {
  // Sort ascending (no mutation of prop)
  const sorted = [...sizes].sort((a, b) => a.size - b.size);

  const allSoldOut = sorted.every((s) => s.stockQty === 0);

  return (
    <div>
      {/* Header row */}
      <div className="flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-widest text-muted">
          Size
        </span>
        <Link
          href="/size-guide"
          className="text-xs text-text underline underline-offset-4"
        >
          Size guide
        </Link>
      </div>

      {/* Size grid */}
      {/* Fixed-width chips, not a stretched grid -- a full-width size button
          reads as a primary action rather than a compact size choice. */}
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Size">
        {sorted.map((sizeOption) => {
          const { size, stockQty } = sizeOption;
          const isSelected = selected === size;
          const isSoldOut = stockQty === 0;
          const isLowStock = stockQty >= 1 && stockQty <= 3;

          // Base classes
          let classes =
            "relative flex h-11 w-12 shrink-0 items-center justify-center rounded border font-medium text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";

          if (isSoldOut) {
            classes += " cursor-not-allowed line-through text-muted/50 border-text/10";
          } else if (isSelected) {
            classes += " bg-accent text-canvas border-accent";
          } else {
            // available, not selected
            classes += " border-text/20 text-text hover:border-text/50";
          }

          return (
            <button
              key={size}
              type="button"
              disabled={isSoldOut}
              onClick={() => onSelect(size)}
              aria-label={
                isSoldOut
                  ? `Size ${size}, sold out`
                  : isLowStock
                    ? `Size ${size}, low stock`
                    : `Size ${size}`
              }
              className={classes}
            >
              {size}
              {isLowStock && (
                <span className="absolute right-1 top-1 z-10 size-1.5 rounded-full bg-accent" />
              )}
            </button>
          );
        })}
      </div>

      {/* Message when every size is sold out */}
      {allSoldOut && (
        <p className="mt-2 text-sm text-muted">
          This colour is sold out. Try another colour.
        </p>
      )}
    </div>
  );
}