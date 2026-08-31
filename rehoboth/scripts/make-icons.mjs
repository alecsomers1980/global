/**
 * Browser and home-screen icons, cut from the logo's emblem.
 *
 * The emblem alone is what survives at 16px — the wordmark beside it turns to
 * a grey smear.
 *
 * White ground, teal mark. The client's own emblem-dark.png is pure black,
 * which reads harshly for a herbal brand, so the shape is used as a mask and
 * filled with the brand teal instead. The ground is opaque white rather than
 * transparent because iOS composites an apple-touch-icon onto black, which
 * would put the well in a black square.
 *
 * Run: node scripts/make-icons.mjs
 */
import sharp from "sharp";

const TEAL = { r: 0x6c, g: 0x87, b: 0x81, alpha: 1 };
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };
const SRC = "public/brand/emblem-dark.png";

/** Fraction of the canvas the mark occupies; the rest is breathing room. */
const INSET = 0.74;

async function make(out, size) {
  const markSize = Math.round(size * INSET);

  // The emblem is a black silhouette, so it cannot be tinted by multiplying.
  // dest-in keeps the teal only where the emblem has alpha, which recolours
  // the shape without touching its edges.
  const shape = await sharp(SRC)
    .resize({ width: markSize, height: markSize, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const mark = await sharp({ create: { width: markSize, height: markSize, channels: 4, background: TEAL } })
    .composite([{ input: shape, blend: "dest-in" }])
    .png()
    .toBuffer();

  await sharp({ create: { width: size, height: size, channels: 4, background: WHITE } })
    .composite([{ input: mark, gravity: "centre" }])
    .png()
    .toFile(out);

  console.log(`${out} ${size}x${size}`);
}

await make("src/app/icon.png", 512);
await make("src/app/apple-icon.png", 180);
