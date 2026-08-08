/**
 * Pulls the photography off the old WordPress site and converts it to WebP.
 *
 * Mapping note: the old site's filenames are decorative, not semantic — its
 * "accommodation.jpg" is a lioness and its "transfer.jpg" is cheetahs. So each
 * file is remapped here by what it actually shows, not by what it was called.
 */
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const BASE = 'https://knp-panorama.com/wp-content/uploads';

const TARGETS = [
  {
    url: `${BASE}/2025/02/accommodation.jpg`,
    out: 'destinations/kruger-national-park.webp',
    subject: 'Lioness resting at golden hour',
  },
  {
    url: `${BASE}/2025/02/tours.jpg`,
    out: 'destinations/panorama-route.webp',
    subject: 'Escarpment view over the Lowveld',
  },
  {
    url: `${BASE}/2025/02/transfer.jpg`,
    out: 'tours/full-day-safari-kruger-national-park.webp',
    subject: 'Cheetahs walking a bush road',
  },
  {
    url: `${BASE}/2025/02/safari.jpg`,
    out: 'tours/half-day-safari-kruger-national-park.webp',
    subject: 'Spotted hyena in the bush',
  },
];

const root = path.join(process.cwd(), 'public', 'images');

for (const target of TARGETS) {
  const res = await fetch(target.url);
  if (!res.ok) {
    console.error(`MISS ${res.status} ${target.url}`);
    continue;
  }

  const dest = path.join(root, target.out);
  await mkdir(path.dirname(dest), { recursive: true });

  const buffer = Buffer.from(await res.arrayBuffer());
  const { width, height } = await sharp(buffer).metadata();
  await sharp(buffer).webp({ quality: 82 }).toFile(dest);

  console.log(`OK ${target.out} (${width}x${height}) — ${target.subject}`);
}

// Remove the JPEGs written by the earlier run of this script.
for (const stale of [
  'destinations/kruger-national-park.jpg',
  'destinations/panorama-route.jpg',
  'destinations/transfers.jpg',
  'destinations/accommodation.jpg',
]) {
  await unlink(path.join(root, stale)).catch(() => {});
}
