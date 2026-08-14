// Rasterizes src/app/icon.svg (the brand mark) into the raster favicon
// formats Next.js's file-based metadata convention needs but can't derive
// from an SVG itself: apple-icon.png (iOS has no SVG favicon support) and
// favicon.ico (legacy browser/crawler fallback). Re-run after any edit to
// icon.svg or Logo.tsx's mark.
//
// Usage: node scripts/generate-favicons.mjs

import sharp from "sharp";
import pngToIco from "png-to-ico";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "app");
const svg = fs.readFileSync(path.join(appDir, "icon.svg"));

await sharp(svg).resize(180, 180).png().toFile(path.join(appDir, "apple-icon.png"));

const sizes = [16, 32, 48];
const pngBuffers = await Promise.all(sizes.map((s) => sharp(svg).resize(s, s).png().toBuffer()));
const ico = await pngToIco(pngBuffers);
fs.writeFileSync(path.join(appDir, "favicon.ico"), ico);

console.log("Generated apple-icon.png and favicon.ico from icon.svg");
