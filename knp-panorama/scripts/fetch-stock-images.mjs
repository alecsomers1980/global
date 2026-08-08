/**
 * Fetches freely-licensed South African photography from Wikimedia Commons,
 * crops it to the slot it will fill, and records attribution.
 *
 * Commons is used rather than an anonymous stock site because every result
 * carries a verifiable licence and a named photographer, which the client
 * needs in order to publish these legally. See docs/image-credits.md.
 *
 * Each target lists several queries; the first that yields a qualifying result
 * wins. That fallback exists because broad queries return poor matches — the
 * first pass picked an ISS satellite photo for Mozambique and a close-up of
 * thorn branches for the safari hero.
 *
 * Usage:
 *   node scripts/fetch-stock-images.mjs              # all targets
 *   node scripts/fetch-stock-images.mjs mozambique   # only matching targets
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'knp-panorama-build/1.0 (alecsomers1980@gmail.com)';

const TARGETS = [
  {
    out: 'heroes/home.webp', width: 1920, orient: 'landscape',
    queries: ['Kruger National Park sunset', 'African bush sunset South Africa', 'Kruger National Park savanna'],
  },
  {
    out: 'heroes/safari.webp', width: 1920, orient: 'landscape',
    queries: ['Kruger National Park lion road', 'Kruger National Park elephant road', 'game drive vehicle South Africa'],
  },
  {
    out: 'heroes/tours.webp', width: 1920, orient: 'landscape',
    queries: ['Blyde River Canyon'],
  },
  {
    out: 'heroes/transfers.webp', width: 1920, orient: 'landscape',
    queries: ['Mpumalanga road landscape'],
  },
  {
    out: 'heroes/accommodation.webp', width: 1920, orient: 'landscape',
    queries: ['Category:Hotels in Mpumalanga'], mustMatch: 'Hotel|Inn|Lapa|Lodge',
  },
  {
    out: 'destinations/eswatini.webp', width: 700, orient: 'portrait',
    queries: ['Eswatini landscape'],
  },
  {
    out: 'destinations/mozambique.webp', width: 700, orient: 'portrait',
    queries: ['Tofo Beach Mozambique', 'Bazaruto Archipelago', 'Vilanculos Mozambique'],
  },
  {
    out: 'destinations/local-experiences.webp', width: 700, orient: 'portrait',
    queries: ['Mpumalanga village South Africa'],
  },
  {
    out: 'destinations/johannesburg.webp', width: 700, orient: 'portrait',
    queries: ['Johannesburg skyline'],
  },
  {
    out: 'destinations/family-experiences.webp', width: 700, orient: 'portrait',
    queries: ['Kruger National Park elephant'],
  },
  {
    out: 'destinations/adventure-experiences.webp', width: 700, orient: 'portrait',
    queries: ['Mac Mac Falls', 'Lone Creek Falls Sabie', 'Sabie waterfall Mpumalanga'],
  },
  {
    out: 'tours/full-day-panorama.webp', width: 1600, orient: 'landscape',
    queries: ["God's Window Mpumalanga"],
  },
  {
    out: 'tours/half-day-panorama.webp', width: 1600, orient: 'landscape',
    queries: ['Lisbon Falls Mpumalanga', 'Berlin Falls Mpumalanga', "Pilgrim's Rest"],
  },
  {
    out: 'tours/or-tambo-transfer.webp', width: 1600, orient: 'landscape',
    queries: ['Category:Roads in Mpumalanga'], mustMatch: 'Blyde|road|Pass|canyon',
  },
];

// Ordered by preference: a CC0 result beats a CC BY-SA one.
const ALLOWED_LICENCES = [
  'cc0', 'public domain', 'cc by 2.0', 'cc by 3.0', 'cc by 4.0',
  'cc by-sa 2.0', 'cc by-sa 3.0', 'cc by-sa 4.0',
];

function allowedLicenceIndex(licence) {
  const lower = licence.toLowerCase();
  return ALLOWED_LICENCES.findIndex((allowed) => lower.includes(allowed));
}

/**
 * A query string runs a free-text search; a "Category:..." query lists that
 * category's files instead. Categories are curated and far more reliable —
 * free text matched a 1920s American football photo for "Long Tom Pass" and a
 * bird for "safari tent", because it searches descriptions, not subjects.
 */
