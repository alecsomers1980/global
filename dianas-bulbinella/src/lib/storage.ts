import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB

export type StaffCheck =
  | { ok: true }
  | { ok: false; status: number; error: string };

/** Require the caller to be a signed-in staff/admin user. */
export async function requireStaff(): Promise<StaffCheck> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, status: 401, error: "Not signed in" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return { ok: false, status: 403, error: "Forbidden" };
  }
  return { ok: true };
}

/** Validate + upload an image to a public bucket, returning its public URL.
 *  Throws on invalid input or upload failure. */
export async function uploadImage(
  file: unknown,
  bucket: string,
  folder: string
): Promise<string> {
  if (!file || !(file instanceof File)) throw new Error("No file provided");
  if (!file.type.startsWith("image/")) throw new Error("File must be an image");
  if (file.size > MAX_BYTES) throw new Error("Image must be under 8MB");

  const admin = createAdminClient();

  // Ensure the bucket exists (idempotent).
  const { data: existing } = await admin.storage.getBucket(bucket);
  if (!existing) {
    await admin.storage.createBucket(bucket, { public: true });
  }

  const ext =
    (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") ||
    "jpg";
  const path = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage
    .from(bucket)
    .upload(path, buffer, { contentType: file.type, upsert: false });
  if (error) throw error;

  const { data: pub } = admin.storage.from(bucket).getPublicUrl(path);
  return pub.publicUrl;
}
