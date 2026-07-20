/**
 * Resolve legacy order_items -> a live product id.
 *
 * WHY: the 4,626 imported Woo orders have `product_slug = ''` and
 * `variant_id = null` — the old catalogue was one product per SIZE
 * ("Bulbinella Cream 500g"), and the rebuild merged those into one product
 * ("Bulbinella Cream") with a 500g variant. Nothing links a legacy purchase to
 * a current product, so without this every one of Diana's 1,885 existing
 * customers would fail the reviews verified-buyer gate.
 *
 * HOW: strip the trailing size token from the legacy title and match it against
 * live product titles. Unmatched rows are left null — that purchase simply
 * isn't reviewable. We never guess.
 *
 * Usage:
 *   npm run backfill-order-products          # dry run — prints the match report
 *   npm run backfill-order-products:apply    # writes product_id
 */
import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/** Page past PostgREST's hard 1000-row cap (see src/lib/db.ts). */
async function fetchAll(table, select, tweak = (q) => q) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await tweak(
      supabase.from(table).select(select).range(from, from + 999)
    );
    if (error) throw new Error(`${table}: ${error.message}`);
    out.push(...data);
    if (data.length < 1000) return out;
  }
}

/** Drop the size token so "Bulbinella Cream 500g" -> "bulbinella cream". */
function normalise(title) {
  return (title ?? "")
    .toLowerCase()
    .replace(/\b\d+\s?(ml|g|kg|s|caps?|capsules?|tabs?|tablets)\b/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const products = await fetchAll("products", "id, title, slug");

// Ambiguity guard: if two live products normalise to the same key we cannot
// tell them apart, so we refuse to match that key at all rather than guess.
const byKey = new Map();
const ambiguous = new Set();
for (const p of products) {
  const key = normalise(p.title);
  if (!key) continue;
  if (byKey.has(key)) ambiguous.add(key);
  byKey.set(key, p);
}
for (const key of ambiguous) byKey.delete(key);

const items = await fetchAll("order_items", "id, product_title, product_slug, product_id");

let matched = 0;
let skippedAlready = 0;
let skippedHasSlug = 0;
const unmatched = new Map();
const updates = [];

for (const item of items) {
  if (item.product_id) {
    skippedAlready++;
    continue;
  }
  // New orders already carry a real slug — the gate matches those directly.
  if (item.product_slug) {
    skippedHasSlug++;
    continue;
  }
  const hit = byKey.get(normalise(item.product_title));
  if (hit) {
    matched++;
    updates.push({ id: item.id, product_id: hit.id });
  } else {
    unmatched.set(item.product_title, (unmatched.get(item.product_title) ?? 0) + 1);
  }
}

console.log(`\nLegacy order_items resolved to live products`);
console.log(`  line items scanned      ${items.length}`);
console.log(`  already linked          ${skippedAlready}`);
console.log(`  have a slug (new order) ${skippedHasSlug}`);
console.log(`  matched by title        ${matched}`);
console.log(`  unmatched (left null)   ${[...unmatched.values()].reduce((a, b) => a + b, 0)}`);
if (ambiguous.size) {
  console.log(`  ambiguous titles skipped ${ambiguous.size}: ${[...ambiguous].join(", ")}`);
}

console.log(`\nTop unmatched titles (mostly the compliance-blocked products not yet seeded):`);
[...unmatched.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)
  .forEach(([title, n]) => console.log(`  ${String(n).padStart(4)}x  ${title}`));

if (!APPLY) {
  console.log(`\nDry run — nothing written. Re-run with --apply to save.\n`);
  process.exit(0);
}

// Chunked updates; PostgREST has no bulk-update-by-id, so group by product_id
// and use .in() on the item ids (~200 per call to stay inside URL limits).
const byProduct = new Map();
for (const u of updates) {
  if (!byProduct.has(u.product_id)) byProduct.set(u.product_id, []);
  byProduct.get(u.product_id).push(u.id);
}

let written = 0;
for (const [productId, ids] of byProduct) {
  for (let i = 0; i < ids.length; i += 200) {
    const chunk = ids.slice(i, i + 200);
    const { error } = await supabase
      .from("order_items")
      .update({ product_id: productId })
      .in("id", chunk);
    if (error) throw new Error(`update failed: ${error.message}`);
    written += chunk.length;
  }
  process.stdout.write(`\r  written ${written}/${updates.length}`);
}

console.log(`\n\nDone — ${written} line items linked to a live product.\n`);
