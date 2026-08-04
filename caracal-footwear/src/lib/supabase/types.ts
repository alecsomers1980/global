export type ProductCategory = 'chukka' | 'low_cut' | 'chelsea' | 'hiker';
export type SignatureType = 'wildlife' | 'hide' | 'floral';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  chukka: 'Chukka',
  low_cut: 'Low-Cut',
  chelsea: 'Chelsea',
  hiker: 'Hiker',
};

/** URL segment <-> enum value. The enum is snake_case, URLs are kebab-case. */
export const CATEGORY_SLUGS: Record<ProductCategory, string> = {
  chukka: 'chukka',
  low_cut: 'low-cut',
  chelsea: 'chelsea',
  hiker: 'hiker',
};

export const ALL_CATEGORIES: ProductCategory[] = [
  'chukka',
  'low_cut',
  'chelsea',
  'hiker',
];

/** Every size Caracal makes, per the flyer: 4 (ladies) to 15 (mens). */
export const ALL_SIZES: number[] = Array.from({ length: 12 }, (_, i) => i + 4);

export function categoryFromSlug(slug: string): ProductCategory | null {
  const entry = Object.entries(CATEGORY_SLUGS).find(([, s]) => s === slug);
  return entry ? (entry[0] as ProductCategory) : null;
}

export interface Product {
  id: string;
  slug: string;
  style_no: string | null;
  name: string;
  description: string;
  category: ProductCategory;
  is_signature: boolean;
  signature_type: SignatureType | null;
  /** integer cents */
  base_price: number;
  featured: boolean;
  active: boolean;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  colour_name: string;
  colour_hex: string;
  size: number;
  sku: string | null;
  stock_qty: number;
  /** integer cents; overrides Product.base_price when set */
  price_override: number | null;
  active: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  /** null means the image applies to every colour */
  colour_name: string | null;
  url: string;
  alt: string;
  sort_order: number;
}

export interface ProductWithVariants extends Product {
  variants: ProductVariant[];
  images: ProductImage[];
}
