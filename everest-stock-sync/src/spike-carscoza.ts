import "dotenv/config";
import type { Page } from "playwright";
import { carscoza as cfg } from "./config/carscoza.js";
import {
  launch,
  humanType,
  humanPause,
  firstVisible,
  captureEvidence,
  waitForCloudflare,
} from "./lib/browser.js";
import { log } from "./lib/logger.js";
import { sendAlert } from "./lib/alert.js";

/**
 * STEP-1 SPIKE for cars.co.za.
 *
 * Goal: prove we can (a) log into the dealer portal and (b) read the current
 * live stock — and find out what anti-bot / captcha reality we're dealing with.
 *
 * This does NOT create, edit, or delete anything. Read-only.
 */

async function login(page: Page): Promise<void> {
  if (!cfg.loginUrl) {
    throw new Error("CARSCOZA_LOGIN_URL is not set in .env");
  }

  log("info", `Opening login page: ${cfg.loginUrl}`);
  await page.goto(cfg.loginUrl, { waitUntil: "domcontentloaded" });
  await humanPause();

  // Already logged in from a previous run? Then the form won't be here.
  const already = await firstVisible(page, cfg.login.successMarker, 2000);
  if (already) {
    log("ok", "Existing session is still valid — skipping login.");
    return;
  }

  const userField = await firstVisible(page, cfg.login.username);
  const passField = await firstVisible(page, cfg.login.password);
  if (!userField || !passField) {
    await captureEvidence(page, "login-form-not-found");
    throw new Error(
      "Could not find the login form fields. The page HTML has been dumped " +
        "to evidence/ — open it to read the real selectors, then update " +
        "src/config/carscoza.ts.",
    );
  }

  const username = process.env.CARSCOZA_USERNAME;
  const password = process.env.CARSCOZA_PASSWORD;
  if (!username || !password) {
    throw new Error("CARSCOZA_USERNAME / CARSCOZA_PASSWORD not set in .env");
  }

  log("info", "Filling credentials (human-like typing)…");
  await humanType(userField, username);
  await humanPause();
  await humanType(passField, password);
  await humanPause();

  const submit = await firstVisible(page, cfg.login.submit);
  if (!submit) {
    await captureEvidence(page, "submit-not-found");
    throw new Error("Could not find the submit button — see evidence/ dump.");
  }
  await submit.click();
  log("info", "Submitted login, waiting for result…");
  await page.waitForLoadState("networkidle").catch(() => {});
  await humanPause();

  // Did we actually get in?
  const ok = await firstVisible(page, cfg.login.successMarker, 8000);
  if (!ok) {
    const err = await firstVisible(page, cfg.login.errorMarker, 1500);
    await captureEvidence(page, "login-failed");
    throw new Error(
      err
        ? "Login rejected (error message shown). Check credentials."
        : "Login result unconfirmed — no success marker found. The success " +
            "marker selector in config probably needs updating (see evidence/).",
    );
  }
  log("ok", "Logged in successfully.");
}

async function scrapeStock(page: Page): Promise<number> {
  if (!cfg.stockUrl) {
    log(
      "warn",
      "CARSCOZA_STOCK_URL not set. Pausing on the current page so you can " +
        "navigate to your stock list manually. Dumping this page for reference.",
    );
    await captureEvidence(page, "post-login-page");
    return -1;
  }

  log("info", `Opening stock list: ${cfg.stockUrl}`);
  await page.goto(cfg.stockUrl, { waitUntil: "domcontentloaded" });

  const cleared = await waitForCloudflare(page);
  if (!cleared) {
    await captureEvidence(page, "cloudflare-blocked");
    log(
      "warn",
      "Cloudflare challenge did not clear within timeout. This is the key " +
        "blocker to solve — see notes in the run summary.",
    );
    return -1;
  }
  await page.waitForLoadState("networkidle").catch(() => {});
  await humanPause();

  const table = await firstVisible(page, [cfg.stock.table], 10000);
  if (!table) {
    await captureEvidence(page, "stock-list-unrecognised");
    log(
      "warn",
      "Couldn't find the stock table. HTML dumped to evidence/ — we'll " +
        "build exact selectors from it.",
    );
    return -1;
  }

  const count = await page.locator(cfg.stock.row).count();
  log("ok", `Found ${count} vehicle row(s) on the stock page.`);
  await captureEvidence(page, "stock-list");
  return count;
}

async function main() {
  const ctx = await launch();
  const page = await ctx.newPage();
  try {
    await login(page);
    const count = await scrapeStock(page);
    log("ok", `Spike complete. Stock elements seen: ${count}`);
    if (process.env.HEADLESS !== "true") {
      log("info", "Browser left open for 30s so you can inspect. ");
      await page.waitForTimeout(30_000);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await captureEvidence(page, "fatal").catch(() => {});
    await sendAlert("cars.co.za spike failed", msg);
    process.exitCode = 1;
  } finally {
    await ctx.close();
  }
}

main();
