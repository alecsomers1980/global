/**
 * A product photo is either a repo asset or an upload, and callers should not
 * have to know which.
 *
 * The shots we optimised by hand ship as a path stem — /products/moringa-oleifera
 * — with -400/-800/-1600 webp files beside them, so the caller picks a width.
 * Anything uploaded through the admin is a full URL into the storage bucket,
 * already resized in the browser, with no width variants to choose from.
 *
 * Nothing here touches the database or the filesystem, so the admin can use it
 * in the browser to preview exactly what the shop will render.
 */
export function imageSrc(value: string, width: 400 | 800 | 1600): string {
  return value.startsWith("http") ? value : `${value}-${width}.webp`;
}

/** True for an admin upload, as opposed to a photo shipped with the site. */
export function isUploaded(value: string | null | undefined): boolean {
  return Boolean(value && value.startsWith("http"));
}

/**
 * The photo each product shows on the shop grid and homepage, from the client's
 * product renders (scripts/optimise-renders.mjs), keyed by product slug.
 *
 * A map rather than a list of exceptions: the admin can add products, and a
 * new one has no repo asset, so an unlisted slug must fall through to the
 * brand panel instead of pointing at a file that does not exist.
 *
 * Every product now has a render, tinctures included. The old shoot's stems
 * (/products/rosemary, /products/boerseep, ...) are still in public/products
 * but no longer referenced from here.
 */
const SHIPPED_PHOTOGRAPH: Record<string, string> = {
  "artemisia-annua-a3": "capsules-a3",
  "artemisia-afra": "capsules-afra",
  "moringa-oleifera": "capsules-moringa",
  "turmeric-with-pepper": "capsules-turmeric",
  rosemary: "capsules-rosemary",
  neem: "ointment-neem",
  "lip-balm": "lip-balm-marula",
  boerseep: "boerseep-charcoal",
  tinctures: "tincture-artemisia",
};

/** The photo a product shows: an upload first, the shipped asset behind it. */
export function heroFor(slug: string, heroImage: string | null): string | null {
  if (heroImage) return heroImage;
  const stem = SHIPPED_PHOTOGRAPH[slug];
  return stem ? `/products/${stem}` : null;
}
