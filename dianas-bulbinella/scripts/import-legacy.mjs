/**
 * Import the old WooCommerce customers + orders into Supabase.
 *
 *   npm run import-legacy            # dry run: reports what WOULD happen
 *   npm run import-legacy:apply      # writes
 *
 * Reads intake/legacy/{customers,orders}.json — produced by scripts/extract_woo.py.
 * Requires migrations 0004 (orders) and 0007 (legacy flag) to have been run.
 *
 * Idempotent by design, so a half-finished run can simply be re-run:
 *   - auth users are matched by email before being created;
 *   - orders upsert on `order_number` ('WC-<old id>'), which is unique.
 *
 * PASSWORDS ARE NOT MIGRATED — they can't be. The dump holds phpass ($P$) and
 * WordPress 6.8 ($wp$) hashes; Supabase Auth takes bcrypt/argon2, and $wp$ is
 * bcrypt over an HMAC-SHA384 pre-hash so it won't verify either. Accounts are
 * created WITHOUT a password and WITHOUT an invite email (createUser, not
 * inviteUserByEmail — 1,885 people must not get mail out of the blue).
 * Returning customers use "Forgot password" once.
 *
 * STATUS MAPPING — see WC_STATUS_MAP below. Confirmed with the client
 * 2026-07-16: 'wc-on-hold' means she WAS paid but never updated WooCommerce,
 * so it imports as paid. orders.legacy_status keeps the original value, so
 * that call can be reversed with one UPDATE if it turns out to be wrong.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
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

const APPLY = process.argv.includes("--apply");
const db = createClient(URL, SERVICE, { auth: { persistSession: false } });

const dir = join(root, "intake", "legacy");
for (const f of ["customers.json", "orders.json"]) {
  if (!existsSync(join(dir, f))) {
    console.error(`Missing ${join(dir, f)} — run: python scripts/extract_woo.py`);
    process.exit(1);
  }
}
const customers = JSON.parse(readFileSync(join(dir, "customers.json"), "utf8"));
const orders = JSON.parse(readFileSync(join(dir, "orders.json"), "utf8"));

/** WooCommerce status -> our vocabulary (src/lib/orders.ts). */
const WC_STATUS_MAP = {
  "wc-on-hold": "paid",       // client: paid by EFT, never marked in Woo
  "wc-processing": "paid",    // payment received, was being fulfilled
  "wc-cancelled": "cancelled",
  "wc-pending": "received",   // never paid
  "wc-failed": "cancelled",
  "wc-refunded": "cancelled",
  "wc-completed": "shipped",
};

const PAID = new Set(["paid", "completed", "shipped", "collected"]);

/**
 * WooCommerce dates come in two shapes:
 *   post_date  -> "2026-07-09 09:57:01", naive local time (SAST, UTC+2)
 *   _date_paid -> "1642239621", Unix epoch SECONDS
 * Returns null rather than throwing on anything unparseable.
 */
