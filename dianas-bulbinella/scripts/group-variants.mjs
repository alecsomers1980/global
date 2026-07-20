/**
 * One-time data curation pass: merge products that are really the same item
 * in different sizes (e.g. "Acne Control Serum - 10ml" / "- 100ml") into a
 * single parent product with multiple `product_variants` rows.
 *
 * Requires migration 0002_product_variants.sql to have run first (every
 * product already has exactly one variant carrying its old price/stock/image/size).
 *
 * Dry run (default) — prints a report and writes it to
 * docs/variant-groups-report.md. Nothing in the database changes.
 *   node --env-file=.env.local scripts/group-variants.mjs
 *
 * Apply — after you've read the report and are happy with the groupings:
 *   node --env-file=.env.local scripts/group-variants.mjs --apply
 */
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const APPLY = process.argv.includes("--apply");

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SERVICE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const db = createClient(URL, SERVICE, { auth: { persistSession: false } });

// Trailing " - 100ml" / " - 250g" style suffix, optionally followed by a
// leftover parenthetical clearance note like "(was R140)".
const SIZE_SUFFIX_RE = /\s*[-–]\s*(\d+(?:\.\d+)?\s*(?:ml|g|kg|l))\s*(?:\(.*?\)\s*)?$/i;
// Trailing capsule/tablet count, e.g. "... Capsules 60's".
const COUNT_SUFFIX_RE = /\s+(\d+)'s\s*(?:\(.*?\)\s*)?$/i;

function splitSize(title) {
  let m = title.match(SIZE_SUFFIX_RE);
  if (m) return { base: title.slice(0, m.index).trim(), size: m[1].replace(/\s+/g, "") };
  m = title.match(COUNT_SUFFIX_RE);
  if (m) return { base: title.slice(0, m.index).trim(), size: `${m[1]}'s` };
  return null;
}

function slugify(s) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents (è -> e) so slugs stay ASCII-clean
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Grouping key ignores bracket-style punctuation so a typo'd bracket type
// ("(...)" vs "{...)") doesn't split what's really one product into two
// same-slug groups — e.g. "Black Ointment (Natural Drawing Ointment)" vs
// "Black Ointment {Natural Drawing Ointment)".
function groupKey(base) {
  return slugify(base);
}

function sizeMagnitude(size) {
  const m = size.match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : 0;
}

function unionArrays(...arrs) {
  return [...new Set(arrs.flat())];
}

