import type { JSX } from "react";

interface SizeOption {
  size: number;
  variantId: string;
  stockQty: number;
  priceCents: number;
}

interface ColourGroup {
  colourName: string;
  colourHex: string;
  sizes: SizeOption[];
}

interface Props {
  groups: ColourGroup[];
  selected: string;
  onSelect: (colourName: string) => void;
}

export default function ColourSwatches({
  groups,
  selected,
  onSelect,
}: Props): JSX.Element {
  return (
    <div>
      {/* Colour label + selected name */}
      <div className="mb-3 flex items-baseline gap-x-2">
        <span className="text-xs uppercase tracking-widest text-muted">
          Colour
        </span>
        <span className="text-sm text-text">{selected}</span>
      </div>

      {/* Swatch group */}
      <div role="group" aria-label="Colour" className="flex flex-wrap gap-3">
        {groups.map((group) => {
          const allSoldOut = group.sizes.every((s) => s.stockQty === 0);
          const isSelected = selected === group.colourName;

          return (
            <button
              key={group.colourName}
              type="button"
              aria-pressed={isSelected}
              aria-label={`${group.colourName}${allSoldOut ? " (sold out)" : ""}`}
              title={`${group.colourName}${allSoldOut ? " (sold out)" : ""}`}
              onClick={() => onSelect(group.colourName)}
              className={`relative inline-flex size-9 items-center justify-center rounded-full border border-text/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                allSoldOut ? "opacity-40" : ""
              } ${
                isSelected
                  ? "ring-2 ring-accent ring-offset-2 ring-offset-canvas"
                  : ""
              }`}
              style={{ backgroundColor: group.colourHex }}
            >
              {allSoldOut && (
                <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
                  <span className="absolute left-1/2 top-1/2 h-px w-[141%] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-text/60" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}