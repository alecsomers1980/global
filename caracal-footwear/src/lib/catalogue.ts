import type { ProductVariant, ProductImage } from './supabase/types';

export interface SizeOption {
  size: number;
  variantId: string;
  stockQty: number;
  priceCents: number;
}

export interface ColourGroup {
  colourName: string;
  colourHex: string;
  sizes: SizeOption[];
}

export function groupVariants(
  variants: ProductVariant[],
  fallbackPriceCents = 0,
): ColourGroup[] {
  const activeVariants = variants.filter((v) => v.active);

  // Group by colour_name using a Map to preserve insertion order
  const map = new Map<string, ProductVariant[]>();
  for (const v of activeVariants) {
    const list = map.get(v.colour_name);
    if (list) {
      list.push(v);
    } else {
      map.set(v.colour_name, [v]);
    }
  }

  const groups: ColourGroup[] = [];
  for (const [colourName, vs] of map) {
    // All variants in a group share the same colour_hex, pick from first
    const colourHex = vs[0].colour_hex;

    // Sort sizes ascending
    vs.sort((a, b) => a.size - b.size);

    const sizes: SizeOption[] = vs.map((v) => ({
      size: v.size,
      variantId: v.id,
      stockQty: v.stock_qty,
      priceCents: v.price_override ?? fallbackPriceCents,
    }));

    groups.push({ colourName, colourHex, sizes });
  }

  return groups;
}

export function imagesForColour(
  images: ProductImage[],
  colourName: string | null,
): ProductImage[] {
  // null = return every image; otherwise return shared images plus colour-specific ones
  const filtered =
    colourName === null
      ? images
      : images.filter(
          (img) => img.colour_name === null || img.colour_name === colourName,
        );

  // Return a new sorted array – never mutate the input
  return [...filtered].sort((a, b) => a.sort_order - b.sort_order);
}