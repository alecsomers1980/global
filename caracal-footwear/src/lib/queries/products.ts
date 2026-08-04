import { createServerClient } from '@/lib/supabase/server';
import type {
  ProductCategory,
  ProductWithVariants,
} from '@/lib/supabase/types';

export interface ProductFilter {
  category?: ProductCategory;
  signatureOnly?: boolean;
  colour?: string;
  size?: number;
}

/**
 * Fetch active products with their active variants and all images.
 *
 * - `category`, `signatureOnly` are applied at the database level.
 * - `colour` and `size` MUST be applied in JavaScript because a PostgREST
 *   .eq() on a nested embedding would filter the embedded rows themselves,
 *   breaking the invariant that every product must return its full size run.
 */
export async function listProducts(
  filter?: ProductFilter,
): Promise<ProductWithVariants[]> {
  try {
    const supabase = createServerClient();

    let query = supabase
      .from('products')
      .select(
        `
          *,
          variants:product_variants(*),
          images:product_images(*)
        `,
      )
      .eq('active', true)
      .eq('variants.active', true)
      .order('featured', { ascending: false }) // featured first
      .order('name')
      // Embedded rows are ordered via referencedTable, not inline in the
      // select string -- supabase-js parses that string and rejects `order=`.
      .order('colour_name', { referencedTable: 'variants' })
      .order('size', { referencedTable: 'variants' })
      .order('sort_order', { referencedTable: 'images' });

    // ---- database filters ----
    if (filter?.category) {
      query = query.eq('category', filter.category);
    }
    if (filter?.signatureOnly === true) {
      query = query.eq('is_signature', true);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    let products = (data ?? []) as ProductWithVariants[];

    // ---- JavaScript filters (colour / size) ----
    if (filter?.colour || filter?.size) {
      const colour = filter.colour;
      const size = filter.size;
      products = products.filter((product) =>
        product.variants.some(
          (v) =>
            (colour ? v.colour_name === colour : true) &&
            (size ? v.size === size : true),
        ),
      );
    }

    return products;
  } catch (err: unknown) {
    throw new Error(
      `listProducts failed: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }
}

/**
 * Return a single active product by its URL slug, or null if not found.
 */
export async function getProductBySlug(
  slug: string,
): Promise<ProductWithVariants | null> {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('products')
      .select(
        `
          *,
          variants:product_variants(*),
          images:product_images(*)
        `,
      )
      .eq('active', true)
      .eq('variants.active', true)
      .eq('slug', slug)
      .order('colour_name', { referencedTable: 'variants' })
      .order('size', { referencedTable: 'variants' })
      .order('sort_order', { referencedTable: 'images' })
      .maybeSingle();

    if (error) {
      throw error;
    }

    // maybeSingle returns the row or null when no match
    return data as ProductWithVariants | null;
  } catch (err: unknown) {
    throw new Error(
      `getProductBySlug failed: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }
}

/**
 * Retrieve all site_setting rows as a flat key -> value record.
 */
export async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value');

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as { key: string; value: string }[];
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }

    return settings;
  } catch (err: unknown) {
    throw new Error(
      `getSiteSettings failed: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }
}

/**
 * Distinct colours (name + hex) across all active variants of active products,
 * sorted by colour name ascending. Deduplication is done by name in memory
 * because the Supabase client does not expose a distinct-on builder.
 */
export async function listColours(): Promise<
  { name: string; hex: string }[]
> {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('product_variants')
      .select('colour_name, colour_hex, product:products!inner(active)')
      .eq('product.active', true)
      .eq('active', true)
      .order('colour_name', { ascending: true });

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as {
      colour_name: string;
      colour_hex: string;
    }[];

    // Deduplicate by colour_name (keeping the first encountered hex)
    const seen = new Map<string, string>();
    for (const row of rows) {
      if (!seen.has(row.colour_name)) {
        seen.set(row.colour_name, row.colour_hex);
      }
    }

    return Array.from(seen.entries()).map(([name, hex]) => ({
      name,
      hex,
    }));
  } catch (err: unknown) {
    throw new Error(
      `listColours failed: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }
}