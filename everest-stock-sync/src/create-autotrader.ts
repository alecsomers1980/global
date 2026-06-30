import "dotenv/config";
import type { Page } from "playwright";
import { autotrader as cfg } from "./config/autotrader.js";
import { fetchVehicle, type Vehicle } from "./lib/supabase.js";
import { connectExisting, waitForCloudflare, captureEvidence } from "./lib/browser.js";
import { downloadImages } from "./lib/images.js";
import { log } from "./lib/logger.js";
import { sendAlert } from "./lib/alert.js";

/**
 * AutoTrader Connect CREATE — Step 2 (Listing detail) only.
 *
 * Prereq (attended): the human completes Step 1 (Find Verified Vehicle
 * Specification → pick the right match) so the page is on /Dealer/Listing.
 * This fills the detail form from a Supabase vehicle, forces Status=Draft,
 * uploads photos, and STOPS before submit. Never publishes/activates.
 */

const norm = (s: string) => s.toLowerCase().replace(/[\s.]/g, "");

/**
 * STEP 1 (automated): drill the Make→Model→Variant→… tree to a verified spec,
 * which navigates to the /Dealer/Listing page. Picks the best token-overlap
 * match at each level. Since we stop before submit, mis-picks are reviewable.
 */
async function resolveStep1(page: Page, v: Vehicle) {
  log("info", "Step 1: finding verified vehicle specification…");
  await page.goto(cfg.findUrl, { waitUntil: "domcontentloaded" });
  await waitForCloudflare(page);
  if (page.url().includes("SignIn")) throw new Error("Not logged in to AutoTrader.");
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(800);

  await page.getByPlaceholder(cfg.step1.yearPlaceholder).first().fill(String(v.year));
  await page.getByPlaceholder(cfg.step1.mileagePlaceholder).first().fill(String(v.mileage));

  // Filter the tree by make + first model word, then set value + fire input.
  const filter = `${v.make} ${v.model.split(/\s+/)[0]}`;
  await page.locator(cfg.step1.makeModelInput).first().click();
  await page
    .locator(`${cfg.step1.makeModelInput}:not([readonly])`)
    .first()
    .evaluate((el: HTMLInputElement, val: string) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(el, val);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
    }, filter);
  await page.waitForTimeout(2500);

  const tokens = norm(`${v.make} ${v.model}`).match(/[a-z0-9-]+/g) ?? [];
  const modelTokens = `${v.make} ${v.model}`.toLowerCase().split(/\s+/).map(norm).filter(Boolean);
  const clicked = new Set<string>();

  for (let step = 0; step < 8; step++) {
    if (page.url().includes(cfg.listingUrlMarker)) break;
    const items = page.locator(cfg.step1.treeItem);
    const n = await items.count();
    let bestIdx = -1;
    let bestScore = 0; // require at least one token match
    let bestText = "";
    for (let i = 0; i < n; i++) {
      const el = items.nth(i);
      if (!(await el.isVisible().catch(() => false))) continue;
      const raw = ((await el.innerText().catch(() => "")) || "").replace(/\s+/g, " ").trim();
      // Skip already-open nodes (they'd collapse on click).
      if (/hide\s+(models|variants)/i.test(raw)) continue;
      const t = raw.replace(/(show|hide)\s+(models|variants)/gi, "").trim();
      const key = t.toLowerCase();
      if (!t || clicked.has(key)) continue;
      const nt = norm(t);
      const score = modelTokens.filter((tok) => tok && nt.includes(tok)).length;
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
        bestText = t;
      }
    }
    if (bestIdx < 0) {
      log("warn", `Step 1: no further match at step ${step}.`);
      break;
    }
    clicked.add(bestText.toLowerCase());
    log("info", `  drill: "${bestText}" (score ${bestScore})`);
    await items.nth(bestIdx).click().catch(() => {});
    await page.waitForTimeout(2500);
  }

  void tokens;

  // Tree selected make/model/engine into the field; now Search for the
  // verified specs (the trim/transmission is disambiguated in the results).
  if (!page.url().includes(cfg.listingUrlMarker)) {
    const searchBtn = page.getByRole("button", { name: /^\s*search\s*$/i }).first();
    if (await searchBtn.isVisible().catch(() => false)) {
      log("info", "  clicking Search…");
      await searchBtn.click();
      await page.waitForTimeout(3000);
    }
  }

  // Pick the best verified-spec result (e.g. "1.4 TSI Design Auto").
  if (!page.url().includes(cfg.listingUrlMarker)) {
    const results = page.locator(
      'label, li, a, button, [class*="result" i], [class*="derivative" i], [class*="spec" i]',
    );
    const rn = await results.count();
    let bestIdx = -1;
    let bestScore = 1; // require a real match
    let bestText = "";
    let matchCount = 0;
    for (let i = 0; i < rn; i++) {
      const el = results.nth(i);
      if (!(await el.isVisible().catch(() => false))) continue;
      const t = ((await el.innerText().catch(() => "")) || "").replace(/\s+/g, " ").trim();
      if (!t || t.length > 90 || !norm(t).includes(norm(v.model.split(/\s+/)[0]))) continue;
      const nt = norm(t);
      const score = modelTokens.filter((tok) => tok && nt.includes(tok)).length;
      if (score >= 2) matchCount++;
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
        bestText = t;
      }
    }
    if (bestIdx >= 0) {
      log(
        matchCount > 1 ? "warn" : "info",
        `  result: "${bestText}" (score ${bestScore}${matchCount > 1 ? `, best of ${matchCount} — VERIFY` : ""})`,
      );
      await results.nth(bestIdx).click().catch(() => {});
      await page.waitForTimeout(1200);
    }

    // Confirm the selected match to proceed to the listing form.
    const continueBtn = page.getByRole("button", { name: /^\s*continue\s*$/i }).first();
    if (await continueBtn.isVisible().catch(() => false)) {
      log("info", "  clicking Continue…");
      await continueBtn.click();
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(3000);
    }
  }

  if (!page.url().includes(cfg.listingUrlMarker)) {
    await captureEvidence(page, "autotrader-step1-stuck");
    throw new Error("Step 1 did not reach a listing page — see evidence/ dump.");
  }
  log("ok", `Step 1 resolved → ${page.url()}`);
}

