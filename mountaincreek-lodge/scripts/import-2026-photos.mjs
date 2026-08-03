// One-off import: optimizes real 2026 client photos and wires them into
// Supabase (accommodation units + a new gallery category), same pipeline
// as the admin upload route (resize to 2400px max, re-encode as WebP q80).
import { readdir, readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: path.join(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET = "site-media";
const MAX_DIMENSION = 2400;

const SOURCE_ROOT =
  "C:/Users/info/OneDrive/Documents/PRECISION MEDIA/CLIENTS/Mountain Creek Lodge/2026 Pictures";

const ACCOMMODATION_FOLDERS = ["Chalet 1", "Chalet 2", "Chalet 4", "Main House"];
const GALLERY_FOLDER = "Other";
const GALLERY_CATEGORY_NAME = "2026 Photos";

async function listImageFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && /\.(jpe?g|png)$/i.test(e.name))
    .map((e) => path.join(dir, e.name))
    .sort();
}

async function optimizeAndUpload(filePath, folder) {
  const input = await readFile(filePath);
  const output = await sharp(input)
    .rotate()
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toBuffer();

  const safeName =
    path.basename(filePath, path.extname(filePath)).replace(/[^a-zA-Z0-9.\-_]/g, "_") +
    ".webp";
  const storagePath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${safeName}`;

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, output, {
    contentType: "image/webp",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

async function main() {
  // --- Accommodation units ---
  for (const folderName of ACCOMMODATION_FOLDERS) {
    const dir = path.join(SOURCE_ROOT, folderName);
    const files = await listImageFiles(dir);
    console.log(`\n${folderName}: ${files.length} photos`);

    const urls = [];
    for (const file of files) {
      const url = await optimizeAndUpload(file, "accommodation");
      urls.push(url);
      console.log(`  uploaded ${path.basename(file)}`);
    }

    const { data: unit, error: findError } = await supabase
      .from("accommodation_units")
      .select("id")
      .eq("name", folderName)
      .single();
    if (findError || !unit) {
      console.error(`  ! No accommodation unit found named "${folderName}", skipping DB update`);
      continue;
    }

    const { error: updateError } = await supabase
      .from("accommodation_units")
      .update({ images: urls })
      .eq("id", unit.id);
    if (updateError) throw updateError;
    console.log(`  updated unit "${folderName}" with ${urls.length} images`);
  }

  // --- Gallery ("Other" folder) ---
  const galleryDir = path.join(SOURCE_ROOT, GALLERY_FOLDER);
  const galleryFiles = await listImageFiles(galleryDir);
  console.log(`\n${GALLERY_FOLDER} -> gallery: ${galleryFiles.length} photos`);

  let { data: category } = await supabase
    .from("gallery_categories")
    .select("id")
    .eq("name", GALLERY_CATEGORY_NAME)
    .maybeSingle();

  if (!category) {
    const { data: created, error: createError } = await supabase
      .from("gallery_categories")
      .insert({ name: GALLERY_CATEGORY_NAME })
      .select("id")
      .single();
    if (createError) throw createError;
    category = created;
    console.log(`  created gallery category "${GALLERY_CATEGORY_NAME}"`);
  }

  for (const file of galleryFiles) {
    const url = await optimizeAndUpload(file, "gallery");
    const { error } = await supabase
      .from("gallery_images")
      .insert({ src: url, category_id: category.id });
    if (error) throw error;
    console.log(`  added ${path.basename(file)} to gallery`);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
