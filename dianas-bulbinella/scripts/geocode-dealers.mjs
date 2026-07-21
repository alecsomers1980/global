/**
 * Geocode dealers for the "find a dealer" map.
 *   npm run geocode-dealers          # dry run — shows what it would resolve
 *   npm run geocode-dealers:apply    # writes latitude/longitude to Supabase
 *   npm run geocode-dealers:apply -- --refresh   # re-geocode ALL, not just missing
 *
 * Needs migration 0013_dealer_geocode.sql applied first (adds latitude/longitude).
 *
 * Uses OpenStreetMap Nominatim (free, no key). Their usage policy requires a
 * real User-Agent and a MAX of 1 request/second — we sleep 1.1s between calls,
 * so ~163 dealers takes ~3 minutes. Idempotent: only geocodes rows missing
 * coordinates unless --refresh. A dealer that can't be resolved is left null
 * (the map just skips it) rather than pinned to the wrong place.
 */
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SERVICE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const APPLY = process.argv.includes("--apply");
const REFRESH = process.argv.includes("--refresh");
const supabase = createClient(URL, SERVICE);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Build the most specific place string we can for a dealer. */
function queryFor(d) {
  const town = (d.areas && d.areas[0]) || "";
  const parts = [town, d.province, d.country].map((s) => (s || "").trim()).filter(Boolean);
  // De-dupe (e.g. town === province) while preserving order.
  return [...new Set(parts)].join(", ");
}

async function geocode(q) {
  const url =
    "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
    encodeURIComponent(q);
  const res = await fetch(url, {
    headers: {
      "User-Agent": "DianasBulbinella-DealerMap/1.0 (https://dianas.co.za; admin contact)",
      "Accept-Language": "en",
    },
  });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const json = await res.json();
  if (!Array.isArray(json) || json.length === 0) return null;
  const { lat, lon } = json[0];
  return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
}

async function main() {
  const { data: dealers, error } = await supabase
    .from("dealers")
    .select("id, name, areas, province, country, latitude, longitude")
    .order("country")
    .order("province");
  if (error) throw error;

  const todo = dealers.filter((d) => REFRESH || d.latitude == null || d.longitude == null);
  console.log(
    `${dealers.length} dealers total; ${todo.length} to geocode ${REFRESH ? "(refresh all)" : "(missing only)"}. ${APPLY ? "APPLY" : "DRY RUN"}`
  );

  let ok = 0;
  let miss = 0;
  for (const d of todo) {
    const q = queryFor(d);
    if (!q) {
      console.log(`  SKIP  (no place) ${d.name}`);
      miss++;
      continue;
    }
    try {
      const coords = await geocode(q);
      if (!coords) {
        console.log(`  MISS  "${q}"  (${d.name})`);
        miss++;
      } else {
        console.log(`  OK    "${q}" -> ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
        ok++;
        if (APPLY) {
          const { error: upErr } = await supabase
            .from("dealers")
            .update({ latitude: coords.latitude, longitude: coords.longitude })
            .eq("id", d.id);
          if (upErr) console.error(`        update failed: ${upErr.message}`);
        }
      }
    } catch (e) {
      console.error(`  ERR   "${q}": ${e.message}`);
      miss++;
    }
    await sleep(1100); // Nominatim: max 1 req/sec.
  }

  console.log(`\nDone. resolved=${ok} unresolved=${miss}. ${APPLY ? "Written to DB." : "Dry run — re-run with --apply to write."}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
