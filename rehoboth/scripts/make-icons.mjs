/**
 * Browser and home-screen icons, cut from the logo's emblem.
 *
 * The emblem alone is what survives at 16px — the wordmark beside it turns to
 * a grey smear. It is set on the brand teal rather than left transparent for
 * two reasons: a white-on-transparent mark disappears entirely against a light
 * browser tab, and iOS composites an apple-touch-icon onto black, which would
 * put the well inside a black square.
 *
 * Run: node scripts/make-icons.mjs
 */
import sharp from "sharp";

const TEAL = { r: 0x6c, g: 0x87, b: 0x81, alpha: 1 };
const SRC = "public/brand/emblem-light.png";

/** Fraction of the canvas the mark occupies; the rest is breathing room. */
const INSET = 0.7;

async function make(out, size) {
  const mark = await sharp(SRC)
    .resize({
      width: Math.round(size * INSET),
      height: Math.round(size * INSET),
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  await sharp({ create: { width: size, height: size, channels: 4, background: TEAL } })
    .composite([{ input: mark, gravity: "centre" }])
    .png()
    .toFile(out);

  console.log(`${out} ${size}x${size}`);
}

await make("src/app/icon.png", 512);
await make("src/app/apple-icon.png", 180);
