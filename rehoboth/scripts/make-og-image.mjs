/**
 * The default social-share image — what Facebook, WhatsApp, LinkedIn and a
 * Slack unfurl show when a page carries no photograph of its own (About,
 * Contact, Stockists, and any news article with no hero image).
 *
 * 1200x630 is the size every major platform crops to without letterboxing.
 * Built from the same brand teal and wordmark as the rest of the site rather
 * than photography, because it has to represent pages that aren't about one
 * product — the brand mark is the one thing they all share.
 *
 * Run: node scripts/make-og-image.mjs
 */
import sharp from "sharp";

const WIDTH = 1200;
const HEIGHT = 630;
const NIGHT = { r: 0x24, g: 0x40, b: 0x3a, alpha: 1 };
const OUT = "public/brand/og-image.jpg";

async function main() {
  const wordmark = await sharp("public/brand/wordmark-light.png")
    .resize({ width: 640 })
    .toBuffer();
  const wordmarkMeta = await sharp(wordmark).metadata();

  const tagline = Buffer.from(
    `<svg width="${WIDTH}" height="80" xmlns="http://www.w3.org/2000/svg">
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
        font-family="Georgia, serif" font-size="28" letter-spacing="2"
        fill="#DCEAE5" fill-opacity="0.85">
        GROWN, DRIED AND PACKED IN MPUMALANGA
      </text>
    </svg>`
  );

  const wordmarkY = Math.round(HEIGHT / 2 - wordmarkMeta.height / 2 - 30);
  const taglineY = wordmarkY + wordmarkMeta.height + 30;

  await sharp({
    create: { width: WIDTH, height: HEIGHT, channels: 4, background: NIGHT },
  })
    .composite([
      { input: wordmark, left: Math.round((WIDTH - wordmarkMeta.width) / 2), top: wordmarkY },
      { input: tagline, left: 0, top: taglineY },
    ])
    .jpeg({ quality: 88 })
    .toFile(OUT);

  console.log(`wrote ${OUT} (${WIDTH}x${HEIGHT})`);
}

main();
