/**
 * The forms a product is sold in — the variant_format enum from migration 0001.
 *
 * A plain module rather than a constant in admin/actions.ts, because that file
 * is "use server" and such a file may only export async functions: exporting an
 * array from it fails at runtime with "can only export async functions, found
 * object", which renders as a blank admin screen rather than a build error.
 */
export const VARIANT_FORMATS = [
  "powder",
  "capsules",
  "bulk",
  "ointment",
  "oil",
  "bar",
  "tincture",
  "balm",
] as const;

export type VariantFormat = (typeof VARIANT_FORMATS)[number];
