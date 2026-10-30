// Posts a /ember-weekly-plan JSON file to Ember OS (table weekly_plans, shown at /admin/weekly).
// Called by weekly-ember-plan.ps1 after the Claude run. A rerun in the same week replaces that week's row.
// Keys are read at runtime from ember-automations\.env.local - never copy them here.
// Keep this file in git - it is harness, not scratch.
// Usage: node scripts/post-weekly-plan.mjs <path-to-json>
import { readFileSync } from "node:fs";

const ENV_FILE = "C:/Users/info/OneDrive/Documents/Antigravity/ember-automations/.env.local";

// stdout, not stderr: PowerShell 5.1 wraps a native command's redirected stderr in error records,
// which buries the message in the emailed log.
function fail(message) {
  console.log(`post-weekly-plan: ${message}`);
  process.exit(1);
}

const file = process.argv[2];
if (!file) fail("usage: node scripts/post-weekly-plan.mjs <path-to-json>");

let plan;
try {
  plan = JSON.parse(readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
} catch (err) {
  fail(`cannot read ${file}: ${err.message}`);
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const text = (v) => typeof v === "string" && v.trim() !== "";
const problems = [];
if (!DATE.test(plan.week_of ?? "")) problems.push("week_of must be YYYY-MM-DD");
if (!text(plan.summary)) problems.push("summary is empty");
if (!Array.isArray(plan.items) || plan.items.length === 0) problems.push("items must be a non-empty array");
(plan.items ?? []).forEach((item, i) => {
  if (!["website", "ember-os"].includes(item.area)) problems.push(`items[${i}].area`);
  for (const key of ["title", "why", "next_step"]) if (!text(item[key])) problems.push(`items[${i}].${key}`);
  if (!["alec", "claude"].includes(item.owner)) problems.push(`items[${i}].owner`);
  if (!["S", "M", "L"].includes(item.size)) problems.push(`items[${i}].size`);
  if (!DATE.test(item.first_seen ?? "")) problems.push(`items[${i}].first_seen`);
});
if (problems.length) fail(`invalid plan: ${problems.join(", ")}`);

const env = Object.fromEntries(
  readFileSync(ENV_FILE, "utf8")
    .split(/\r?\n/)
    .map((line) => line.match(/^([A-Z_]+)=(.*)$/))
    .filter(Boolean)
    .map(([, k, v]) => [k, v.trim().replace(/^"|"$/g, "")]),
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) fail(`NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing in ${ENV_FILE}`);

let res;
try {
  res = await fetch(`${url}/rest/v1/weekly_plans?on_conflict=week_of`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({ week_of: plan.week_of, summary: plan.summary, items: plan.items }),
  });
} catch (err) {
  fail(`cannot reach Supabase: ${err.message}`);
}
if (!res.ok) fail(`Supabase ${res.status}: ${await res.text()}`);

const [row] = await res.json();
console.log(`posted weekly plan ${row.week_of}: ${row.items.length} items (id ${row.id})`);
