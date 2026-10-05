/**
 * Build web images from the client's second delivery: 29 numbered 2000px PNGs
 * (1.png … 29.png) of capsules, powders, balms, ointments, tinctures and the
 * twelve Boerseep varieties. They are product renders with the label artwork
 * on them, not the original shoot that optimise-media.mjs handles.
 *
 * The files carry no product information, so the mapping below was made by
 * reading each label. Output stems sit beside the shoot's in public/products
 * (-400/-800/-1600 webp) and are what catalog-data.ts points image_url at.
 *
 * Run: npm run optimise-renders
 */
import sharp from "sharp";
import { mkdirSync, existsSync } from "node:fs";
import path from "node:path";

const SOURCE =
  process.env.REHOBOTH_RENDERS ??
  "C:/Users/info/OneDrive/Documents/Ember Automations/Clients/Rebohoth/Products";
const OUT = path.join(process.cwd(), "public", "products");

/** output stem -> source file number */
const RENDERS = {
  "capsules-afra": 1,
  "capsules-a3": 2,
  "capsules-rosemary": 3,
  "capsules-moringa": 4,
  "capsules-turmeric": 5,
  "powder-a3": 6,
  "powder-afra": 7,
  "powder-moringa": 8,
  "powder-rosemary": 9,
  "powder-turmeric": 10,
  "lip-balm-marula": 11,
  "lip-balm-spearmint": 12,
  "ointment-artemisia": 13,
  "ointment-moringa": 14,
  "ointment-neem": 15,
  "tincture-artemisia": 16,
  "tincture-garlic": 17,
  "boerseep-artemisia": 18,
  "boerseep-rosemary": 19,
  "boerseep-lavender": 20,
  "boerseep-charcoal": 21,
  "boerseep-moerkoffie": 22,
  "boerseep-moringa": 23,
  "boerseep-turmeric": 24,
  "boerseep-cinnamon": 25,
  "boerseep-natural-plain": 26,
  "boerseep-cedar-glow": 27,
  "boerseep-salty-rocks": 28,
  "boerseep-african-sunset": 29,
  // The Afra product card has had no photograph until now.
  "artemisia-afra": 1,
};

const WIDTHS = [1600, 800, 400];

async function main() {
  if (!existsSync(SOURCE)) {
    console.error(`Renders not found at ${SOURCE}. Set REHOBOTH_RENDERS.`);
    process.exit(1);
  }
  mkdirSync(OUT, { recursive: true });

  let n = 0;
  for (const [name, num] of Object.entries(RENDERS)) {
    const src = path.join(SOURCE, `${num}.png`);
    if (!existsSync(src)) {
      console.error(`missing source ${num}.png for ${name}`);
      process.exit(1);
    }
    for (const w of WIDTHS) {
      await sharp(src)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(path.join(OUT, `${name}-${w}.webp`));
    }
    n++;
  }
  console.log(`optimised ${n} renders (${WIDTHS.join("/")}px webp)`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
