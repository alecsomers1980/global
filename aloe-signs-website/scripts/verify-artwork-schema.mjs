import { config } from 'dotenv';
config({ path: '.env.local' });
import { sql } from '@vercel/postgres';

const EXPECTED_SUBMISSION_COLS = [
  'id', 'reference', 'company_name', 'contact_person', 'contact_number',
  'email', 'description', 'status', 'ip_hash', 'created_at', 'viewed_at',
  'downloaded_at', 'delete_after', 'notified_at',
];
const EXPECTED_FILE_COLS = [
  'id', 'submission_id', 'storage_path', 'original_name', 'size_bytes', 'mime_type',
];

async function cols(table) {
  const { rows } = await sql.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = $1`,
    [table]
  );
  return rows.map(r => r.column_name);
}

let failed = false;
for (const [table, expected] of [
  ['artwork_submissions', EXPECTED_SUBMISSION_COLS],
  ['artwork_submission_files', EXPECTED_FILE_COLS],
]) {
  const actual = await cols(table);
  const missing = expected.filter(c => !actual.includes(c));
  if (missing.length) {
    console.error(`FAIL ${table}: missing ${missing.join(', ')}`);
    failed = true;
  } else {
    console.log(`PASS ${table}: all ${expected.length} columns present`);
  }
}
process.exit(failed ? 1 : 0);
