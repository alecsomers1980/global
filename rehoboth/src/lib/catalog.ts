import { PRODUCTS, type SeedProduct } from "./catalog-data";

export type Variant = {
  id: string;
  format: string;
  sizeLabel: string;
  barcode: string | null;
  priceRetail: number;
  stock: number;
};

/**
 * Products the client has not photographed. Every artemisia shot in the
 * library is ANNUA A3 (verified by reading the bottle labels), and tinctures
 * were never shot. These render a brand panel rather than borrowing another
 * product's bottle — showing an A3 bottle on the Afra page would misrepresent
 * what is being sold.
 */
const NO_PHOTOGRAPH = new Set(["artemisia-afra", "tinctures"]);

export type Product = {
  id: string;
  slug: string;
  name: string;
  botanicalName: string | null;
  accentHex: string;
  summary: string;
  traditionalUse: string | null;
  ingredients: string;
  directions: string;
  storage: string;
  heroImage: string | null;
  variants: Variant[];
};

/** Cheapest retail price across a product's variants — the "from" price. */
export function priceFrom(p: Product): number {
  return Math.min(...p.variants.map((v) => v.priceRetail));
}

function fromSeed(p: SeedProduct): Product {
  return {
    id: p.slug,
    slug: p.slug,
    name: p.name,
    botanicalName: p.botanical_name,
    accentHex: p.accent_hex,
    summary: p.summary,
    traditionalUse: p.traditional_use,
    ingredients: p.ingredients,
    directions: p.directions,
    storage: p.storage,
    heroImage: NO_PHOTOGRAPH.has(p.slug) ? null : `/products/${p.slug}`,
    variants: p.variants.map((v) => ({
      id: `${p.slug}-${v.format}-${v.size_label}`,
      format: v.format,
      sizeLabel: v.size_label,
      barcode: v.barcode,
      priceRetail: v.price_retail,
      stock: 0,
    })),
  };
}

/**
 * All active products, ordered.
 *
 * Falls back to the seed data when Supabase is not configured so the site
 * renders on a fresh clone with no database — the catalogue is the same source
 * the seed writes, so the two cannot drift.
 */
export async function getProducts(): Promise<Product[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return [...PRODUCTS].sort((a, b) => a.sort_order - b.sort_order).map(fromSeed);
  }

  const { getServerClient } = await import("./supabase/server");
  const db = getServerClient();
  const { data, error } = await db
    .from("products")
    .select("*, product_variants(*)")
    .eq("active", true)
    .order("sort_order");
  if (error) throw new Error(`getProducts: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    botanicalName: row.botanical_name,
    accentHex: row.accent_hex,
    summary: row.summary,
    traditionalUse: row.traditional_use,
    ingredients: row.ingredients,
    directions: row.directions,
    storage: row.storage,
    heroImage: row.hero_image ?? (NO_PHOTOGRAPH.has(row.slug) ? null : `/products/${row.slug}`),
    variants: (row.product_variants ?? [])
      .filter((v: { active: boolean }) => v.active)
      .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
      .map((v: Record<string, unknown>) => ({
        id: v.id as string,
        format: v.format as string,
        sizeLabel: v.size_label as string,
        barcode: (v.barcode as string) ?? null,
        priceRetail: Number(v.price_retail),
        stock: Number(v.stock),
      })),
  }));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const all = await getProducts();
  return all.find((p) => p.slug === slug) ?? null;
}

/** The four shown on the homepage. */
export async function getFeaturedProducts(): Promise<Product[]> {
  const all = await getProducts();
  const order = ["turmeric-with-pepper", "artemisia-annua-a3", "moringa-oleifera", "boerseep"];
  return order
    .map((slug) => all.find((p) => p.slug === slug))
    .filter((p): p is Product => Boolean(p));
}
