import sharp from "sharp";
import { getServerClient } from "./supabase/server";
import { MAX_DIMENSION } from "./image-resize";

/**
 * Images in Supabase Storage.
 *
 * Every upload goes through the service role, so the buckets need no write
 * policy and no browser can put anything in them — the admin posts the file to
 * a server action, which checks the caller is an admin first.
 *
 * Two buckets rather than one: product photography and article images have
 * different lifetimes, and sweeping orphans out of one must not be able to
 * reach into the other.
 */
export const PRODUCT_BUCKET = "product-images";
export const NEWS_BUCKET = "news-images";

/** Storage keys are URL path segments; anything else invites a broken URL. */
function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]/g, "-").slice(-80);
}

/**
 * The browser already shrinks a photo before it posts here (lib/image-resize.ts),
 * but that step is optional by nature — it silently falls back to the original
 * file on any client-side failure, and nothing stops a request that skips the
 * browser entirely. This is the guarantee: whatever arrives, what lands in the
 * bucket is capped at MAX_DIMENSION, re-encoded to webp, and stripped of EXIF
 * (sharp drops metadata by default) — every stored photo is optimised, not just
 * the ones whose upload went through a cooperating browser.
 */
async function optimise(bytes: ArrayBuffer): Promise<Buffer> {
  return sharp(Buffer.from(bytes))
    .rotate() // bake in EXIF orientation before it gets stripped
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}

/** Named putImage, not uploadImage: the admin already exports server actions
 *  by that name and the clash is silent until TypeScript trips over it. */
export async function putImage(
  bucket: string,
  bytes: ArrayBuffer,
  filename: string,
  _contentType: string
): Promise<string> {
  const db = getServerClient();
  const optimised = await optimise(bytes);
  // A UUID prefix rather than the bare filename: two photos called IMG_1024.jpg
  // are the normal case off a phone, and upsert:false would reject the second.
  // The extension is always .webp now — optimise() re-encodes every upload to
  // it regardless of what arrived, so the stored name should say so too.
  const stem = safeName(filename).replace(/\.[^.]+$/, "");
  const path = `${crypto.randomUUID()}-${stem}.webp`;
  const { error } = await db.storage
    .from(bucket)
    .upload(path, optimised, { contentType: "image/webp", upsert: false });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return db.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

/**
 * Best effort, and deliberately silent.
 *
 * Called when an image is replaced or cleared, so a bucket does not fill with
 * files nothing points at. A failure here must never fail the save that has
 * already succeeded — the worst case is an orphan, which costs only space.
 */
export async function deleteImage(bucket: string, url: string | null | undefined): Promise<void> {
  if (!url) return;
  const marker = `/object/public/${bucket}/`;
  const at = url.indexOf(marker);
  if (at === -1) return; // Not ours — a repo stem, or an image from elsewhere.

  const { error } = await getServerClient()
    .storage.from(bucket)
    .remove([decodeURIComponent(url.slice(at + marker.length))]);
  if (error) console.error(`[storage] ${bucket} cleanup failed`, error.message);
}

export const uploadProductImage = (bytes: ArrayBuffer, filename: string, contentType: string) =>
  putImage(PRODUCT_BUCKET, bytes, filename, contentType);

export const deleteProductImage = (url: string | null | undefined) =>
  deleteImage(PRODUCT_BUCKET, url);
