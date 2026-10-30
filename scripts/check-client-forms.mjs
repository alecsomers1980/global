// Weekly "silent unless broken" check of every live client site's enquiry path (learning digest 2026-10-25).
// Safe half only: no form is ever submitted. For each site it checks that
//   1. the contact page answers 200,
//   2. the form's API route exists and isn't erroring (a GET on a POST-only route answers 405),
//   3. the production Vercel project has the email variables the sending code reads (names only, never values).
// Exit 0 = all clear (launcher sends nothing); exit 1 = at least one problem (launcher emails Alec).
// Required names come from each repo's mail-sending code on main (2026-10-30); a name with a code fallback is not required.
// Update a site's row when its email code changes.
// Keep this file in git - it is harness, not scratch.
// Usage: node scripts/check-client-forms.mjs
import { execSync } from "node:child_process";

const SCOPE = "alecsomers1980s-projects";
const SMTP = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER"];

const SITES = [
  { name: "Wendy Lane", project: "wendy-lane", page: "https://www.wendylanecc.co.za/contact", route: "https://www.wendylanecc.co.za/api/lead", env: [...SMTP, "SMTP_PASSWORD"] }, // LEAD_TO/FROM_EMAIL fall back to BUSINESS.email
  { name: "Ember", project: "ember-automations", page: "https://www.emb3r.co.za/", route: "https://www.emb3r.co.za/api/leads", env: ["RESEND_API_KEY", "NOTIFY_EMAIL"] }, // RESEND_FROM has a code default
  { name: "South Canon", project: "south-canon", page: "https://www.southcanon.com/contact", env: [...SMTP, "SMTP_PASSWORD"] },
  // SMTP settings live in a Supabase settings row, env SMTP_* is only the fallback, so no env names are required here.
  { name: "Langa Media", project: "langa-media", page: "https://www.langamedia.co.za/contact", env: [] },
  { name: "Rehoboth", project: "rehoboth", page: "https://www.rehobothherbal.co.za/contact", env: ["RESEND_API_KEY", "ORDER_NOTIFY_EMAIL"] },
  { name: "Mountain Creek", project: "mountaincreeklodge", page: "https://www.mountaincreeklodge.co.za/contact", route: "https://www.mountaincreeklodge.co.za/api/enquiry", env: ["RESEND_API_KEY", "CONTACT_TO_EMAIL", "EMAIL_FROM"] },
  { name: "Aloe Signs", project: "aloe-signs-website", page: "https://www.aloesigns.co.za/contact", route: "https://www.aloesigns.co.za/api/contact", env: [...SMTP, "SMTP_PASSWORD", "EMAIL_FROM"] }, // ADMIN_EMAIL falls back to alec@firewireit.co.za
  { name: "Everest", project: "everest-motoring", page: "https://everestmotoring.co.za/contact", env: ["RESEND_API_KEY", "RESEND_FROM_EMAIL"] },
  { name: "RVR", project: "rvr-legal-live", page: "https://www.roetsvanrensburg.co.za/contact", route: "https://www.roetsvanrensburg.co.za/api/contact", env: ["RESEND_API_KEY", "ADMIN_NOTIFICATION_EMAIL"] },
  { name: "Newsroom (Lentsu)", project: "newsroom-platform", page: "https://www.lentsu.co.za/contact", env: [...SMTP, "SMTP_PASS", "SMTP_FROM"] },
  { name: "Bushbuckridge Directory", project: "bushbuckridge-directory", page: "https://www.dbib.co.za/", env: ["RESEND_API_KEY", "ADMIN_NOTIFICATION_EMAIL", "EMAIL_FROM"] },
  { name: "Ooskus Gimnasium", project: "alecsomers1980-ooskus-gimnasium", page: "https://ooskusgim.co.za/contact", route: "https://ooskusgim.co.za/api/contact", env: [...SMTP, "SMTP_PASS", "CONTACT_DESTINATION"] },
  { name: "Woodpecker", project: "woodpecker-guesthouse", page: "https://woodpecker-guesthouse.vercel.app/contact", route: "https://woodpecker-guesthouse.vercel.app/api/contact", env: ["RESEND_API_KEY", "CONTACT_TO_EMAIL"] },
  { name: "KNP Panorama", project: "knp-panorama", page: "https://knp-panorama.vercel.app/contact", route: "https://knp-panorama.vercel.app/api/quote", env: ["RESEND_API_KEY", "QUOTE_TO_EMAIL", "QUOTE_FROM_EMAIL"] },
];

async function status(url) {
  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(20000) });
    return res.status;
  } catch (err) {
    return `unreachable (${err.cause?.code ?? err.name})`;
  }
}

function productionEnvNames(project) {
  // `vercel api` authenticates with the CLI's own login, so no token passes through this script.
  const raw = execSync(`vercel api /v9/projects/${project}/env --scope ${SCOPE} --raw`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  return new Set(JSON.parse(raw).envs.filter((e) => e.target?.includes("production")).map((e) => e.key));
}

const problems = [];
for (const site of SITES) {
  const found = [];
  const page = await status(site.page);
  if (page !== 200) found.push(`contact page ${site.page} answered ${page}`);
  if (site.route) {
    const route = await status(site.route);
    if (route !== 405 && route !== 400) found.push(`form route ${site.route} answered ${route} (expected 405 to a GET)`);
  }
  try {
    const names = productionEnvNames(site.project);
    const missing = site.env.filter((k) => !names.has(k));
    if (missing.length) found.push(`production env is missing ${missing.join(", ")} (Vercel project ${site.project})`);
  } catch (err) {
    found.push(`could not read Vercel env for ${site.project}: ${err.message.split("\n")[0]}`);
  }
  console.log(`${found.length ? "FAIL" : "ok  "} ${site.name}`);
  for (const f of found) console.log(`     - ${f}`);
  if (found.length) problems.push(site.name);
}

console.log(`\nReceipt: ${SITES.length} sites checked, ${problems.length} with problems${problems.length ? `: ${problems.join(", ")}` : ""}.`);
console.log("Not covered: whether the variables hold working values, and whether mail actually arrives (needs a live test submission).");
process.exit(problems.length ? 1 : 0);
