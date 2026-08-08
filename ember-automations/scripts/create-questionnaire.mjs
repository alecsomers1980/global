// Create a questionnaire from a JSON payload file.
//
// The admin UI at /admin/new only sends `modules`, so it can't create a
// questionnaire with client-specific `custom` questions. The API route accepts
// them, but it's MFA-gated and can't be called headlessly. This does the same
// insert directly, reading credentials from .env.local.
//
//   node scripts/create-questionnaire.mjs payloads/rainharvest.json
//
// Payload shape: { client_name, project_name, type, modules, custom }
// matching the POST body of /api/admin/questionnaires.

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { assembleQuestionSet } from "../src/lib/questionBank.ts";
import { makeSlug } from "../src/lib/slug.ts";

for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}

const payloadPath = process.argv[2];
if (!payloadPath) {
  console.error("usage: node scripts/create-questionnaire.mjs <payload.json>");
  process.exit(1);
}

const payload = JSON.parse(readFileSync(payloadPath, "utf8"));
const question_set = assembleQuestionSet(payload.modules ?? [], payload.custom ?? []);
const slug = makeSlug(payload.project_name);

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const { data, error } = await db
  .from("questionnaires")
  .insert({
    slug,
    client_name: payload.client_name,
    project_name: payload.project_name,
    type: payload.type,
    status: "sent",
    question_set,
  })
  .select("id, slug")
  .single();

if (error) {
  console.error("FAILED:", error.message);
  process.exit(1);
}

const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.emb3r.co.za";
console.log("questions: ", question_set.length, `(${question_set.filter(q => q.critical).length} critical)`);
console.log("client:     " + site + "/intake/" + data.slug);
console.log("admin:      " + site + "/admin/" + data.id);
