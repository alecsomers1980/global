#!/usr/bin/env node
// Convert product PNGs to WebP at original dimensions (products are usually <=1000px).
// Replaces .png with .webp in-place after successful conversion.
import sharp from "sharp";
import { readdirSync, statSync, unlinkSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, "..", "public", "images", "products");

const before = readdirSync(DIR)
  .filter((f) => /\.png$/i.test(f))
  .reduce((s, f) => s + statSync(join(DIR, f)).size, 0);

let after = 0;
let converted = 0;
const replacedPngs = [];

for (const file of readdirSync(DIR).filter((f) => /\.png$/i.test(f))) {
  const p = join(DIR, file);
  const out = p.replace(/\.png$/i, ".webp");
  if (existsSync(out)) continue;
  try {
    await sharp(p).webp({ quality: 82, effort: 5 }).toFile(out);
    const newSize = statSync(out).size;
    after += newSize;
    converted++;
    replacedPngs.push(p);
  } catch (err) {
    console.error(`FAIL ${file}: ${err.message}`);
  }
}

// Delete originals
for (const p of replacedPngs) unlinkSync(p);

console.log(`Converted ${converted} files`);
console.log(`Before: ${(before / 1024 / 1024).toFixed(1)} MB`);
console.log(`After:  ${(after / 1024 / 1024).toFixed(1)} MB`);
console.log(`Saved:  ${((before - after) / 1024 / 1024).toFixed(1)} MB (${Math.round((1 - after / before) * 100)}%)`);
