/**
 * Sanity-checks the price data against the client's published PDF price list.
 * Run: node scripts/verify-pricing.mjs
 */
import { readFileSync, existsSync } from "fs";

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

console.log("\n--- Extras (read off the price-list artwork) ---");
const extrasBlock = src.slice(src.indexOf("export const EXTRAS"), src.indexOf("export const STANDARD_FEATURES"));
const extras = Object.fromEntries(
  [...extrasBlock.matchAll(/id:\s*"([^"]+)",\s*label:\s*"[^"]*",\s*price:\s*([^,\n}]+)/g)]
    .map((m) => [m[1], m[2].trim()])
);
check("6 extras defined", Object.keys(extras).length, 6);
check("ND1 pine window = R880", extras["window-nd1"], "880");
check("ND2 pine window = R1 650", extras["window-nd2"], "1650");
check("burglar bars = R430", extras["burglar-bars"], "430");
check("additional door = R490", extras["extra-door"], "490");
check("stable door conversion = R300", extras["stable-door"], "300");
check("serving flap = R770", extras["serving-flap"], "770");
check("termite poison is NOT an extra (it's standard)", "termite" in extras, false);

console.log("\n--- Frame Built (no gaps remain) ---");
const fbBlock = src.slice(src.indexOf("export const FRAME_BUILT:"), src.indexOf("FRAME_BUILT_INCLUSIONS"));
const fbRows = [...fbBlock.matchAll(
  /slug:\s*"([^"]+)"[\s\S]*?log:\s*([^\s,]+),\s*chromadek:\s*([^\s,]+),\s*nutec:\s*([^\s,]+),/g
)];
check("6 frame-built models", fbRows.length, 6);
check("no null prices left in FRAME_BUILT", fbRows.some((r) => [r[2], r[3], r[4]].includes("null")), false);
const fb6x12 = fbRows.find((r) => r[1] === "6x12-three-bedroom");
check("6x12 chromadek = R341 950 (was a gap)", fb6x12[3].trim(), "341950");
const fb76x12 = fbRows.find((r) => r[1] === "7-6x12-three-bedroom");
check("7.6x12 log = R386 979 (was a gap)", fb76x12[2].trim(), "386979");
check("7.6x12 nutec = R479 037 (was a gap)", fb76x12[4].trim(), "479037");

console.log("\n--- Large layouts (size↔price mapping verified from the PDF grid) ---");
const llBlock = src.slice(src.indexOf("export const LARGE_LAYOUTS"));
const lls = [...llBlock.matchAll(/slug:\s*"([^"]+)"[^}]*?standard:\s*(\d+),\s*signature:\s*(\d+),\s*premium:\s*(\d+)/g)];
check("4 large layouts", lls.length, 4);
const byslug = Object.fromEntries(lls.map((m) => [m[1], [+m[2], +m[3], +m[4]]]));
check("open workspace/classroom standard = R64 610", byslug["open-workspace-classroom"][0], 64610);
check("one bedroom premium = R135 180", byslug["one-bedroom-unit"][2], 135180);
check("two bedroom signature = R131 685", byslug["two-bedroom-unit"][1], 131685);
check("three bedroom premium = R224 290", byslug["three-bedroom-unit"][2], 224290);
check(
  "every tier ascends standard < signature < premium",
  lls.every((m) => +m[2] < +m[3] && +m[3] < +m[4]),
  true
);

// Every floor plan referenced in the data must exist on disk AND be rendered by a page,
// otherwise it's an orphaned asset nobody ever sees.
console.log("\n--- Floor plans ---");
const planPaths = [...src.matchAll(/plan:\s*"(\/images\/plans\/[^"]+)"/g)].map((m) => m[1]);
check("10 plans referenced in data", planPaths.length, 10);
const missing = planPaths.filter(
  (p) => !existsSync(new URL(`../public${p}`, import.meta.url))
);
check("every referenced plan exists in public/", missing.length, 0);
if (missing.length) missing.forEach((m) => console.log(`      missing: ${m}`));

const pages = ["../src/app/frame-built/page.tsx", "../src/app/wendy-houses/page.tsx"]
  .map((p) => readFileSync(new URL(p, import.meta.url), "utf8"))
  .join("\n");
check("frame-built page renders model.plan", /src=\{model\.plan\}/.test(pages), true);
check("wendy-houses page renders layout plan", /src=\{l\.plan\}/.test(pages), true);

console.log(`\n${fail === 0 ? "ALL PASS" : "FAILURES PRESENT"} — ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
