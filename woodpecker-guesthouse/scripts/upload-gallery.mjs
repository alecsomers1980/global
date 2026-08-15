// One-off migration: uploads the real FooGallery photos (recovered from the
// client's old Gallery page content — filenames grouped exactly as the
// client organized them into ALL/ACCOMMODATION/CONFERENCING AND
// DINING/EXTERIOR tabs) to Supabase Storage, then inserts gallery_images
// rows against the real gallery_categories seeded by scripts/seed.mjs.
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, serviceKey);
const BUCKET = "site-media";

const CATEGORIES = {
  Accommodation: {
    dir: "2022/09",
    files: ["IMG_4755", "IMG_4917", "IMG_4807", "IMG_4726", "IMG_4802-1", "IMG_4719", "IMG_4718", "IMG_4691", "IMG_4689"],
  },
  "Conferencing and Dining": {
    dir: "2022/06",
    files: [
      "IMG_4721", "IMG_4722-2", "IMG_4723", "IMG_4724", "IMG_4936", "IMG_4937",
      "IMG_4938", "IMG_4939", "IMG_4942", "IMG_4943", "IMG_4948", "IMG_4950",
    ],
  },
  Exterior: {
    dir: "2022/06",
    files: ["IMG_4982", "IMG_4985", "IMG_4998"],
  },
};

const UPLOADS_ROOT = "C:/Users/info/Downloads/WoodpeckerUploads14082026/uploads";

async function uploadOne(localPath, storagePath) {
  const input = fs.readFileSync(localPath);
  const optimized = await sharp(input)
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
  const blob = new Blob([optimized], { type: "image/webp" });
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, blob, {
    contentType: "image/webp",
    upsert: true,
  });
  if (error) throw new Error(`Upload failed for ${storagePath}: ${error.message}`);
  return supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

const { data: categories, error: catErr } = await supabase.from("gallery_categories").select("id, name");
if (catErr) throw catErr;
const catByName = Object.fromEntries(categories.map((c) => [c.name, c.id]));

let sortOrder = 0;
const rows = [];
for (const [catName, { dir, files }] of Object.entries(CATEGORIES)) {
  const categoryId = catByName[catName];
  if (!categoryId) throw new Error(`Category not found: ${catName}`);
  for (const base of files) {
    const localPath = path.join(UPLOADS_ROOT, dir, `${base}.png`);
    if (!fs.existsSync(localPath)) {
      console.error(`MISSING: ${localPath}`);
      continue;
    }
    const storagePath = `gallery/${base.replace(/[^a-zA-Z0-9-]/g, "")}.webp`;
    const publicUrl = await uploadOne(localPath, storagePath);
    rows.push({ src: publicUrl, alt: `Woodpecker Guesthouse — ${catName}`, category_id: categoryId, sort_order: sortOrder++ });
    console.log(`uploaded ${base} -> ${catName}`);
  }
}

const { error: insErr } = await supabase.from("gallery_images").insert(rows);
if (insErr) throw insErr;
console.log(`Inserted ${rows.length} gallery_images rows.`);
