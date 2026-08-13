import sharp from "sharp";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "site-media";
const MAX_DIMENSION = 2400;

export async function POST(request: Request) {
  // Auth check with the RLS-aware server client — is_staff() gates this the
  // same way it gates table writes, even though Storage itself is bypassed
  // below via the service-role client. createClient() returns null when no
  // Supabase project is configured yet — treat that as unauthorized too.
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) || "misc";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  let body: File | Blob = file;
  let contentType = file.type || "application/octet-stream";
  let safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");

  if (contentType.startsWith("image/") && contentType !== "image/svg+xml") {
    const input = Buffer.from(await file.arrayBuffer());
    const optimized = await sharp(input)
      .rotate()
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    contentType = "image/webp";
    safeName = safeName.replace(/\.[^.]+$/, "") + ".webp";
    // Wrap in a Blob: a raw Node Buffer gets UTF-8 stringified (and corrupted)
    // by the fetch implementation in Vercel's production runtime. Confirmed
    // gotcha from mountaincreek-lodge — verified working with this fix.
    body = new Blob([optimized], { type: contentType });
  }

  const path = `${folder}/${Date.now()}-${safeName}`;
  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, body, {
    contentType,
    upsert: false,
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}