const textByName = (page: Page, name: string) =>
  page.locator(`input[name="${name}"], textarea[name="${name}"]`).first();
const selByName = (page: Page, name: string) => page.locator(`select[name="${name}"]`).first();

async function fillText(page: Page, name: string, value: string | number | null) {
  if (value === null || value === "" || value === undefined) return;
  const loc = textByName(page, name);
  if (!(await loc.count())) return log("warn", `  no field [name=${name}]`);

  const disabled = await loc.isDisabled().catch(() => false);
  const readonly = await loc.evaluate((el) => (el as HTMLInputElement).readOnly).catch(() => false);
  if (disabled || readonly) return log("info", `  ${name} pre-set (locked) — skipped`);

  if (await loc.isVisible().catch(() => false)) {
    await loc.fill(String(value));
    log("info", `  ${name} = ${value}`);
  } else {
    // Field is in a collapsed/hidden section — set value + fire React events.
    await loc.evaluate((el, val) => {
      const proto =
        el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, "value")!.set!.call(el, val);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }, String(value));
    log("info", `  ${name} = ${value} (hidden section)`);
  }
}

/** Select by visible label, case-insensitive, with a contains fallback. */
async function selectVal(page: Page, name: string, value: string | null) {
  if (!value) return;
  const sel = selByName(page, name);
  if (!(await sel.count())) return log("warn", `  no select [name=${name}]`);
  if (await sel.isDisabled().catch(() => false))
    return log("info", `  ${name} pre-set (locked) — skipped`);
  const opts = (await sel.locator("option").allInnerTexts()).map((t) => t.trim());
  const match =
    opts.find((o) => o.toLowerCase() === value.toLowerCase()) ??
    opts.find((o) => o.toLowerCase().includes(value.toLowerCase())) ??
    opts.find((o) => value.toLowerCase().includes(o.toLowerCase()) && o.length > 1);
  if (!match) return log("warn", `  ${name}: "${value}" not in [${opts.join(", ")}]`);
  await sel.selectOption({ label: match });
  log("info", `  ${name} = ${match}`);
}

