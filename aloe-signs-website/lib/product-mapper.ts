import type { Product } from './data';

export function rowToProduct(row: any): Product {
  const features: string[] = (() => {
    const f = row.features;
    if (f === null || f === undefined) return [];
    if (Array.isArray(f)) return f;
    if (typeof f === 'string') {
      try {
        const parsed = JSON.parse(f);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  })();

  const pricingTiers = (() => {
    const pt = row.pricing_tiers;
    if (pt === null || pt === undefined) return undefined;
    if (typeof pt === 'string') {
      try {
        return JSON.parse(pt);
      } catch {
        return undefined;
      }
    }
    return pt;
  })();

  const variants = (() => {
    const v = row.variants;
    if (v === null || v === undefined) return undefined;
    if (typeof v === 'string') {
      try {
        return JSON.parse(v);
      } catch {
        return undefined;
      }
    }
    return v;
  })();

  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as string,
    description: row.description as string,
    size: row.size as string,
    price: Number(row.price),
    ...(row.original_price != null && { originalPrice: Number(row.original_price) }),
    ...(row.discount != null && { discount: Number(row.discount) }),
    image: row.image as string,
    features,
    inStock: Boolean(row.in_stock),
    ...(pricingTiers !== undefined && { pricingTiers }),
    ...(variants !== undefined && { variants }),
    ...(row.artwork_fee != null && { artworkFee: Number(row.artwork_fee) }),
  };
}

export function normalizeProductInput(p: any): Record<string, any> {
  const get = (camelKey: string, snakeKey: string) => p[camelKey] ?? p[snakeKey];

  const features = get('features', 'features');
  const pricingTiers = get('pricingTiers', 'pricing_tiers');
  const variants = get('variants', 'variants');

  return {
    id: get('id', 'id'),
    name: get('name', 'name'),
    category: get('category', 'category'),
    description: get('description', 'description'),
    size: get('size', 'size'),
    price: get('price', 'price'),
    original_price: get('originalPrice', 'original_price'),
    discount: get('discount', 'discount'),
    image: get('image', 'image'),
    features: features !== undefined ? JSON.stringify(features) : null,
    in_stock: get('inStock', 'in_stock'),
    pricing_tiers: pricingTiers !== undefined ? JSON.stringify(pricingTiers) : null,
    variants: variants !== undefined ? JSON.stringify(variants) : null,
    artwork_fee: get('artworkFee', 'artwork_fee'),
    sort_order: get('sortOrder', 'sort_order'),
  };
}