async function search(query) {
  const url = new URL(API);
  url.searchParams.set('action', 'query');

  if (query.startsWith('Category:')) {
    url.searchParams.set('generator', 'categorymembers');
    url.searchParams.set('gcmtitle', query);
    url.searchParams.set('gcmtype', 'file');
    url.searchParams.set('gcmlimit', '40');
  } else {
    url.searchParams.set('generator', 'search');
    url.searchParams.set('gsrsearch', query);
    url.searchParams.set('gsrnamespace', '6');
    url.searchParams.set('gsrlimit', '20');
  }

  url.searchParams.set('prop', 'imageinfo');
  url.searchParams.set('iiprop', 'url|extmetadata|size');
  url.searchParams.set('format', 'json');

  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  const json = await res.json();
  const pages = json.query?.pages ?? {};

  return Object.values(pages)
    .map((page) => {
      const ii = page.imageinfo?.[0];
      if (!ii) return null;
      return {
        title: page.title,
        url: ii.url,
        width: ii.width,
        height: ii.height,
        licence: ii.extmetadata?.LicenseShortName?.value || '',
        artist: (ii.extmetadata?.Artist?.value || 'Unknown')
          .replace(/<[^>]+>/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 120),
        descriptionurl: ii.descriptionurl,
      };
    })
    .filter(Boolean);
}

function pick(candidates, orient, mustMatch) {
  const extOK = new Set(['.jpg', '.jpeg', '.png']);

  const filtered = candidates.filter((c) => {
    // Optional keyword steer, used to narrow a broad category to the subject
    // actually wanted — e.g. only the lodge photos within "Hotels in Mpumalanga".
    if (mustMatch && !new RegExp(mustMatch, 'i').test(c.title)) return false;
    // The API appends UTM query params to image URLs, so strip them before
    // reading the extension — otherwise extname() returns ".jpg?utm_source=...".
    const ext = path.extname(c.url.split('?')[0]).toLowerCase();
    if (!extOK.has(ext)) return false;
    if (allowedLicenceIndex(c.licence) === -1) return false;
    return Math.max(c.width, c.height) >= 1200;
  });

  if (filtered.length === 0) return null;

  filtered.sort((a, b) => {
    // Shape first — a landscape slot wants a landscape source — then licence
    // preference, then raw resolution.
    const fits = (c) =>
      orient === 'landscape' ? (c.width > c.height ? 0 : 1) : (c.height >= c.width ? 0 : 1);
    if (fits(a) !== fits(b)) return fits(a) - fits(b);

    const licA = allowedLicenceIndex(a.licence);
    const licB = allowedLicenceIndex(b.licence);
    if (licA !== licB) return licA - licB;

    return b.width * b.height - a.width * a.height;
  });

  return filtered[0];
}

async function loadManifest(manifestPath) {
  try {
    return JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  } catch {
    return [];
  }
}

async function main() {
  const filter = process.argv[2];
  const targets = filter ? TARGETS.filter((t) => t.out.includes(filter)) : TARGETS;

  const publicDir = path.join(process.cwd(), 'public', 'images');
  const manifestPath = path.join(process.cwd(), 'docs', 'stock-manifest.json');
  const records = await loadManifest(manifestPath);

  for (const target of targets) {
    try {
      let chosen = null;
      let usedQuery = null;

      for (const query of target.queries) {
        const candidates = await search(query);
        chosen = pick(candidates, target.orient, target.mustMatch);
        if (chosen) {
          usedQuery = query;
          break;
        }
      }

      if (!chosen) {
        console.error(`MISS ${target.out} — nothing qualified for: ${target.queries.join(' | ')}`);
        continue;
      }

      const imgResponse = await fetch(chosen.url, { headers: { 'User-Agent': UA } });
      if (!imgResponse.ok) {
        console.error(`FAIL ${target.out} — download ${imgResponse.status}`);
        continue;
      }

      const width = target.width;
      const height =
        target.orient === 'landscape'
          ? Math.round((width * 9) / 16)
          : Math.round((width * 11) / 7);

      const outPath = path.join(publicDir, target.out);
      await fs.mkdir(path.dirname(outPath), { recursive: true });

      await sharp(Buffer.from(await imgResponse.arrayBuffer()))
        .resize({ width, height, fit: 'cover', position: 'attention' })
        .webp({ quality: 82 })
        .toFile(outPath);

      console.log(`OK ${target.out} (${width}x${height}) ${chosen.licence} — ${chosen.artist}`);

      const record = {
        file: target.out,
        query: usedQuery,
        title: chosen.title,
        licence: chosen.licence,
        artist: chosen.artist,
        source: chosen.descriptionurl,
      };
      const existing = records.findIndex((r) => r.file === target.out);
      if (existing === -1) records.push(record);
      else records[existing] = record;
    } catch (err) {
      console.error(`FAIL ${target.out} — ${err.message}`);
    }
  }

  records.sort((a, b) => a.file.localeCompare(b.file));
  await fs.mkdir(path.dirname(manifestPath), { recursive: true });
  await fs.writeFile(manifestPath, JSON.stringify(records, null, 2));
  console.log(`manifest holds ${records.length} images at docs/stock-manifest.json`);
}

await main();
