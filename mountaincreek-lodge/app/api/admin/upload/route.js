import sharp from "sharp";
import { isAdminAuthed, unauthorizedResponse } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const BUCKET = "site-media";
const MAX_DIMENSION = 2400;

export async function POST(request) {
  if (!(await isAdminAuthed())) return unauthorizedResponse();

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = formData.get("folder") || "misc";

  if (!file) {
    return new Response(JSON.stringify({ error: "No file provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body = file;
  let contentType = file.type || "application/octet-stream";
  let safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");

  if (contentType.startsWith("image/") && contentType !== "image/svg+xml") {
    const input = Buffer.from(await file.arrayBuffer());
    const optimized = await sharp(input)
      .rotate()
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();
    contentType = "image/webp";
    safeName = safeName.replace(/\.[^.]+$/, "") + ".webp";
    // Wrap in a Blob: a raw Node Buffer gets UTF-8 stringified (and so
    // corrupted) by the fetch implementation in Vercel's production runtime.
    body = new Blob([optimized], { type: contentType });
  }

  const path = `${folder}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, body, {
      contentType,
      upsert: false,
    });

  if (uploadError) {
    return new Response(JSON.stringify({ error: uploadError.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

  return new Response(JSON.stringify({ url: data.publicUrl }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