async function main() {
  const { data: products, error } = await db
    .from("products")
    .select("id, slug, title, excerpt, format, concerns, ranges, categories, active")
    .order("title");
  if (error) throw new Error("fetch products: " + error.message);

  const { data: variants, error: vErr } = await db
    .from("product_variants")
    .select("id, product_id, size, price, image, stock");
  if (vErr) throw new Error("fetch product_variants: " + vErr.message);

  const variantByProduct = new Map(variants.map((v) => [v.product_id, v]));
  const existingSlugs = new Set(products.map((p) => p.slug));

  const groups = new Map(); // base title -> members[]
  const noSizeDetected = [];

  for (const p of products) {
    const split = splitSize(p.title);
    const variant = variantByProduct.get(p.id);
    if (!split || !variant) {
      noSizeDetected.push(p);
      continue;
    }
    const key = groupKey(split.base);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ product: p, variant, base: split.base, size: split.size });
  }

  const multiGroups = [...groups.values()].filter((g) => g.length > 1);
  const singles = [...groups.values()].filter((g) => g.length === 1);

  // ── report ──
  const lines = [];
  lines.push(`# Variant grouping report`);
  lines.push(``);
  lines.push(`Scanned ${products.length} products.`);
  lines.push(`- ${multiGroups.length} groups detected with 2+ sizes (${multiGroups.reduce((n, g) => n + g.length, 0)} products total)`);
  lines.push(`- ${singles.length} products with a size suffix but no sibling (left as single-variant products)`);
  lines.push(`- ${noSizeDetected.length} products with no size suffix detected (left untouched — review manually if any of these should have grouped)`);
  lines.push(``);
  lines.push(`## Groups (2+ sizes) ${APPLY ? "— APPLIED" : "— proposed, dry run"}`);
  for (const g of multiGroups.sort((a, b) => a[0].base.localeCompare(b[0].base))) {
    const newSlug = slugify(g[0].base);
    lines.push(``);
    lines.push(`### ${g[0].base}  →  \`${newSlug}\``);
    for (const m of g.sort((a, b) => sizeMagnitude(a.size) - sizeMagnitude(b.size))) {
      lines.push(`- \`${m.product.slug}\` — ${m.size} — R${m.variant.price} — ${m.variant.image}`);
    }
  }
  if (noSizeDetected.length) {
    lines.push(``);
    lines.push(`## No size suffix detected`);
    for (const p of noSizeDetected) lines.push(`- \`${p.slug}\` — ${p.title}`);
  }

  const reportPath = join(root, "docs/variant-groups-report.md");
  writeFileSync(reportPath, lines.join("\n") + "\n");
  console.log(lines.join("\n"));
  console.log(`\nReport written to ${reportPath}`);

  if (!APPLY) {
    console.log(`\nDry run only — nothing changed. Re-run with --apply once you've reviewed the report.`);
    return;
  }

  // ── apply ──
  console.log(`\nApplying ${multiGroups.length} groups...`);
  for (const g of multiGroups) {
    const sorted = [...g].sort((a, b) => a.product.slug.localeCompare(b.product.slug));
    const parent = sorted[0];

    let newSlug = slugify(parent.base);
    const otherSlugs = new Set([...existingSlugs].filter((s) => !g.some((m) => m.product.slug === s)));
    if (otherSlugs.has(newSlug)) {
      console.warn(`  ! slug collision for "${newSlug}", keeping original slug "${parent.product.slug}"`);
      newSlug = parent.product.slug;
    }

    const concerns = unionArrays(...g.map((m) => m.product.concerns ?? []));
    const ranges = unionArrays(...g.map((m) => m.product.ranges ?? []));
    const categories = unionArrays(...g.map((m) => m.product.categories ?? []));
    const excerpt = g.map((m) => m.product.excerpt ?? "").sort((a, b) => b.length - a.length)[0] ?? "";
    const format = g.find((m) => m.product.format)?.product.format ?? "";

    const { error: updErr } = await db
      .from("products")
      .update({ title: parent.base, slug: newSlug, excerpt, format, concerns, ranges, categories, active: true })
      .eq("id", parent.product.id);
    if (updErr) {
      console.error(`  ✗ ${parent.base}: parent update failed — ${updErr.message}`);
      continue;
    }

    const bySize = [...g].sort((a, b) => sizeMagnitude(a.size) - sizeMagnitude(b.size));
    for (let i = 0; i < bySize.length; i++) {
      const { error: vUpdErr } = await db
        .from("product_variants")
        .update({ product_id: parent.product.id, sort_order: i })
        .eq("id", bySize[i].variant.id);
      if (vUpdErr) console.error(`  ✗ ${parent.base}: variant repoint failed — ${vUpdErr.message}`);
    }

    const toDelete = g.filter((m) => m.product.id !== parent.product.id).map((m) => m.product.id);
    if (toDelete.length) {
      const { error: delErr } = await db.from("products").delete().in("id", toDelete);
      if (delErr) console.error(`  ✗ ${parent.base}: delete of merged rows failed — ${delErr.message}`);
    }

    console.log(`  ✓ ${parent.base} — ${g.length} sizes merged`);
  }
  console.log(`\nDone.`);
}

main().catch((e) => {
  console.error("\nGROUP-VARIANTS FAILED:", e.message);
  process.exit(1);
});
