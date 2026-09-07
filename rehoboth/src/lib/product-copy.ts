import type { Product, Variant } from "./catalog";

/**
 * Which words a product page shows for the size the shopper has picked.
 *
 * A variant field that is null or blank inherits the product's, so the shared
 * paragraphs are written once on the product and only the genuinely different
 * lines — usually the directions, because a dose of loose powder is not a dose
 * of capsules — are overridden per size. See 0009_variant_copy.sql.
 *
 * Blank counts as absent, not as "deliberately empty". A textarea the operator
 * cleared and one they never touched are indistinguishable by the time they
 * reach the database, and of the two readings, inheriting is the one that
 * cannot leave a live product page with an empty Ingredients heading.
 *
 * Kept apart from catalog.ts on purpose: this runs in the browser, where the
 * selected size changes without a request, and catalog.ts reaches for the
 * Supabase server client.
 */
export type ResolvedCopy = {
  summary: string;
  traditionalUse: string | null;
  ingredients: string;
  directions: string;
  storage: string;
};

function pick(variantValue: string | null | undefined, productValue: string): string {
  const own = (variantValue ?? "").trim();
  return own || productValue;
}

export function copyFor(product: Product, variant: Variant | undefined): ResolvedCopy {
  if (!variant) {
    return {
      summary: product.summary,
      traditionalUse: product.traditionalUse,
      ingredients: product.ingredients,
      directions: product.directions,
      storage: product.storage,
    };
  }

  return {
    summary: pick(variant.summary, product.summary),
    // The only nullable one: a product with no traditional-use note has that
    // whole section omitted rather than rendered empty, and a size inherits
    // the omission too.
    traditionalUse: pick(variant.traditionalUse, product.traditionalUse ?? "") || null,
    ingredients: pick(variant.ingredients, product.ingredients),
    directions: pick(variant.directions, product.directions),
    storage: pick(variant.storage, product.storage),
  };
}
