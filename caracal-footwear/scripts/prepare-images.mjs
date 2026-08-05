/**
 * Turns the client's WhatsApp photo drop into web assets.
 *
 * Source photos live in intake/reference/ (gitignored, POPIA) and are phone
 * and studio shots at mixed aspect ratios -- 3:2 studio, 4:3 landscape phone,
 * 3:4 portrait phone. Every product image is normalised to 1200x900 (4:3) so
 * the card grid and the PDP gallery crop nothing further: what this script
 * writes is exactly what renders.
 *
 * Run: node scripts/prepare-images.mjs
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'intake/reference';
const OUT_PRODUCTS = 'public/products';
const OUT_HERO = 'public/hero';

/** Canvas colour from globals.css -- used to pad the one letterboxed image. */
const CANVAS = '#14110F';

const src = (n) => path.join(SRC, `WhatsApp Image 2026-07-28 at ${n}.jpeg`);

/**
 * `position` is the crop anchor sharp uses when cover-fitting. Portrait phone
 * shots need a nudge: centre-cropping a 3:4 frame to 4:3 throws away most of
 * the height, and on these the shoe sits below the middle.
 */
const products = [
  // --- Classic Chukka (420) -------------------------------------------------
  { file: '11.27.17 (13)', out: 'classic-chukka-tan.webp' },
  { file: '11.27.17 (12)', out: 'classic-chukka-white.webp' },
  { file: '11.27.17 (16)', out: 'classic-chukka-red.webp', position: 'top' },
  { file: '11.27.15 (1)', out: 'classic-chukka-black.webp' },
  { file: '11.27.17 (11)', out: 'classic-chukka-tan-2.webp' },
  { file: '11.27.17 (14)', out: 'classic-chukka-tan-3.webp' },

  // --- Veld Chelsea (402) ---------------------------------------------------
  { file: '11.27.17', out: 'veld-chelsea-brown.webp' },
  { file: '11.27.17 (7)', out: 'veld-chelsea-tan.webp', position: 'centre' },

  // --- Ranger Hiker (403) ---------------------------------------------------
  { file: '11.27.17 (5)', out: 'ranger-hiker-brown.webp' },
  { file: '11.27.17 (15)', out: 'ranger-hiker-olive.webp' },

  // --- Signature ------------------------------------------------------------
  { file: '11.27.17 (18)', out: 'signature-lion.webp' },
  { file: '11.27.18', out: 'signature-leopard.webp' },
  { file: '11.27.17 (19)', out: 'signature-zebra.webp' },
  { file: '11.27.17 (3)', out: 'signature-protea.webp' },
  { file: '11.27.15', out: 'signature-succulent.webp', position: 'centre' },

  /*
   * The buffalo photo is a stacked pair of shots in one frame -- buffalo panel
   * on top, plain sunset panel below. Take the top pane, cropped in to the
   * boot itself, then pad rather than crop: even at 1.9:1 cover-fitting to 4:3
   * would cut both the toe and the heel off.
   */
  {
    file: '11.27.17 (20)',
    out: 'signature-buffalo.webp',
    extract: { left: 230, top: 0, width: 840, height: 445 },
    fit: 'contain',
  },
];

const heroes = [
  { file: '11.27.17 (2)', out: 'wild-by-nature.webp', width: 1600, height: 900 },
];

async function build(job, outDir, width, height) {
  let img = sharp(src(job.file));
  if (job.extract) img = img.extract(job.extract);

  await img
    .resize(width, height, {
      fit: job.fit ?? 'cover',
      position: job.position ?? 'centre',
      background: CANVAS,
    })
    .webp({ quality: 82 })
    .toFile(path.join(outDir, job.out));

  return job.out;
}

await mkdir(OUT_PRODUCTS, { recursive: true });
await mkdir(OUT_HERO, { recursive: true });

for (const job of products) {
  console.log('products/' + (await build(job, OUT_PRODUCTS, 1200, 900)));
}
for (const job of heroes) {
  console.log('hero/' + (await build(job, OUT_HERO, job.width, job.height)));
}