function toIso(wpDate) {
  if (!wpDate) return null;
  const raw = String(wpDate).trim();
  if (!raw || raw.startsWith("0000")) return null;

  const d = /^\d+$/.test(raw)
    ? new Date(Number(raw) * 1000)
    : new Date(raw.replace(" ", "T") + "+02:00");

  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

const log = (...a) => console.log(...a);

async function run(label, fn) {
  process.stdout.write(`${label} … `);
  const result = await fn();
  console.log("done");
  return result;
}

/** Page through every existing auth user once, rather than probing 1,885 times. */
async function loadExistingUsers() {
  const map = new Map();
  for (let page = 1; ; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    for (const u of data.users) if (u.email) map.set(u.email.toLowerCase(), u.id);
    if (data.users.length < 1000) break;
  }
  return map;
}

/**
 * Fail before touching anything if the schema isn't ready. Without this, a
 * missing 0007 means 1,885 auth users get created and THEN the order insert
 * blows up — a half-import that's confusing to reason about.
 */
async function preflight() {
  const { error } = await db.from("orders").select("legacy, legacy_status").limit(1);
  if (error) {
    console.error(
      "\nSchema check failed:", error.message,
      "\n\nRun supabase/migrations/0007_legacy_orders.sql in the Supabase SQL editor first.\n"
    );
    process.exit(1);
  }
}

async function main() {
  log(`\n${APPLY ? "APPLYING" : "DRY RUN"} — ${customers.length} customers, ${orders.length} orders\n`);
  await preflight();

  const existing = await run("Loading existing auth users", loadExistingUsers);
  log(`  ${existing.size} already in Supabase`);

  // ── 1. Customers -> auth users ──
  const idByWpId = new Map();
  let created = 0, matched = 0;
  const userErrors = [];

  for (const c of customers) {
    const found = existing.get(c.email);
    if (found) {
      idByWpId.set(c.wp_id, found);
      matched++;
      continue;
    }
    if (!APPLY) {
      created++;
      continue;
    }
    const { data, error } = await db.auth.admin.createUser({
      email: c.email,
      email_confirm: true, // no confirmation mail; they've been customers for years
      user_metadata: { full_name: c.full_name },
    });
    if (error) {
      userErrors.push(`${c.email}: ${error.message}`);
      continue;
    }
    idByWpId.set(c.wp_id, data.user.id);
    existing.set(c.email, data.user.id);
    created++;
    if (created % 100 === 0) log(`  … ${created} accounts created`);
  }
  log(`Accounts: ${created} ${APPLY ? "created" : "would be created"}, ${matched} already existed`);
  if (userErrors.length) {
    log(`  ⚠ ${userErrors.length} failed:`);
    userErrors.slice(0, 10).forEach((e) => log(`    ${e}`));
  }

  // ── 2. Profiles (the signup trigger makes the row; fill in the rest) ──
  if (APPLY && idByWpId.size) {
    const rows = customers
      .filter((c) => idByWpId.has(c.wp_id))
      .map((c) => ({
        id: idByWpId.get(c.wp_id),
        email: c.email,
        full_name: c.full_name,
        phone: c.phone,
        role: "customer",
        // Deliberately NOT opting anyone in. The daily reorder-reminder cron
        // only mails marketing_opt_in = true, and nobody here has consented.
        marketing_opt_in: false,
      }));
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await db.from("profiles").upsert(rows.slice(i, i + 500), {
        onConflict: "id",
      });
      if (error) throw error;
    }
    log(`Profiles: ${rows.length} upserted`);
  }

  // ── 3. Saved addresses ──
  if (APPLY) {
    const rows = customers
      .filter((c) => idByWpId.has(c.wp_id) && c.address.line1)
      .map((c) => ({
        user_id: idByWpId.get(c.wp_id),
        label: "Billing",
        recipient: c.full_name,
        phone: c.phone,
        line1: c.address.line1,
        line2: c.address.line2,
        city: c.address.city,
        province: c.address.province,
        postal_code: c.address.postal_code,
        is_default: true,
      }));
    // Only seed an address for customers who have none, so re-runs don't pile up.
    const { data: haveAddr } = await db
      .from("customer_addresses")
      .select("user_id");
    const seen = new Set((haveAddr ?? []).map((a) => a.user_id));
    const fresh = rows.filter((r) => !seen.has(r.user_id));
    for (let i = 0; i < fresh.length; i += 500) {
      const { error } = await db.from("customer_addresses").insert(fresh.slice(i, i + 500));
      if (error) throw error;
    }
    log(`Addresses: ${fresh.length} inserted (${rows.length - fresh.length} already had one)`);
  }

  // ── 4. Orders ──
  // On a dry run no accounts exist yet, so idByWpId is empty and every order
  // would look like a guest order. Predict linkage from the extract instead.
  const willHaveAccount = new Set(customers.map((c) => c.wp_id));
  const linkable = orders.filter(
    (o) => o.customer_wp_id && willHaveAccount.has(o.customer_wp_id)
  ).length;

  const statusTally = {};
  const orderRows = orders.map((o) => {
    const status = WC_STATUS_MAP[o.wc_status] ?? "received";
    statusTally[`${o.wc_status} -> ${status}`] =
      (statusTally[`${o.wc_status} -> ${status}`] ?? 0) + 1;
    const createdAt = toIso(o.date);
    return {
      order_number: o.order_number,
      user_id: o.customer_wp_id ? idByWpId.get(o.customer_wp_id) ?? null : null,
      email: o.email || "unknown@dianas.co.za",
      full_name: o.full_name,
      phone: o.phone,
      delivery_method: "delivery",
      delivery_address: o.address,
      collection_point: "",
      subtotal: o.subtotal,
      shipping: o.shipping,
      total: o.total,
      status,
      legacy: true,
      legacy_status: o.wc_status,
      payment_id: null,
      paid_at: PAID.has(status) ? toIso(o.paid_date) ?? createdAt : null,
      created_at: createdAt,
    };
  });

  log("\nStatus mapping:");
  for (const [k, v] of Object.entries(statusTally)) log(`  ${k.padEnd(30)} ${v}`);

  const revenue = orderRows
    .filter((o) => PAID.has(o.status))
    .reduce((s, o) => s + o.total, 0);
  log(`\nCounts as revenue: R${revenue.toLocaleString("en-ZA", { minimumFractionDigits: 2 })} across ${
    orderRows.filter((o) => PAID.has(o.status)).length} orders`);
  const linked = APPLY ? orderRows.filter((o) => o.user_id).length : linkable;
  log(`Linked to an account: ${linked}, guest: ${orderRows.length - linked}`);

  if (!APPLY) {
    log("\nDry run — nothing written. Re-run with --apply to import.\n");
    return;
  }

  const idByNumber = new Map();
  for (let i = 0; i < orderRows.length; i += 500) {
    const batch = orderRows.slice(i, i + 500);
    const { data, error } = await db
      .from("orders")
      .upsert(batch, { onConflict: "order_number" })
      .select("id, order_number");
    if (error) throw error;
    for (const row of data) idByNumber.set(row.order_number, row.id);
    log(`  orders ${Math.min(i + 500, orderRows.length)}/${orderRows.length}`);
  }
  log(`Orders: ${idByNumber.size} upserted`);

  // ── 5. Line items ──
  // Snapshot only: variant_id stays null. The old catalogue had one product per
  // size, and those were merged into variants — the snapshot (title/price/qty)
  // is the historical truth and is what the report and invoices read.
  const itemRows = [];
  for (const o of orders) {
    const orderId = idByNumber.get(o.order_number);
    if (!orderId) continue;
    for (const item of o.items) {
      itemRows.push({
        order_id: orderId,
        variant_id: null,
        product_slug: "",
        product_title: item.title,
        size: "",
        image: "",
        unit_price: item.unit_price,
        qty: item.qty,
        line_total: item.line_total,
      });
    }
  }

  // Re-runs would otherwise duplicate items (no natural key to upsert on).
  const orderIds = [...idByNumber.values()];
  for (let i = 0; i < orderIds.length; i += 200) {
    const { error } = await db
      .from("order_items")
      .delete()
      .in("order_id", orderIds.slice(i, i + 200));
    if (error) throw error;
  }
  for (let i = 0; i < itemRows.length; i += 500) {
    const { error } = await db.from("order_items").insert(itemRows.slice(i, i + 500));
    if (error) throw error;
    log(`  items ${Math.min(i + 500, itemRows.length)}/${itemRows.length}`);
  }
  log(`Line items: ${itemRows.length} inserted`);
  log("\nImport complete.\n");
}

main().catch((e) => {
  console.error("\nImport failed:", e.message ?? e);
  process.exit(1);
});
