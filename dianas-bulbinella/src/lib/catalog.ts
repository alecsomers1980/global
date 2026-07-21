import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";

/** One size of a product. `salePrice`/`specialName` are derived live from the
 *  active_special_prices view (date-driven specials), per variant. */
export type Variant = {
  id: string;
  size: string;
  price: number;
  salePrice: number | null;
  specialName: string | null;
  stock: string;
  image: string;
  sku: string;
  sortOrder: number;
};

/** Product shape — the parent/group row. Always has at least one variant;
 *  products with only one size still carry a single-item `variants` array,
 *  so consumers never need to branch on "simple vs variable". */
export type Product = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  format: string;
  categories: string[];
  concerns: string[];
  ranges: string[];
  variants: Variant[];
  /** Average of APPROVED reviews, 0 when none. Denormalised on products by the
   *  reviews trigger (migration 0010) so a grid of cards costs no extra query. */
  ratingAvg: number;
  ratingCount: number;
};

/** One on-sale size, paired with its parent product. `getSpecials()` returns
 *  one of these per on-sale variant — a product can appear once per size
 *  that's currently on special, or not at all. */
export type SpecialListing = {
  product: Product;
  variant: Variant;
};

type ProductRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  format: string;
  categories: string[];
  concerns: string[];
  ranges: string[];
  rating_avg: number | string | null;
  rating_count: number | null;
  product_variants: {
    id: string;
    size: string;
    price: number | string;
    stock: string;
    image: string;
    sku: string;
    sort_order: number;
  }[];
};

/** Default variant to show before a size is picked — lowest sort_order. */
export function defaultVariant(p: Product): Variant {
  return p.variants[0];
}

/** Effective (sale-aware) price of the cheapest variant — for "From R__" display. */
export function priceFrom(p: Product): number {
  return Math.min(...p.variants.map((v) => v.salePrice ?? v.price));
}

export function hasMultipleSizes(p: Product): boolean {
  return p.variants.length > 1;
}

/** One fetch per request (React cache dedupes across all catalog.* calls on a
 *  page). Products joined with their variants and today's active special prices. */
const fetchAll = cache(async (): Promise<Product[]> => {
  // Not configured yet (no Supabase env) — degrade to empty rather than crash.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  const supabase = createPublicClient();
  const [productsRes, pricesRes] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, slug, title, excerpt, format, categories, concerns, ranges, rating_avg, rating_count, product_variants(id, size, price, stock, image, sku, sort_order)"
      )
      .eq("active", true)
      .order("title"),
    supabase.from("active_special_prices").select("variant_id, special_price, special_name"),
  ]);

  if (productsRes.error) {
    console.error("catalog: products query failed", productsRes.error.message);
    return [];
  }

  const priceMap = new Map<string, { price: number; name: string }>(
    (pricesRes.data ?? []).map((r) => [
      r.variant_id,
      { price: Number(r.special_price), name: r.special_name },
    ])
  );

  return (productsRes.data as ProductRow[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? "",
    format: row.format,
    categories: row.categories ?? [],
    concerns: row.concerns ?? [],
    ranges: row.ranges ?? [],
    ratingAvg: Number(row.rating_avg ?? 0),
    ratingCount: row.rating_count ?? 0,
    variants: (row.product_variants ?? [])
      .map((v) => {
        const special = priceMap.get(v.id);
        return {
          id: v.id,
          size: v.size,
          price: Number(v.price),
          salePrice: special ? special.price : null,
          specialName: special ? special.name : null,
          stock: v.stock,
          image: v.image,
          sku: v.sku,
          sortOrder: v.sort_order,
        };
      })
      .sort((a, b) => a.sortOrder - b.sortOrder),
  }));
});

export async function getAllProducts(): Promise<Product[]> {
  return fetchAll();
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return (await fetchAll()).find((p) => p.slug === slug);
}

export async function getByConcern(slug: string): Promise<Product[]> {
  return (await fetchAll()).filter((p) => p.concerns.includes(slug));
}

export async function getByRange(slug: string): Promise<Product[]> {
  return (await fetchAll()).filter((p) => p.ranges.includes(slug));
}

export async function getSpecials(): Promise<SpecialListing[]> {
  const all = await fetchAll();
  const listings: SpecialListing[] = [];
  for (const product of all) {
    for (const variant of product.variants) {
      if (variant.salePrice !== null) listings.push({ product, variant });
    }
  }
  return listings;
}

export async function getFormats(): Promise<string[]> {
  return [...new Set((await fetchAll()).map((p) => p.format))].filter(Boolean).sort();
}

export async function searchProducts(q: string): Promise<Product[]> {
  const t = q.trim().toLowerCase();
  if (!t) return [];
  return (await fetchAll()).filter(
    (p) =>
      p.title.toLowerCase().includes(t) ||
      p.categories.some((c) => c.toLowerCase().includes(t)) ||
      p.excerpt.toLowerCase().includes(t)
  );
}

/** Same range first, then same concern, then same format. Pure — pass the full
 *  list from a prior fetch to avoid another round-trip. */
export function relatedProducts(p: Product, all: Product[], n = 4): Product[] {
  const scored = all
    .filter((x) => x.slug !== p.slug)
    .map((x) => {
      let s = 0;
      if (x.ranges.some((r) => p.ranges.includes(r))) s += 3;
      if (x.concerns.some((c) => p.concerns.includes(c))) s += 2;
      if (x.format === p.format) s += 1;
      return { x, s };
    })
    .filter((e) => e.s > 0)
    .sort((a, b) => b.s - a.s);
  return scored.slice(0, n).map((e) => e.x);
}

export function formatZAR(v: number): string {
  return `R${v.toLocaleString("en-ZA", {
    minimumFractionDigits: v % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}
