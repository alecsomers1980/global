import "dotenv/config";
import type { Page } from "playwright";
import { carscoza as cfg } from "./config/carscoza.js";
import { fetchVehicle, type Vehicle } from "./lib/supabase.js";
import { downloadImages } from "./lib/images.js";
import {
  connectExisting,
  waitForCloudflare,
  firstVisible,
  humanType,
  humanPause,
  captureEvidence,
} from "./lib/browser.js";
import { log } from "./lib/logger.js";
import { sendAlert } from "./lib/alert.js";

/**
 * cars.co.za CREATE flow (attended). Fills the Add Vehicle form from a
 * Supabase vehicle, then STOPS before submit for human review.
 *
 * Safety: never clicks submit/save, never sets Status to Active, never uploads
 * (photos are a later increment). Read-and-fill only.
 */

const PORTAL_HOST = "cars.co.za";

// Locate a field by its (stable) label text; Mantine ids are dynamic.
// Anchor at the start so e.g. "Condition" doesn't match the radio group
// "Sold in roadworthy condition".
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const byLabel = (page: Page, label: string) =>
  page.getByLabel(new RegExp(`^${esc(label)}`)).first();

async function selectByLabel(page: Page, label: string, value: string) {
  await byLabel(page, label).selectOption({ label: value }).catch(async () => {
    // Fallback: some selects take the value attribute, not the visible label.
    await byLabel(page, label).selectOption(value);
  });
  log("info", `  ${label} = ${value}`);
}

async function fillByLabel(page: Page, label: string, value: string) {
  await humanType(byLabel(page, label), value);
  log("info", `  ${label} = ${value}`);
}

async function pickRadio(page: Page, question: string, yes: boolean) {
  const group = page
    .locator("div")
    .filter({ hasText: question })
    .filter({ has: page.locator('input[type="radio"]') })
    .last();
  await group.getByText(yes ? "Yes" : "No", { exact: true }).click();
  log("info", `  ${question} = ${yes ? "Yes" : "No"}`);
}

async function checkFeatures(page: Page, vehicle: Vehicle) {
  const wanted = new Set<string>();
  const unmapped: string[] = [];
  for (const f of vehicle.features ?? []) {
    const targets = cfg.featureMap[f];
    if (targets) targets.forEach((t) => wanted.add(t));
    else unmapped.push(f);
  }
  for (const label of wanted) {
    const ok = await page
      .getByLabel(label, { exact: true })
      .first()
      .check({ timeout: 3000 })
      .then(() => true)
      .catch(() => false);
    log(ok ? "info" : "warn", `  feature ${ok ? "✓" : "could not find"}: ${label}`);
  }
  if (unmapped.length) log("warn", `  unmapped features (skipped): ${unmapped.join(", ")}`);
}

/** Read the non-placeholder option labels of a native <select> by label. */
async function optionTexts(page: Page, label: string): Promise<string[]> {
  const texts = await byLabel(page, label)
    .locator("option")
    .allInnerTexts()
    .catch(() => [] as string[]);
  return texts.map((t) => t.trim()).filter((t) => t && !/please select|select a year/i.test(t));
}

/** Wait until a dependent <select> has populated (async load after parent). */
async function waitForOptions(page: Page, label: string, timeout = 8000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if ((await optionTexts(page, label)).length > 0) return true;
    await page.waitForTimeout(250);
  }
  return false;
}

/**
 * Resolve Make → Model → Variant via the dependent dropdowns. Selecting the
 * variant auto-fills the (optional) numeric MM Code. Everest stores model+
 * variant combined in `model` (e.g. "T-Roc 1.4 TSI Design Auto"), so we match
 * Model as the longest option that is a prefix of that string, then match
 * Variant against the remainder. Ambiguous picks are flagged for human review.
 */
async function resolveSpec(page: Page, v: Vehicle) {
  const full = v.model.toLowerCase();

  // Make — exact (case-insensitive), else contains.
  await waitForOptions(page, cfg.addForm.labels.make);
  const makes = await optionTexts(page, cfg.addForm.labels.make);
  const make =
    makes.find((m) => m.toLowerCase() === v.make.toLowerCase()) ??
    makes.find((m) => m.toLowerCase().includes(v.make.toLowerCase()));
  if (!make) {
    log("warn", `  Make "${v.make}" not in ${makes.length} options — skipping spec.`);
    return;
  }
  await byLabel(page, cfg.addForm.labels.make).selectOption({ label: make });
  log("info", `  Make = ${make}`);

  // Model — longest option that `full` starts with (handles "T-Roc" in
  // "T-Roc 1.4 TSI Design Auto"); else longest option contained in `full`.
  await waitForOptions(page, cfg.addForm.labels.model);
  const models = await optionTexts(page, cfg.addForm.labels.model);
  const model =
    models
      .filter((m) => full.startsWith(m.toLowerCase()))
      .sort((a, b) => b.length - a.length)[0] ??
    models
      .filter((m) => full.includes(m.toLowerCase()))
      .sort((a, b) => b.length - a.length)[0];
  if (!model) {
    log("warn", `  Model not matched in: ${models.join(" | ")}`);
    return;
  }
  await byLabel(page, cfg.addForm.labels.model).selectOption({ label: model });
  log("info", `  Model = ${model}`);

  // Variant — best word-overlap with the remainder after the model name.
  await waitForOptions(page, cfg.addForm.labels.variant, 5000);
  const variants = await optionTexts(page, cfg.addForm.labels.variant);
  if (variants.length === 0) {
    log("info", "  No variant options.");
    return;
  }
  const remainder = full.replace(model.toLowerCase(), "").trim();
  const words = remainder.split(/\s+/).filter(Boolean);
  let best = variants[0];
  let bestScore = -1;
  for (const vn of variants) {
    const score = words.filter((w) => vn.toLowerCase().includes(w)).length;
    if (score > bestScore) {
      bestScore = score;
      best = vn;
    }
  }
  await byLabel(page, cfg.addForm.labels.variant).selectOption({ label: best });
  log(
    variants.length > 1 ? "warn" : "info",
    `  Variant = ${best}${variants.length > 1 ? ` (best of ${variants.length} — VERIFY)` : ""}`,
  );
}

