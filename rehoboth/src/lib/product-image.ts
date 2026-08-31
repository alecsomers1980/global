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
 * The seven products photographed in the client's shoot, which ship as
 * optimised webp in public/products.
 *
 * An allowlist rather than a list of exceptions. The exceptions version was
 * right for a fixed catalogue of nine, but the admin can now add products, and
 * a new one has no repo asset — so "everything except Afra and the tinctures
 * has a photo" silently pointed every new product at a file that does not
 * exist, giving a broken image until someone uploaded one.
 *
 * Artemisia Afra and the tinctures are absent for a different reason: every
 * artemisia shot in the library is ANNUA A3 (verified by reading the bottle
 * labels) and the tinctures were never shot. They render a brand panel rather
 * than borrowing another product's bottle, which would misrepresent what is
 * being sold.
 */
const SHIPPED_PHOTOGRAPH = new Set([
  "artemisia-annua-a3",
  "boerseep",
  "lip-balm",
  "moringa-oleifera",
  "neem",
  "rosemary",
  "turmeric-with-pepper",
]);

/** The photo a product shows: an upload first, the shipped asset behind it. */
export function heroFor(slug: string, heroImage: string | null): string | null {
  if (heroImage) return heroImage;
  return SHIPPED_PHOTOGRAPH.has(slug) ? `/products/${slug}` : null;
}
