/**
 * Build web images from the client's originals.
 *
 * Originals (50 product shots, 16 logo variants, ~8MB each) live outside the
 * repo at SOURCE — far too heavy to commit. Only the derivatives below are
 * versioned.
 *
 * Shot-to-product mapping was made by eye from the client's photography, not
 * from filenames — the files are named "Rehoboth Products-0NN.JPG" and carry
 * no product information.
 *
 * Run: npm run optimise-media
 */
import sharp from "sharp";
import { mkdirSync, existsSync } from "node:fs";
import path from "node:path";

const SOURCE = process.env.REHOBOTH_ASSETS ?? "C:/tmp/rehoboth-assets";
const PHOTOS = path.join(SOURCE, "Photos");
const LOGOS = path.join(SOURCE, "Logo");
const OUT_P = path.join(process.cwd(), "public", "products");
const OUT_B = path.join(process.cwd(), "public", "brand");

/** slug -> source shot number. Verified by reading the bottle labels in the
 *  originals, not guessed from filenames.
 *
 *  Two products have NO photograph in the client's library:
 *    - artemisia-afra: every artemisia shot (004, 014, 017) is ANNUA A3.
 *    - tinctures: not photographed at all.
 *  Both fall back to a brand panel rather than borrowing another product's
 *  bottle, which would misrepresent what is being sold.
 */
const HERO = {
  "artemisia-annua-a3": 14,
  "moringa-oleifera": 27,
  "turmeric-with-pepper": 7,
  rosemary: 2,
  neem: 36,
  "lip-balm": 38,
  boerseep: 35,
};

/** Extra shots worth having on the site beyond the product heroes. */
const EXTRA = {
  "boerseep-moringa": 35,
  "boerseep-cappuccino": 46,
  "boerseep-cinnamon": 49,
  "lip-balm-marula": 38,
  "lip-balm-spearmint": 42,
  "artemisia-tin": 21,
  "artemisia-plate": 4,
  "turmeric-jar": 9,
  "turmeric-plate": 1,
  "moringa-plate": 3,
  "moringa-capsules": 28,
};

const WIDTHS = [1600, 800, 400];

function shot(n) {
  const padded = String(n).padStart(3, "0");
  for (const ext of ["JPG", "jpg"]) {
    const p = path.join(PHOTOS, `Rehoboth Products-${padded}.${ext}`);
    if (existsSync(p)) return p;
  }
  return null;
}

async function emit(src, name, outDir) {
  for (const w of WIDTHS) {
    await sharp(src)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(path.join(outDir, `${name}-${w}.webp`));
  }
}

async function main() {
  if (!existsSync(PHOTOS)) {
    console.error(`Originals not found at ${PHOTOS}. Set REHOBOTH_ASSETS.`);
    process.exit(1);
  }
  mkdirSync(OUT_P, { recursive: true });
  mkdirSync(OUT_B, { recursive: true });

  let n = 0;
  for (const [name, num] of Object.entries({ ...HERO, ...EXTRA })) {
    const src = shot(num);
    if (!src) {
      console.error(`missing source shot ${num} for ${name}`);
      process.exit(1);
    }
    await emit(src, name, OUT_P);
    n++;
  }

  // Logos: trim the transparent margin so they can be sized by height in CSS.
  const logos = {
    "wordmark-dark": "Rehoboth herbal.co document logo - black (PNG).png",
    "wordmark-light": "Rehoboth herbal.co document logo - white (PNG).png",
    "emblem-dark": "Rehoboth Herbal.co Emblem - Black (PNG).png",
    "emblem-light": "Rehoboth Herbal.co Emblem - white (PNG).png",
  };
  for (const [name, file] of Object.entries(logos)) {
    const src = path.join(LOGOS, file);
    if (!existsSync(src)) {
      console.error(`missing logo: ${file}`);
      process.exit(1);
    }
    await sharp(src).trim().png({ compressionLevel: 9 }).toFile(path.join(OUT_B, `${name}.png`));
  }

  console.log(`optimised ${n} product images (${WIDTHS.join("/")}px webp) + 4 logos`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
