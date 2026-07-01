import { connectExisting, waitForCloudflare } from "./browser.js";
import { carscoza } from "../config/carscoza.js";
import { log } from "./logger.js";

/**
 * Read each portal's LIVE stock list so the dashboard can flag vehicles that
 * are already listed (ground-truth auto-detect). Requires the dealer's Chrome
 * to be open and logged in. Returns the raw row texts per portal; matching to
 * Everest vehicles is done by the caller.
 */

const CARSCOZA_STOCK_URL =
  "https://www.cars.co.za/dap/stock/?page=1&perPage=100&sortBy=vfs_id&sortDirection=desc";

async function scrapeCarscoza(): Promise<string[]> {
  const { browser, page } = await connectExisting("cars.co.za", carscoza.addForm.url);
  try {
    await page.goto(CARSCOZA_STOCK_URL, { waitUntil: "domcontentloaded" });
    if (!(await waitForCloudflare(page))) return [];
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(1500);
    const rows = page.locator(carscoza.stock.row);
    const n = await rows.count();
    const out: string[] = [];
    for (let i = 0; i < n; i++) {
      const t = ((await rows.nth(i).innerText().catch(() => "")) || "").replace(/\s+/g, " ").trim();
      if (t) out.push(t);
    }
    log("info", `Scraped ${out.length} cars.co.za listing(s).`);
    return out;
  } finally {
    await browser.close().catch(() => {});
  }
}

async function scrapeAutotrader(): Promise<string[]> {
  // TODO: map the /Dealer-<id>/InstantOffer/StockForSale row selector in a live
  // session, then scrape it here like scrapeCarscoza. Returns empty until then.
  return [];
}

export async function getPortalListings(): Promise<{ carscoza: string[]; autotrader: string[] }> {
  const carscozaRows = await scrapeCarscoza().catch((e) => {
    log("warn", `cars.co.za scrape failed: ${e?.message || e}`);
    return [] as string[];
  });
  const autotraderRows = await scrapeAutotrader().catch(() => [] as string[]);
  return { carscoza: carscozaRows, autotrader: autotraderRows };
}
