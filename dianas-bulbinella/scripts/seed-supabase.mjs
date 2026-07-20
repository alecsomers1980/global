/**
 * Seed Supabase from the existing demo JSON.
 * Run: npm run seed  (which is `node --env-file=.env.local scripts/seed-supabase.mjs`)
 * Idempotent — upserts on slug, safe to re-run.
 *
 * Optional admin bootstrap: set ADMIN_EMAIL + ADMIN_PASSWORD in .env.local to
 * create/promote a Supabase Auth admin user for /admin login.
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

const products = JSON.parse(readFileSync(join(root, "src/data/products.json"), "utf8"));
const categories = JSON.parse(readFileSync(join(root, "src/data/categories.json"), "utf8"));

async function main() {
  // 1) categories
  {
    const rows = categories.map((c) => ({
      slug: c.slug, name: c.name, kind: c.kind, blurb: c.blurb ?? "", sort: c.sort ?? 0,
    }));
    const { error } = await db.from("categories").upsert(rows, { onConflict: "slug" });
    if (error) throw new Error("categories: " + error.message);
    console.log(`✓ categories upserted: ${rows.length}`);
  }

  // 2) products
  {
    const rows = products.map((p) => ({
      legacy_id: typeof p.id === "number" ? p.id : null,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt ?? "",
      price: p.price ?? 0,
      stock: p.stock ?? "instock",
      image: p.image ?? "",
      format: p.format ?? "",
      size: p.size ?? "",
      concerns: p.concerns ?? [],
      ranges: p.ranges ?? [],
      categories: p.categories ?? [],
      active: true,
    }));
    // upsert in chunks
    for (let i = 0; i < rows.length; i += 200) {
      const chunk = rows.slice(i, i + 200);
      const { error } = await db.from("products").upsert(chunk, { onConflict: "slug" });
      if (error) throw new Error("products: " + error.message);
    }
    console.log(`✓ products upserted: ${rows.length}`);
  }

  // 3) July Promotions special from the products that carry a salePrice
  {
    const onSale = products.filter((p) => p.salePrice != null);
    // map slug -> product uuid
    const { data: prodRows, error: e1 } = await db
      .from("products").select("id, slug").in("slug", onSale.map((p) => p.slug));
    if (e1) throw new Error("fetch product ids: " + e1.message);
    const idBySlug = new Map(prodRows.map((r) => [r.slug, r.id]));

    // find or create the special
    const NAME = "July Promotions";
    let specialId;
    const { data: existing } = await db.from("specials").select("id").eq("name", NAME).maybeSingle();
    if (existing) {
      specialId = existing.id;
    } else {
      const { data: created, error: e2 } = await db.from("specials")
        .insert({ name: NAME, starts_on: "2026-07-01", ends_on: "2026-07-31",
                  note: "Migrated from the WooCommerce July sale." })
        .select("id").single();
      if (e2) throw new Error("create special: " + e2.message);
      specialId = created.id;
    }

    const items = onSale
      .filter((p) => idBySlug.has(p.slug))
      .map((p) => ({ special_id: specialId, product_id: idBySlug.get(p.slug), special_price: p.salePrice }));
    const { error: e3 } = await db.from("special_items")
      .upsert(items, { onConflict: "special_id,product_id" });
    if (e3) throw new Error("special_items: " + e3.message);
    console.log(`✓ "${NAME}" special: ${items.length} items (2026-07-01 → 2026-07-31)`);
  }

  // 4) optional admin bootstrap
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const email = process.env.ADMIN_EMAIL;
    const { data: created, error } = await db.auth.admin.createUser({
      email, password: process.env.ADMIN_PASSWORD, email_confirm: true,
    });
    let userId = created?.user?.id;
    if (error && !/already/i.test(error.message)) throw new Error("admin user: " + error.message);
    if (!userId) {
      const { data: list } = await db.auth.admin.listUsers();
      userId = list?.users?.find((u) => u.email === email)?.id;
    }
    if (userId) {
      await db.from("profiles").upsert({ id: userId, email, role: "admin" }, { onConflict: "id" });
      console.log(`✓ admin ready: ${email}`);
    }
  } else {
    console.log("· skipped admin bootstrap (set ADMIN_EMAIL + ADMIN_PASSWORD to enable)");
  }

  console.log("\nSeed complete.");
}

main().catch((e) => { console.error("\nSEED FAILED:", e.message); process.exit(1); });
