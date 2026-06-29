import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectExisting, waitForCloudflare, firstVisible, captureEvidence } from "./lib/browser.js";
import { carscoza as cfg } from "./config/carscoza.js";
import { log } from "./lib/logger.js";
import { sendAlert } from "./lib/alert.js";

/**
 * READ-ONLY field mapper for the cars.co.za "Add vehicle" form.
 *
 * Navigates directly to /dap/stock/add/ (does NOT click the Add button) and
 * enumerates every form control in the DOM — including hidden ones, so we
 * capture all wizard steps. It NEVER clicks submit / publish / activate.
 */

const ADD_URL = "https://www.cars.co.za/dap/stock/add/";
const PORTAL_HOST = "cars.co.za";

async function main() {
  let browser;
  try {
    const conn = await connectExisting(PORTAL_HOST, cfg.loginUrl || ADD_URL);
    browser = conn.browser;
    const page = conn.page;

    log("info", `Navigating to add form (no button click): ${ADD_URL}`);
    await page.goto(ADD_URL, { waitUntil: "domcontentloaded" });
    if (!(await waitForCloudflare(page))) {
      await sendAlert("Cloudflare on add form", "Solve the challenge in Chrome, then re-run.");
      throw new Error("Cloudflare challenge on add form.");
    }
    const ok = await firstVisible(page, cfg.login.successMarker, 4000);
    if (!ok) {
      await sendAlert("Not logged in", "Log in via Chrome, then re-run npm run map:add.");
      throw new Error("Not logged in.");
    }
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(1500);

    // Shim esbuild's __name helper (tsx injects calls to it inside evaluate).
    await page.evaluate(() => {
      const g = globalThis as any;
      if (!g.__name) g.__name = (fn: any) => fn;
    });

    // Enumerate every control in the DOM, visible or not.
    const fields = await page.evaluate(() => {
      function labelFor(el: Element): string {
        const id = el.getAttribute("id");
        if (id) {
          const l = document.querySelector(`label[for="${CSS.escape(id)}"]`);
          if (l?.textContent) return l.textContent.trim();
        }
        const aria = el.getAttribute("aria-label");
        if (aria) return aria.trim();
        const labelledby = el.getAttribute("aria-labelledby");
        if (labelledby) {
          const l = document.getElementById(labelledby);
          if (l?.textContent) return l.textContent.trim();
        }
        const wrap = el.closest("label");
        if (wrap?.textContent) return wrap.textContent.trim();
        return "";
      }
      const isVisible = (el: Element) => {
        const r = (el as HTMLElement).getBoundingClientRect();
        const s = getComputedStyle(el as HTMLElement);
        return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
      };
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
          visible: isVisible(el),
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

    // Identify the radio-group questions and the upload mechanism.
    const extras = await page.evaluate(() => {
      const radios: Record<string, string> = {};
      document.querySelectorAll('input[type="radio"]').forEach((el) => {
        const name = el.getAttribute("name") || "";
        if (!name || radios[name]) return;
        // Walk up to a wrapper, then read its first label-ish text.
        let node: Element | null = el;
        for (let i = 0; i < 6 && node; i++) {
          node = node.parentElement;
          const lbl = node?.querySelector(".mantine-InputWrapper-label, label, .mantine-Input-label");
          const t = lbl?.textContent?.replace(/\s+/g, " ").trim();
          if (t && t.length > 2 && t.toLowerCase() !== "yes" && t.toLowerCase() !== "no") {
            radios[name] = t.slice(0, 80);
            break;
          }
        }
      });
      const fileInputs = document.querySelectorAll('input[type="file"]').length;
      const dropzones = document.querySelectorAll('[class*="Dropzone" i],[class*="dropzone" i]').length;
      return { radios, fileInputs, dropzones };
    });
    log("info", `Radio-group questions: ${JSON.stringify(extras.radios)}`);
    log("info", `Uploads — file inputs: ${extras.fileInputs}, dropzones: ${extras.dropzones}`);

    // Also grab visible section/step headings for structure.
    const headings = await page.evaluate(() =>
      Array.from(document.querySelectorAll("h1,h2,h3,h4,legend,[role='tab']"))
        .map((h) => h.textContent?.replace(/\s+/g, " ").trim())
        .filter((t): t is string => !!t && t.length < 60)
        .slice(0, 40),
    );

    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
    const outPath = path.join(root, "evidence", "add-form-fields.json");
    fs.writeFileSync(outPath, JSON.stringify({ headings, fields }, null, 2), "utf8");
    await captureEvidence(page, "add-form");

    log("ok", `Mapped ${fields.length} form control(s). Saved: ${outPath}`);
    log("info", `Sections/steps: ${headings.join(" | ")}`);
    for (const f of fields) {
      const req = f.required ? "REQUIRED" : "optional";
      const opts = f.options ? ` [${f.options.length} opts]` : "";
      log("info", `  • ${f.label || f.name || f.id || "(unlabeled)"} — ${f.type} — ${req}${opts}`);
    }
    log("warn", "Did NOT submit / activate anything. Read-only map complete.");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await sendAlert("map-add-form failed", msg);
    process.exitCode = 1;
  } finally {
    await browser?.close().catch(() => {});
  }
}

main();
