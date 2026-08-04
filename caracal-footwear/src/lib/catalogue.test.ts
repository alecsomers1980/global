import { describe, it, expect } from 'vitest';
import { groupVariants, imagesForColour } from './catalogue';
import type { ProductVariant, ProductImage } from './supabase/types';

function v(
  colour: string,
  hex: string,
  size: number,
  over: Partial<ProductVariant> = {},
): ProductVariant {
  return {
    id: `${colour}-${size}`,
    product_id: 'p1',
    colour_name: colour,
    colour_hex: hex,
    size,
    sku: null,
    stock_qty: 5,
    price_override: null,
    active: true,
    ...over,
  };
}

describe('groupVariants', () => {
  it('groups flat rows by colour', () => {
    const groups = groupVariants([
      v('Tan', '#B5763A', 9),
      v('Tan', '#B5763A', 10),
      v('Black', '#14110F', 9),
    ]);
    expect(groups).toHaveLength(2);
    expect(groups.map((g) => g.colourName).sort()).toEqual(['Black', 'Tan']);
  });

  it('carries the colour hex through', () => {
    const groups = groupVariants([v('Tan', '#B5763A', 9)]);
    expect(groups[0].colourHex).toBe('#B5763A');
  });

  it('sorts sizes ascending within a colour', () => {
    const groups = groupVariants([
      v('Tan', '#B5763A', 12),
      v('Tan', '#B5763A', 4),
      v('Tan', '#B5763A', 9),
    ]);
    expect(groups[0].sizes.map((s) => s.size)).toEqual([4, 9, 12]);
  });

  it('prefers price_override over the fallback price', () => {
    const groups = groupVariants(
      [v('Tan', '#B5763A', 9, { price_override: 69900 })],
      55000,
    );
    expect(groups[0].sizes[0].priceCents).toBe(69900);
  });

  it('falls back to the base price when no override is set', () => {
    const groups = groupVariants([v('Tan', '#B5763A', 9)], 55000);
    expect(groups[0].sizes[0].priceCents).toBe(55000);
  });

  it('defaults the fallback price to zero when not supplied', () => {
    const groups = groupVariants([v('Tan', '#B5763A', 9)]);
    expect(groups[0].sizes[0].priceCents).toBe(0);
  });

  it('exposes variant id and stock on each size', () => {
    const groups = groupVariants([v('Tan', '#B5763A', 9, { stock_qty: 7 })]);
    expect(groups[0].sizes[0].variantId).toBe('Tan-9');
    expect(groups[0].sizes[0].stockQty).toBe(7);
  });

  it('excludes inactive variants', () => {
    const groups = groupVariants([v('Tan', '#B5763A', 9, { active: false })]);
    expect(groups).toHaveLength(0);
  });

  it('returns an empty array for no variants', () => {
    expect(groupVariants([])).toEqual([]);
  });
});

describe('imagesForColour', () => {
  const images: ProductImage[] = [
    { id: '1', product_id: 'p1', colour_name: null, url: 'a.jpg', alt: '', sort_order: 0 },
    { id: '2', product_id: 'p1', colour_name: 'Tan', url: 'b.jpg', alt: '', sort_order: 1 },
    { id: '3', product_id: 'p1', colour_name: 'Black', url: 'c.jpg', alt: '', sort_order: 2 },
  ];

  it('returns colour-specific images plus the shared ones', () => {
    expect(imagesForColour(images, 'Tan').map((i) => i.url)).toEqual([
      'a.jpg',
      'b.jpg',
    ]);
  });

  it('returns only shared images for an unknown colour', () => {
    expect(imagesForColour(images, 'Red').map((i) => i.url)).toEqual(['a.jpg']);
  });

  it('returns every image when no colour is selected', () => {
    expect(imagesForColour(images, null)).toHaveLength(3);
  });

  it('orders by sort_order', () => {
    const shuffled = [images[2], images[0], images[1]];
    expect(imagesForColour(shuffled, 'Tan').map((i) => i.sort_order)).toEqual([
      0, 1,
    ]);
  });

  it('returns an empty array when there are no images at all', () => {
    expect(imagesForColour([], 'Tan')).toEqual([]);
  });
});
