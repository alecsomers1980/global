"use client";

import Image from "next/image";
import type { Product } from "@/lib/catalog";
import { imageSrc } from "@/lib/product-image";
import { useSelectedVariant } from "./SelectedVariant";

/**
 * The product photograph, which follows the chosen size.
 *
 * A size only overrides the picture when it actually has one of its own — the
 * scented soaps and balms do, the 100g/250g pairs of the same powder do not,
 * and swapping a photo for an identical one would read as a flicker.
 */
export function ProductMedia({ product }: { product: Product }) {
  const { selected } = useSelectedVariant();
  const src = selected?.imageUrl ?? product.heroImage;

  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-surface">
      {src ? (
        <Image
          // Keyed on the source so a size change swaps the element rather than
          // leaving the previous photo up while the new one decodes.
          key={src}
          src={imageSrc(src, 1600)}
          alt={
            selected?.imageUrl
              ? `${product.name}, ${selected.sizeLabel}`
              : `${product.name} by Rehoboth Herbal Co.`
          }
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4">
          <Image
            src="/brand/emblem-dark.png"
            alt=""
            width={260}
            height={247}
            className="h-20 w-auto opacity-25"
          />
          <p className="text-[13px] text-ink-mute">Photograph to come</p>
        </div>
      )}
      <span
        className="absolute bottom-0 left-0 h-1.5 w-full"
        style={{ backgroundColor: product.accentHex }}
      />
    </div>
  );
}
