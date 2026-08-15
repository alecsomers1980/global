// Rasterizes the real old-site favicon source (public/images/logo-mark.png —
// the client's actual "cropped-Woodpeckers-logo.png", the exact image
// WordPress's Site Icon feature generated their real favicon crops from)
// into the sizes Next.js's file-based metadata convention expects.
//
// Usage: node scripts/generate-favicons.mjs

import sharp from "sharp";
import pngToIco from "png-to-ico";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const appDir = path.join(root, "src", "app");
const source = path.join(root, "public", "images", "logo-mark.png");

await sharp(source).resize(32, 32).png().toFile(path.join(appDir, "icon.png"));
await sharp(source).resize(180, 180).png().toFile(path.join(appDir, "apple-icon.png"));

const sizes = [16, 32, 48];
const pngBuffers = await Promise.all(sizes.map((s) => sharp(source).resize(s, s).png().toBuffer()));
const ico = await pngToIco(pngBuffers);
fs.writeFileSync(path.join(appDir, "favicon.ico"), ico);

console.log("Generated icon.png, apple-icon.png and favicon.ico from the real logo-mark.png");
