import { chromium, type Browser, type BrowserContext, type Page, type Locator } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { log } from "./logger.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const AUTH_DIR = path.join(root, ".auth", "carscoza");
const EVIDENCE_DIR = path.join(root, "evidence");

/**
 * Launch a persistent browser context. Cookies/localStorage are stored in
 * .auth/ so subsequent runs reuse the session like a human would, instead of
 * logging in fresh every time.
 */
export async function launch(): Promise<BrowserContext> {
  const headless = process.env.HEADLESS === "true";
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  const ctx = await chromium.launchPersistentContext(AUTH_DIR, {
    headless,
    viewport: { width: 1366, height: 900 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    locale: "en-ZA",
    timezoneId: "Africa/Johannesburg",
  });
  ctx.setDefaultTimeout(20_000);
  log("info", `Browser launched (headless=${headless}).`);
  return ctx;
}

/**
 * ATTENDED MODE: attach to a Chrome that a human already launched (via
 * launch-chrome.ps1) and logged into. We inherit their authenticated,
 * Cloudflare-cleared session instead of trying to log in / pass the bot check
 * ourselves. Returns the browser plus the tab already on the portal (or a new
 * tab navigated there if none is open).
 */
export async function connectExisting(
  urlIncludes: string,
  fallbackUrl: string,
): Promise<{ browser: Browser; page: Page }> {
  const port = process.env.CDP_PORT ?? "9222";
  const endpoint = `http://localhost:${port}`;
  log("info", `Attaching to human-launched Chrome at ${endpoint} …`);

  let browser: Browser;
  try {
    browser = await chromium.connectOverCDP(endpoint);
  } catch {
    throw new Error(
      `No Chrome found on the debug port (${endpoint}). Run launch-chrome.ps1 ` +
        `first, log in, then run this again.`,
    );
  }

  const ctx = browser.contexts()[0];
  if (!ctx) throw new Error("Connected to Chrome but it has no browser context.");

  // Find a tab already on the portal; otherwise open one in the human session.
  let page = ctx.pages().find((p) => p.url().includes(urlIncludes));
  if (!page) {
    log("info", `No portal tab open — opening ${fallbackUrl} in the session.`);
    page = await ctx.newPage();
    await page.goto(fallbackUrl, { waitUntil: "domcontentloaded" });
  } else {
    log("ok", `Found existing portal tab: ${page.url()}`);
    await page.bringToFront();
  }
  ctx.setDefaultTimeout(20_000);
  return { browser, page };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const jitter = (min: number, max: number) => min + Math.random() * (max - min);

/** Random pause to look less robotic and to avoid hammering a fragile UI. */
export const humanPause = () => sleep(jitter(700, 2200));

/** Type into a field one key at a time with small random delays. */
export async function humanType(loc: Locator, value: string) {
  await loc.click();
  await loc.fill("");
  for (const ch of value) {
    await loc.type(ch, { delay: jitter(60, 160) });
  }
}

/**
 * Try a list of candidate selectors and return the first one that is actually
 * present/visible. Returns null if none match — caller decides how loud to be.
 */
export async function firstVisible(
  page: Page,
  selectors: readonly string[],
  timeout = 8000,
): Promise<Locator | null> {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    for (const sel of selectors) {
      const loc = page.locator(sel).first();
      if (await loc.isVisible().catch(() => false)) return loc;
    }
    await sleep(250);
  }
  return null;
}

/**
 * Wait for a Cloudflare "Just a moment…" / Turnstile interstitial to clear.
 * Returns true once the real page is showing, false if still challenged after
 * the timeout. A headed, persistent browser usually passes a *managed*
 * challenge automatically within a few seconds.
 */
export async function waitForCloudflare(page: Page, timeout = 30_000): Promise<boolean> {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const title = (await page.title().catch(() => "")) ?? "";
    const challenged =
      /just a moment|attention required|checking your browser/i.test(title);
    if (!challenged) return true;
    log("info", "Cloudflare challenge present — waiting for it to clear…");
    await sleep(2000);
  }
  return false;
}

/** Capture a screenshot + full HTML at the moment of failure for debugging. */
export async function captureEvidence(page: Page, label: string): Promise<string> {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const base = path.join(EVIDENCE_DIR, `${stamp}_${label}`);
  await page.screenshot({ path: `${base}.png`, fullPage: true }).catch(() => {});
  const html = await page.content().catch(() => "");
  fs.writeFileSync(`${base}.html`, html, "utf8");
  log("info", `Evidence saved: ${base}.png / .html`);
  return base;
}
