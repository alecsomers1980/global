import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectExisting, waitForCloudflare, captureEvidence } from "./lib/browser.js";
import { log } from "./lib/logger.js";
import { sendAlert } from "./lib/alert.js";

/**
 * Generic, READ-ONLY form mapper for any portal we've logged into (attended).
 *
 *   HOST=autotrader.co.za npm run map           # discover add-vehicle links
 *   HOST=autotrader.co.za MAP_URL=<url> npm run map   # map fields at that URL
 *
 * Never clicks create/submit/activate. Without MAP_URL it just lists candidate
 * "add vehicle" links/buttons found on the current page so we can pick the route.
 */

const HOST = process.env.HOST ?? "autotrader.co.za";
const MAP_URL = process.env.MAP_URL ?? "";
// MAP_CURRENT=1 maps the form already on screen (for SPA forms with no URL).
const MAP_CURRENT = process.env.MAP_CURRENT === "1";
const DO_MAP = Boolean(MAP_URL) || MAP_CURRENT;

async function main() {
  let browser;
  try {
    const conn = await connectExisting(HOST, `https://${HOST}/`);
    browser = conn.browser;
    const page = conn.page;

    if (MAP_URL) {
      log("info", `Navigating to: ${MAP_URL} (no button click)`);
      await page.goto(MAP_URL, { waitUntil: "domcontentloaded" });
    }
    if (!(await waitForCloudflare(page))) {
      await sendAlert("Cloudflare challenge", "Solve it in Chrome, then re-run.");
      throw new Error("Cloudflare challenge active.");
    }
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(1500);
    log("ok", `On page: ${page.url()}`);

    // Shim esbuild __name helper for page.evaluate.
    await page.evaluate(() => {
      const g = globalThis as any;
      if (!g.__name) g.__name = (fn: any) => fn;
    });

    // ---- Discovery mode: list candidate add-vehicle links/buttons ----
    if (!DO_MAP) {
      const candidates = await page.evaluate(() => {
        const re = /\b(add|create|new|capture|load|list)\b/i;
        const out: { text: string; href: string; tag: string }[] = [];
        document.querySelectorAll("a, button").forEach((el) => {
          const text = (el.textContent || "").replace(/\s+/g, " ").trim();
          const href = el.getAttribute("href") || "";
          if (re.test(text) || /add|create|new|stock|vehicle/i.test(href)) {
            out.push({ text: text.slice(0, 50), href, tag: el.tagName.toLowerCase() });
          }
        });
        return out.slice(0, 40);
      });
      log("info", "Candidate add-vehicle controls (no clicking):");
      for (const c of candidates) log("info", `  [${c.tag}] "${c.text}"  ${c.href}`);
      log("warn", "Pick the add-vehicle URL, then re-run with MAP_URL=<url>.");
      await captureEvidence(page, `${HOST}-discover`);
      return;
    }

    // ---- Map mode: enumerate every form control ----
    const fields = await page.evaluate(() => {
      function labelFor(el: Element): string {
        const id = el.getAttribute("id");
        if (id) {
          const l = document.querySelector(`label[for="${CSS.escape(id)}"]`);
          if (l?.textContent) return l.textContent.trim();
        }
        const aria = el.getAttribute("aria-label");
        if (aria) return aria.trim();
        const wrap = el.closest("label");
        if (wrap?.textContent) return wrap.textContent.trim();
        return "";
      }
      const out: any[] = [];
      document.querySelectorAll("input, select, textarea").forEach((el) => {
        const tag = el.tagName.toLowerCase();
        const label = labelFor(el);
        const required =
          (el as HTMLInputElement).required ||
          el.getAttribute("aria-required") === "true" ||
          /\*/.test(label);
        const base: any = {
          tag,
          type: el.getAttribute("type") || (tag === "select" ? "select" : tag),
          name: el.getAttribute("name") || "",
          id: el.getAttribute("id") || "",
          placeholder: el.getAttribute("placeholder") || "",
          label: label.replace(/\s+/g, " ").slice(0, 80),
          required,
        };
        if (tag === "select") {
          base.options = Array.from(el.querySelectorAll("option"))
            .map((o) => o.textContent?.trim())
            .filter(Boolean)
            .slice(0, 30);
        }
        out.push(base);
      });
      return out;
    });
    const headings = await page.evaluate(() =>
      Array.from(document.querySelectorAll("h1,h2,h3,h4,legend,[role='tab']"))
        .map((h) => h.textContent?.replace(/\s+/g, " ").trim())
        .filter((t): t is string => !!t && t.length < 60)
        .slice(0, 40),
    );

    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
    const safe = HOST.replace(/[^a-z0-9]/gi, "_");
    const outPath = path.join(root, "evidence", `${safe}-add-form-fields.json`);
    fs.writeFileSync(outPath, JSON.stringify({ url: page.url(), headings, fields }, null, 2), "utf8");
    await captureEvidence(page, `${safe}-add-form`);

    log("ok", `Mapped ${fields.length} control(s). Saved: ${outPath}`);
    log("info", `Sections: ${headings.join(" | ")}`);
    for (const f of fields) {
      const req = f.required ? "REQUIRED" : "optional";
      const opts = f.options ? ` [${f.options.length} opts]` : "";
      log("info", `  • ${f.label || f.name || f.id || "(unlabeled)"} — ${f.type} — ${req}${opts}`);
    }
    log("warn", "Did NOT submit / activate anything. Read-only map complete.");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await sendAlert("map-form failed", msg);
    process.exitCode = 1;
  } finally {
    await browser?.close().catch(() => {});
  }
}

main();
