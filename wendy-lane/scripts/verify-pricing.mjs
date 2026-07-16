/**
 * Sanity-checks the price data against the client's published PDF price list.
 * Run: node scripts/verify-pricing.mjs
 */
import { readFileSync } from "fs";

// Cheap TS-to-JS shim: the data module is plain declarations, so strip types and eval.
const src = readFileSync(new URL("../src/data/pricing.ts", import.meta.url), "utf8");

let pass = 0;
let fail = 0;
function check(label, actual, expected) {
  const ok = actual === expected;
  ok ? pass++ : fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `  (got ${actual}, expected ${expected})`}`);
}

// Pull the price rows straight out of the source text so we test what ships.
const sizeRows = [...src.matchAll(
  /code:\s*"(W\d+)",\s*front:\s*([\d.]+),\s*side:\s*([\d.]+),\s*priceNoWindow:\s*(\d+),\s*windowType:\s*"(ND[12])",\s*priceOneWindow:\s*(\d+)/g
)].map((m) => ({
  code: m[1], front: +m[2], side: +m[3],
  priceNoWindow: +m[4], windowType: m[5], priceOneWindow: +m[6],
}));

const verandaRows = [...src.matchAll(
  /code:\s*"(V\d+)",\s*front:\s*([\d.]+),\s*side:\s*([\d.]+),\s*price:\s*(\d+)/g
)].map((m) => ({ code: m[1], front: +m[2], side: +m[3], price: +m[4] }));

console.log("--- Parsed from src/data/pricing.ts ---");
check("11 Wendy sizes parsed", sizeRows.length, 11);
check("7 verandas parsed", verandaRows.length, 7);

console.log("\n--- Against published PDF (May 2026) ---");
const size = (c) => sizeRows.find((s) => s.code === c);
check("W1515 door only = R7 300", size("W1515").priceNoWindow, 7300);
check("W1515 one window = R8 100", size("W1515").priceOneWindow, 8100);
check("W3660 door only = R29 950", size("W3660").priceNoWindow, 29950);
check("W3660 one window = R31 600", size("W3660").priceOneWindow, 31600);
check("W3660 window type = ND2", size("W3660").windowType, "ND2");
check("W2430 door only = R14 820", size("W2430").priceNoWindow, 14820);
check("V60 veranda = R11 100", verandaRows.find((v) => v.code === "V60").price, 11100);
check("V15 veranda = R3 200", verandaRows.find((v) => v.code === "V15").price, 3200);

console.log("\n--- Calculator maths (mirrors QuoteBuilder) ---");
const total = (code, withWindow, vCode) => {
  const s = size(code);
  const base = withWindow ? s.priceOneWindow : s.priceNoWindow;
  const v = vCode ? verandaRows.find((x) => x.code === vCode).price : 0;
  return base + v;
};
check("W3660 + window            = R31 600", total("W3660", true, null), 31600);
check("W3660 + window + V60      = R42 700", total("W3660", true, "V60"), 42700);
check("W3660 no window + V60     = R41 050", total("W3660", false, "V60"), 41050);
check("W1515 door only, no extras= R7 300", total("W1515", false, null), 7300);

console.log("\n--- Invariants ---");
const badWindow = sizeRows.filter((s) => s.priceOneWindow <= s.priceNoWindow);
check("every one-window price exceeds door-only", badWindow.length, 0);
const ascending = sizeRows.every((s, i, a) => i === 0 || s.priceNoWindow > a[i - 1].priceNoWindow);
check("prices ascend with size", ascending, true);
check("all verandas are 1.2m deep", verandaRows.every((v) => v.side === 1.2), true);

// Every EXTRAS entry must currently be POA — guard against someone inventing a price.
const extrasBlock = src.slice(src.indexOf("export const EXTRAS"), src.indexOf("export const DELIVERY_NOTE"));
const extraPrices = [...extrasBlock.matchAll(/price:\s*([^,}]+)/g)].map((m) => m[1].trim());
check("6 extras defined", extraPrices.length, 6);
check("all extras are null (POA) pending client prices", extraPrices.every((p) => p === "null"), true);

console.log(`\n${fail === 0 ? "ALL PASS" : "FAILURES PRESENT"} — ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