async function fillForm(page: Page, v: Vehicle) {
  log("info", `Filling AutoTrader listing for: ${v.make} ${v.model} (${v.year})`);

  await selectVal(page, "transmissionType", v.transmission);
  await selectVal(page, "fuelType", v.fuel_type);
  await selectVal(page, "newOrUsed", v.condition === "new" ? "New" : "Used");
  await fillText(page, "stockRefNo", v.stock_number);
  await fillText(page, "vin", v.vin);
  await fillText(page, "registrationNumber", v.registration_number);
  await selectVal(page, "registrationYear", String(v.year));
  await fillText(page, "mileage", v.mileage);
  await selectVal(page, "colour", v.colour);
  await fillText(page, "manufacturerColour", v.manufacturer_colour);
  if (v.previous_owners != null) await selectVal(page, "previousOwners", String(v.previous_owners));
  await selectVal(page, "accidentInvolved", v.accident_involved ? "Yes" : "No");
  if (v.service_history)
    await selectVal(page, "serviceHistory", cfg.serviceHistoryMap[v.service_history] ?? v.service_history);
  // hasWarranty is required — default to No when unknown.
  await selectVal(page, "hasWarranty", v.has_warranty ? "Yes" : "No");
  await fillText(page, "warrantyEndDate", v.warranty_end_date);
  await fillText(page, "warrantyMileage", v.warranty_mileage);
  await fillText(page, "retailPrice", v.price);
  await fillText(page, "tradeInPrice", v.trade_in_price);
  await fillText(page, "reconditioningCosts", v.reconditioning_cost);
  if (v.description) await fillText(page, "description", v.description);

  // Status: force Draft so the listing is never published/Active.
  await selectVal(page, "status", "Draft");
  log("warn", "Status forced to Draft — not Active.");
}

async function uploadPhotos(page: Page, v: Vehicle) {
  const urls = [v.main_image_url, ...(v.gallery_urls ?? [])].filter(Boolean) as string[];
  if (!urls.length) return log("warn", "No images — skipping photos.");
  log("info", `Photos: ${urls.length} image(s)…`);
  const files = await downloadImages(urls);
  if (!files.length) return;

  // Target the image file input (a separate PDF input exists for documents).
  const input = page.locator('input[type="file"][accept*="image" i]').first();
  if (!(await input.count())) return log("warn", "No image file input found for photos.");
  const multiple = await input.evaluate((el) => (el as HTMLInputElement).multiple).catch(() => false);
  if (multiple) {
    await input.setInputFiles(files);
  } else {
    for (const f of files) await input.setInputFiles(f); // one at a time
  }
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(Math.min(3000 + files.length * 900, 25_000));
  log("ok", `  uploaded ${files.length} photo(s).`);
}

async function main() {
  let browser;
  try {
    const vehicle = await fetchVehicle({ id: process.env.VEHICLE_ID, stock: process.env.VEHICLE_STOCK });
    const conn = await connectExisting(cfg.host, `https://${cfg.host}/`);
    browser = conn.browser;
    const page = conn.page;

    await waitForCloudflare(page);
    // Step 1: auto-resolve the verified spec unless we're already on a listing.
    if (!page.url().includes(cfg.listingUrlMarker)) {
      await resolveStep1(page, vehicle);
    }
    await page.waitForLoadState("networkidle").catch(() => {});

    await fillForm(page, vehicle);
    await uploadPhotos(page, vehicle);

    await captureEvidence(page, "autotrader-create-filled");
    log("ok", "Filled. STOPPED before submit — review the browser, submit manually if correct.");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await sendAlert("AutoTrader create failed", msg);
    process.exitCode = 1;
  } finally {
    await browser?.close().catch(() => {});
  }
}

main();
