/**
 * Cut the loose sprigs out of the client's plate shots for use as background
 * botanicals in the banner.
 *
 * These are the farm's own plants, photographed on a white plate — so the
 * alpha is keyed on distance from the plate rather than run through a
 * saliency model, which would try to keep the plate itself. Leaf pixels sit
 * far from white (min channel ~40); the plate and its shadows stay near it
 * (min channel ~170+).
 *
 * Run: node scripts/cut-botanicals.mjs
 */
import sharp from "sharp";
import path from "node:path";

const SOURCE = process.env.REHOBOTH_ASSETS ?? "C:/tmp/rehoboth-assets";
const OUT = path.join(process.cwd(), "public", "brand");

/** Crop boxes are inside the plate, so the wooden table never enters the key. */
const CUTS = [
  {
    name: "sprig-moringa",
    shot: "Rehoboth Products-003.JPG",
    crop: { left: 1740, top: 170, width: 2000, height: 2390 },
    width: 900,
  },
  {
    name: "sprig-artemisia",
    shot: "Rehoboth Products-004.JPG",
    crop: { left: 2040, top: 560, width: 1540, height: 1340 },
    width: 760,
  },
];

/** Soft ramp so leaf edges keep a little of their own antialiasing. */
const LOW = 96;
const HIGH = 145;

for (const cut of CUTS) {
  const src = sharp(path.join(SOURCE, "Photos", cut.shot))
    .extract(cut.crop)
    .resize({ width: cut.width });

  const { data, info } = await src
    .clone()
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const d = 255 - Math.min(r, g, b);
    const a = d <= LOW ? 0 : d >= HIGH ? 255 : Math.round(((d - LOW) / (HIGH - LOW)) * 255);
    rgba[j] = r;
    rgba[j + 1] = g;
    rgba[j + 2] = b;
    rgba[j + 3] = a;
  }

  const out = path.join(OUT, `${cut.name}.webp`);
  await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 1 })
    .webp({ quality: 82, alphaQuality: 90 })
    .toFile(out);

  const m = await sharp(out).metadata();
  console.log(`${cut.name}: ${m.width}x${m.height}`);
}
