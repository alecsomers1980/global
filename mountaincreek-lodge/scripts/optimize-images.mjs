// One-off / rerunnable maintenance script: recompresses existing images in
// public/images in place (same filename/extension, so no references break).
// Run with: node scripts/optimize-images.mjs
import { readdir, stat, readFile, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

const ROOT = path.join(process.cwd(), "public", "images");
const MAX_DIMENSION = 2400;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

async function optimize(file) {
  const ext = path.extname(file).toLowerCase();
  if (![".jpg", ".jpeg", ".png"].includes(ext)) return null;

  const original = await readFile(file);
  const originalSize = original.length;
  const image = sharp(original).rotate().resize({
    width: MAX_DIMENSION,
    height: MAX_DIMENSION,
    fit: "inside",
    withoutEnlargement: true,
  });

  const output =
    ext === ".png"
      ? await image.png({ quality: 80, compressionLevel: 9 }).toBuffer()
      : await image.jpeg({ quality: 80, mozjpeg: true }).toBuffer();

  if (output.length >= originalSize) return { file, skipped: true };

  await writeFile(file, output);
  return { file, originalSize, newSize: output.length };
}

const files = await walk(ROOT);
let totalBefore = 0;
let totalAfter = 0;
let optimizedCount = 0;

for (const file of files) {
  const result = await optimize(file);
  if (!result) continue;
  if (result.skipped) continue;
  optimizedCount++;
  totalBefore += result.originalSize;
  totalAfter += result.newSize;
  const savedPct = (100 * (1 - result.newSize / result.originalSize)).toFixed(0);
  console.log(`${path.relative(ROOT, result.file)}: -${savedPct}%`);
}

console.log(
  `\nOptimized ${optimizedCount} files: ${(totalBefore / 1024 / 1024).toFixed(1)}MB -> ${(totalAfter / 1024 / 1024).toFixed(1)}MB`
);
