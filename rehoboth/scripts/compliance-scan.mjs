/**
 * Fail the build if any product copy carries a medical claim.
 *
 * Screens two sources:
 *   1. scripts/catalog-data.mjs — the copy we ship (always checked)
 *   2. the live `products` table   — catches anything typed into the admin
 *      (skipped when Supabase env is absent, e.g. on a fresh clone)
 *
 * Exits 1 on any hit. This is the gate referenced in the spec's success
 * criteria: "zero disease-claim terms in any title, slug, body, alt text or
 * meta description".
 *
 * Run: npm run compliance:scan
 */
import { screen } from "../src/lib/compliance.ts";
import { PRODUCTS } from "./catalog-data.mjs";

const FIELDS = [
  "name",
  "slug",
  "summary",
  "traditional_use",
  "ingredients",
  "directions",
  "storage",
];

let failures = 0;
let checked = 0;

function inspect(label, row) {
  for (const field of FIELDS) {
    const value = row[field];
    if (!value) continue;
    checked++;
    const { flagged, hits } = screen(value);
    if (flagged) {
      failures++;
      console.error(`\n  ✗ ${label} · ${field}`);
      console.error(`    terms: ${hits.join(", ")}`);
      console.error(`    text:  ${String(value).slice(0, 160)}`);
    }
  }
}

console.log("Screening catalogue copy…");
for (const p of PRODUCTS) inspect(`seed:${p.slug}`, p);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (url && key) {
  const { createClient } = await import("@supabase/supabase-js");
  const db = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await db.from("products").select("*");
  if (error) {
    console.error(`\nCould not read products table: ${error.message}`);
    process.exit(1);
  }
  console.log(`Screening ${data.length} rows from the database…`);
  for (const row of data) inspect(`db:${row.slug}`, row);
} else {
  console.log("(Supabase env absent — skipping the live table.)");
}

if (failures > 0) {
  console.error(
    `\nFAILED — ${failures} field${failures === 1 ? " carries" : "s carry"} a medical claim.`
  );
  console.error("See docs/label-claims-note-for-client.md for why this matters.\n");
  process.exit(1);
}

console.log(`\nClean — ${checked} fields screened, 0 hits.`);
