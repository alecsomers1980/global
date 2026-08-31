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
 * Products the client has not photographed. Every artemisia shot in the
 * library is ANNUA A3 (verified by reading the bottle labels), and the
 * tinctures were never shot. These render a brand panel rather than borrowing
 * another product's bottle — showing an A3 bottle on the Afra page would
 * misrepresent what is being sold.
 *
 * Uploading a photo through the admin clears this: hero_image wins, which is
 * the whole point of the upload existing.
 */
const NO_PHOTOGRAPH = new Set(["artemisia-afra", "tinctures"]);

/** The photo a product shows, upload first and the shipped asset behind it. */
export function heroFor(slug: string, heroImage: string | null): string | null {
  if (heroImage) return heroImage;
  return NO_PHOTOGRAPH.has(slug) ? null : `/products/${slug}`;
}
