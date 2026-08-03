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

// AutoTrader Seller Comments cap at 1500 chars. Trim to the last full sentence
// (else last word) within the limit so we never cut mid-word.
function truncate(text: string, max = 1500): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  const end = stop > max * 0.6 ? stop + 1 : cut.lastIndexOf(" ");
  return (end > 0 ? cut.slice(0, end) : cut).trim();
}

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

  // Fresh Chrome profiles show a cookie-consent banner that can gate/obscure the
  // form (established profiles accepted it long ago — why this only bit the
  // client PC). Dismiss it before interacting with the form.
  await page
    .getByRole("button", { name: /accept all cookies/i })
    .click({ timeout: 3000 })
    .catch(() => {});

  await page.getByPlaceholder(cfg.step1.yearPlaceholder).first().fill(String(v.year));
  await page.getByPlaceholder(cfg.step1.mileagePlaceholder).first().fill(String(v.mileage));

  // Filter the tree by MAKE ONLY. The Everest model string ("Grand i10 1.25
  // Fluid") often starts with words AutoTrader doesn't use as its model node
  // (here the node is just "i10"), so filtering by a model word can hide the real
  // model. Make-only keeps every model visible; the drill picks by token score.
  const filter = v.make;
  const makeModel = page.locator(cfg.step1.makeModelInput).first();
  // The make/model box is a READONLY typeahead trigger — you click it to activate
  // (readonly is removed after). It starts DISABLED until Year+Mileage validate,
  // which lags on a slow PC. Wait for it to be enabled (readonly is fine, disabled
  // is not) rather than click-retry into an "element is not enabled" timeout.
  // NB: isEditable() is always false for a readonly field, so check isEnabled().
  await makeModel.waitFor({ state: "visible", timeout: 20_000 }).catch(() => {});
  const readyBy = Date.now() + 20_000;
  let mmReady = false;
  while (Date.now() < readyBy) {
    if (await makeModel.isEnabled().catch(() => false)) {
      mmReady = true;
      break;
    }
    await page.waitForTimeout(300);
  }
  if (!mmReady) {
    await captureEvidence(page, "autotrader-step1-not-ready");
    throw new Error(
      `Make/model field never became enabled — Find-Spec form not ready, or a ` +
        `different dealer than 48055 is logged in. URL: ${page.url()} — evidence saved.`,
    );
  }
  await makeModel.click();
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
    // This tree is a keyboard-driven custom widget that ignores synthetic clicks on
    // the row/arrow. Focus the highlighted node and press Enter/ArrowRight to expand
    // (or select a leaf), then reinforce by clicking the ".e-expander" toggle.
    const target = items.nth(bestIdx);
    await target.scrollIntoViewIfNeeded().catch(() => {});
    await target.focus().catch(() => {});
    await target.press("Enter").catch(() => {});
    await page.waitForTimeout(300);
    await target.press("ArrowRight").catch(() => {});
    await page.waitForTimeout(300);
    const expander = target.locator(".e-expander").first();
    if (await expander.isVisible().catch(() => false)) {
      await expander.click().catch(() => {});
    }
    await page.waitForTimeout(1900);
  }

  void tokens;

  // Tree selected make/model/engine into the field; now Search for the
  // verified specs (the trim/transmission is disambiguated in the results).
  if (!page.url().includes(cfg.listingUrlMarker)) {
    const searchBtn = page.getByRole("button", { name: /^\s*search\s*$/i }).first();
    // Search stays DISABLED until a full make→model→variant is selected. Only
    // click when enabled, else the run crashes with a cryptic click-retry; a
    // disabled Search here means the spec is incomplete (handled below).
    if (await searchBtn.isEnabled().catch(() => false)) {
      log("info", "  clicking Search…");
      await searchBtn.click().catch(() => {});
      await page.waitForTimeout(3000);
    } else {
      log("warn", "  Search still disabled — make/model/variant selection incomplete.");
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
    throw new Error(
      "Couldn't auto-select the vehicle spec. In the AutoTrader window, pick the " +
        "Make/Model/Variant yourself, Search, and choose the match so the page is on " +
        "the Listing form — then click AutoTrader again and it'll fill the rest.",
    );
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
  if (v.description) await fillText(page, "description", truncate(v.description, 1500));

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

  // Photos failing must NOT fail the whole run — the form is already filled.
  try {
    // Target the image file input (a separate PDF input exists for documents).
    const input = page.locator('input[type="file"][accept*="image" i]').first();
    if (!(await input.count())) return log("warn", "No image file input found for photos.");
    const multiple = await input.evaluate((el) => (el as HTMLInputElement).multiple).catch(() => false);
    if (multiple) {
      await input.setInputFiles(files, { timeout: 45_000 });
    } else {
      for (const f of files) await input.setInputFiles(f, { timeout: 45_000 }); // one at a time
    }
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(Math.min(3000 + files.length * 900, 25_000));
    log("ok", `  uploaded ${files.length} photo(s).`);
  } catch (err) {
    const msg = err instanceof Error ? err.message.split("\n")[0] : String(err);
    log("warn", `  PHOTO UPLOAD FAILED (form still filled — add photos manually): ${msg}`);
  }
}

async function main() {
  let browser;
  let page: Page | undefined;
  try {
    const vehicle = await fetchVehicle({ id: process.env.VEHICLE_ID, stock: process.env.VEHICLE_STOCK });
    const conn = await connectExisting(cfg.host, `https://${cfg.host}/`);
    browser = conn.browser;
    page = conn.page;

    await waitForCloudflare(page);
    // Step 1: auto-resolve the verified spec unless we're already on a listing.
    if (!page.url().includes(cfg.listingUrlMarker)) {
      await resolveStep1(page, vehicle);
    }
    await page.waitForLoadState("networkidle").catch(() => {});

    await fillForm(page, vehicle);
    await uploadPhotos(page, vehicle);

    await captureEvidence(page, "autotrader-create-filled");
    if (process.env.SUBMIT === "true") {
      // AUTO-SUBMIT seam — enabled later once trusted. For now, does not publish.
      // To enable: set status=Active and click Save/Next through to publish here.
      log("warn", "SUBMIT flag set, but auto-submit is not enabled yet — left filled for manual submit.");
    } else {
      log("ok", "Filled. STOPPED before submit — review the browser, submit manually if correct.");
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (page) await captureEvidence(page, "autotrader-failure").catch(() => {});
    await sendAlert("AutoTrader create failed", msg);
    process.exitCode = 1;
  } finally {
    await browser?.close().catch(() => {});
  }
}

main();