async function fillForm(page: Page, v: Vehicle) {
  log("info", `Filling form for: ${v.make} ${v.model} (${v.year})`);

  // Order matters: Year first; then Make→Model→Variant populate in turn.
  await selectByLabel(page, cfg.addForm.labels.year, String(v.year));
  await humanPause();
  await resolveSpec(page, v);
  await humanPause();

  await fillByLabel(page, cfg.addForm.labels.mileage, String(v.mileage));
  await fillByLabel(page, cfg.addForm.labels.price, String(v.price));
  await selectByLabel(page, cfg.addForm.labels.usedNew, v.condition === "new" ? "New" : "Used");
  await selectByLabel(page, cfg.addForm.labels.condition, v.condition_rating);
  await fillByLabel(page, cfg.addForm.labels.colour, v.colour);

  await pickRadio(page, cfg.addForm.radioQuestions.roadworthy, v.sold_roadworthy !== false);
  await pickRadio(page, cfg.addForm.radioQuestions.finance, v.eligible_for_finance !== false);

  await checkFeatures(page, v);

  if (v.description) {
    await page.getByPlaceholder(cfg.addForm.labels.description).fill(v.description).catch(() => {});
    log("info", "  Description filled");
  }
  if (v.stock_number) await fillByLabel(page, cfg.addForm.labels.reference, v.stock_number);

  // Status: intentionally left untouched so the listing can never be Active.
  log("warn", "Status left blank on purpose — not setting Active.");
}

async function uploadPhotos(page: Page, v: Vehicle) {
  const urls = [v.main_image_url, ...(v.gallery_urls ?? [])].filter(Boolean) as string[];
  if (urls.length === 0) {
    log("warn", "No images on this vehicle — skipping photos.");
    return;
  }
  log("info", `Photos: ${urls.length} image(s) (main first)…`);
  const files = await downloadImages(urls);
  if (files.length === 0) return;

  // Clicking the button opens an Uppy modal with hidden file inputs. Target
  // the Uppy browse input directly (skip the webkitdirectory/folder one) —
  // more robust than the generic [role=dialog], which also matches a Drawer.
  await page.locator(cfg.addForm.photosDropzone).first().click();
  const input = page
    .locator('input.uppy-Dashboard-input[type="file"]:not([webkitdirectory])')
    .first();
  await input.waitFor({ state: "attached", timeout: 10_000 });
  await input.setInputFiles(files);
  log("info", "  files added to Uppy — starting upload…");
  await page.waitForTimeout(1500);

  // Uppy shows an "Upload N files" button; click it if present.
  const uploadBtn = page
    .locator('.uppy-StatusBar-actionBtn--upload, .uppy-Dashboard button:has-text("Upload")')
    .first();
  if (await uploadBtn.isVisible().catch(() => false)) {
    await uploadBtn.click();
    log("info", "  clicked Uppy upload button");
  }
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(Math.min(3000 + files.length * 900, 25_000));
  log("ok", `  uploaded ${files.length} photo(s).`);
}

async function main() {
  let browser;
  try {
    const vehicle = await fetchVehicle({ id: process.env.VEHICLE_ID, stock: process.env.VEHICLE_STOCK });
    const conn = await connectExisting(PORTAL_HOST, cfg.addForm.url);
    browser = conn.browser;
    const page = conn.page;

    log("info", `Opening add form: ${cfg.addForm.url}`);
    await page.goto(cfg.addForm.url, { waitUntil: "domcontentloaded" });
    if (!(await waitForCloudflare(page))) throw new Error("Cloudflare challenge — solve in Chrome, re-run.");
    if (!(await firstVisible(page, cfg.login.successMarker, 4000))) throw new Error("Not logged in.");
    await page.waitForLoadState("networkidle").catch(() => {});
    await humanPause();

    await fillForm(page, vehicle);
    await uploadPhotos(page, vehicle);

    await captureEvidence(page, "create-filled");
    log("ok", "Form filled. STOPPED before submit — review the browser, then submit manually if correct.");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await sendAlert("cars.co.za create failed", msg);
    process.exitCode = 1;
  } finally {
    await browser?.close().catch(() => {});
  }
}

main();
