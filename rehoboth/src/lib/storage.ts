import { getServerClient } from "./supabase/server";

/**
 * Product photography in Supabase Storage.
 *
 * Every upload goes through the service role, so the bucket needs no write
 * policy and no browser can put anything in it — the admin posts the file to a
 * server action, which checks the caller is an admin first.
 */
const BUCKET = "product-images";

/** Storage keys are URL path segments; anything else invites a broken URL. */
function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]/g, "-").slice(-80);
}

export async function uploadProductImage(
  bytes: ArrayBuffer,
  filename: string,
  contentType: string
): Promise<string> {
  const db = getServerClient();
  // A UUID prefix rather than the bare filename: two photos called IMG_1024.jpg
  // are the normal case off a phone, and upsert:false would reject the second.
  const path = `${crypto.randomUUID()}-${safeName(filename)}`;
  const { error } = await db.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType, upsert: false });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/**
 * Best effort, and deliberately silent.
 *
 * Called when a photo is replaced or cleared, so the bucket does not fill with
 * images nothing points at. A failure here must never fail the save that has
 * already succeeded — the worst case is an orphaned file, which costs nothing
 * but space.
 */
export async function deleteProductImage(url: string | null | undefined): Promise<void> {
  if (!url) return;
  const marker = `/object/public/${BUCKET}/`;
  const at = url.indexOf(marker);
  if (at === -1) return; // Not ours — a repo stem, or an image from elsewhere.

  const { error } = await getServerClient()
    .storage.from(BUCKET)
    .remove([decodeURIComponent(url.slice(at + marker.length))]);
  if (error) console.error("[storage] cleanup failed", error.message);
}
