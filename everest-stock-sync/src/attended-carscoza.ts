import "dotenv/config";
import type { Page } from "playwright";
import { carscoza as cfg } from "./config/carscoza.js";
import {
  connectExisting,
  firstVisible,
  waitForCloudflare,
  captureEvidence,
  humanPause,
} from "./lib/browser.js";
import { log } from "./lib/logger.js";
import { sendAlert } from "./lib/alert.js";

/**
 * ATTENDED runner for cars.co.za.
 *
 * Prereq: a human ran launch-chrome.ps1, logged in, and passed Cloudflare.
 * This attaches to that session and continues — read-only for now (scrape
 * current stock). Create/update/delist will hang off the same authenticated
 * session once the spike is proven.
 */

const PORTAL_HOST = "cars.co.za";

async function ensureReady(page: Page): Promise<void> {
  // Cloudflare may re-challenge mid-session — ask the human to solve it.
  if (!(await waitForCloudflare(page, 5000))) {
    await sendAlert(
      "Cloudflare challenge in the browser",
      "Switch to the Chrome window, solve the 'Just a moment…' check, then re-run npm run attended.",
    );
    throw new Error("Cloudflare challenge active — needs the human to solve it.");
  }

  // Confirm we're actually logged in (the human's job, but verify it).
  const loggedIn = await firstVisible(page, cfg.login.successMarker, 4000);
  if (!loggedIn) {
    await sendAlert(
      "Not logged in",
      "No logged-in marker found. Log into cars.co.za in the Chrome window, then re-run npm run attended.",
    );
    throw new Error("Session is not logged in.");
  }
  log("ok", "Human session is logged in and past Cloudflare.");
}

async function scrapeStock(page: Page): Promise<number> {
  log("info", `Opening stock list: ${cfg.stockUrl}`);
  await page.goto(cfg.stockUrl, { waitUntil: "domcontentloaded" });
  await ensureReady(page);
  await humanPause();

  const table = await firstVisible(page, [cfg.stock.table], 10000);
  if (!table) {
    const dump = await captureEvidence(page, "stock-list-unrecognised");
    await sendAlert(
      "Stock list not recognised",
      `Couldn't find the stock table. HTML dumped to ${dump}.html — update selectors in src/config/carscoza.ts.`,
    );
    return -1;
  }

  const rows = page.locator(cfg.stock.row);
  const count = await rows.count();

  // Print the first few rows as proof we're really reading live stock.
  const preview = Math.min(count, 5);
  for (let i = 0; i < preview; i++) {
    const text = (await rows.nth(i).innerText().catch(() => "")) || "";
    const oneLine = text.replace(/\s+/g, " ").trim().slice(0, 120);
    log("info", `  row ${i + 1}: ${oneLine}`);
  }

  await captureEvidence(page, "stock-list");
  log("ok", `Found ${count} vehicle row(s) on this page.`);
  return count;
}

async function main() {
  let browser;
  try {
    const conn = await connectExisting(PORTAL_HOST, cfg.loginUrl || `https://www.${PORTAL_HOST}/dap/`);
    browser = conn.browser;
    await ensureReady(conn.page);
    const count = await scrapeStock(conn.page);
    log("ok", `Attended run complete. Stock elements seen: ${count}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // sendAlert may already have fired inside the steps; this catches the rest.
    await sendAlert("cars.co.za attended run failed", msg);
    process.exitCode = 1;
  } finally {
    // Detach only — do NOT close the human's browser.
    await browser?.close().catch(() => {});
  }
}

main();
