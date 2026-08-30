/**
 * Apply pending SQL migrations to the Supabase Postgres.
 *
 * Migrations are applied in filename order, each in its own transaction, and
 * recorded in schema_migrations so re-running is a no-op. This exists because
 * hand-applying migrations through the SQL editor has a habit of leaving a
 * deployed app pointed at a schema nobody can prove is current.
 *
 * Needs SUPABASE_DB_URL (Supabase → Connect → Session pooler). That string
 * carries the database password: keep it in .env.local, never in git.
 *
 * Run: npm run migrate
 */
import { Client } from "pg";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const url = process.env.SUPABASE_DB_URL;
if (!url) {
  console.error("Missing SUPABASE_DB_URL");
  process.exit(1);
}

const DIR = path.join(process.cwd(), "supabase", "migrations");
const files = readdirSync(DIR).filter((f) => f.endsWith(".sql")).sort();

// Supabase terminates SSL at the pooler with a cert this client has no root
// for; the connection is still encrypted.
const db = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await db.connect();

await db.query(`
  create table if not exists schema_migrations (
    name text primary key,
    applied_at timestamptz not null default now()
  )`);

const { rows } = await db.query("select name from schema_migrations");
const done = new Set(rows.map((r) => r.name));

let applied = 0;
for (const file of files) {
  if (done.has(file)) {
    console.log(`= ${file}`);
    continue;
  }
  const sql = readFileSync(path.join(DIR, file), "utf8");
  try {
    await db.query("begin");
    await db.query(sql);
    await db.query("insert into schema_migrations (name) values ($1)", [file]);
    await db.query("commit");
    console.log(`+ ${file}`);
    applied++;
  } catch (e) {
    await db.query("rollback");
    console.error(`\n${file} failed: ${e.message}`);
    await db.end();
    process.exit(1);
  }
}

await db.end();
console.log(applied ? `\napplied ${applied}` : "\nnothing to apply");
