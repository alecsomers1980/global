/**
 * Seed Diana's agent list into Supabase — South Africa + international.
 *   npm run seed-dealers
 *
 * Reads seed/dealers.json (SA, built by `python scripts/parse_dealers.py`)
 * and seed/dealers-international.json (Namibia/Botswana/Mozambique, hand-built
 * — 13 agents wasn't worth writing a second parser for). Idempotent: upserts
 * on `seed_key`, so re-running after Diana edits either list updates rows
 * rather than duplicating them. Dealers added by hand in the admin have a
 * null seed_key and are never touched by this.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SERVICE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const db = createClient(URL, SERVICE, { auth: { persistSession: false } });

const sa = JSON.parse(readFileSync(join(root, "seed/dealers.json"), "utf8"));
const intl = JSON.parse(
  readFileSync(join(root, "seed/dealers-international.json"), "utf8")
);
const dealers = [...sa, ...intl];

const slug = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

async function main() {
  const rows = dealers.map((d, i) => {
    const country = d.country || "South Africa";
    const phoneKey = d.phone.replace(/\s/g, "") || slug(d.name);
    // South African rows keep their ORIGINAL key format (province:phone, no
    // country prefix) — those 150 rows are already seeded, and changing the
    // format here would break the upsert match and insert 150 duplicates
    // instead of updating them. Province, not country, is what disambiguates
    // SA agents: several legitimately cover the same phone in two provinces
    // (e.g. Elize Aucamp — Free State Sasolburg and Gauteng Vaalpark are
    // separate listings in Diana's source).
    // International dealers have no province, so they're keyed by country
    // instead — a namespace that can never collide with a real SA province.
    const keyPrefix = country === "South Africa" ? slug(d.province ?? "") : slug(country);
    return {
      seed_key: `${keyPrefix}:${phoneKey}`,
      name: d.name,
      business: d.business ?? "",
      country,
      province: d.province ?? "",
      region: d.region ?? "",
      areas: d.areas ?? [],
      phone: d.phone ?? "",
      phone_alt: d.phone_alt ?? "",
      email: d.email ?? "",
      notes: d.notes ?? "",
      is_depot: Boolean(d.is_depot),
      active: true,
      sort: i,
    };
  });

  const keys = new Set(rows.map((r) => r.seed_key));
  if (keys.size !== rows.length) {
    const seen = new Set();
    const dupes = rows.filter((r) => (seen.has(r.seed_key) ? true : (seen.add(r.seed_key), false)));
    console.error(
      `Duplicate seed_key — ${rows.length} rows but ${keys.size} keys. Aborting.\n` +
        `Duplicates: ${dupes.map((r) => `${r.name} (${r.seed_key})`).join(", ")}`
    );
    process.exit(1);
  }

  const { error } = await db.from("dealers").upsert(rows, { onConflict: "seed_key" });
  if (error) throw error;

  const { count } = await db.from("dealers").select("*", { count: "exact", head: true });
  console.log(`Seeded ${rows.length} dealers. Table now holds ${count}.`);

  const byCountry = {};
  for (const r of rows) byCountry[r.country] = (byCountry[r.country] ?? 0) + 1;
  for (const [c, n] of Object.entries(byCountry).sort()) {
    console.log(`  ${c.padEnd(16)} ${n}`);
  }
}

main().catch((e) => {
  console.error("Seed failed:", e.message ?? e);
  process.exit(1);
});
