/**
 * Verifies the retention clock on rows created through the real submit path.
 * Run AFTER verify-artwork-submit.mjs, which leaves 'Verify Bot' rows behind.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
import { sql } from '@vercel/postgres';

const { rows } = await sql`
  SELECT id, reference, created_at, delete_after, downloaded_at
  FROM artwork_submissions
  WHERE contact_person = 'Verify Bot'
  ORDER BY created_at DESC
  LIMIT 1
`;

if (rows.length === 0) {
  console.error('FAIL: no Verify Bot submission found — run verify-artwork-submit.mjs first');
  process.exit(1);
}

const r = rows[0];
let failed = false;

if (!r.reference || !/^AW-[0-9A-F]{6}$/.test(r.reference)) {
  console.error(`FAIL: reference is "${r.reference}" — expected AW-XXXXXX`);
  failed = true;
} else {
  console.log(`PASS: reference generated (${r.reference})`);
}

if (r.downloaded_at !== null) {
  console.error('FAIL: a brand new submission should not be marked downloaded');
  failed = true;
} else {
  console.log('PASS: new submission is not marked downloaded');
}

const days = (new Date(r.delete_after) - new Date(r.created_at)) / 86400000;
if (Math.abs(days - 30) > 0.01) {
  console.error(`FAIL: delete_after is ${days.toFixed(2)} days after created_at, expected 30`);
  failed = true;
} else {
  console.log('PASS: undownloaded retention is 30 days');
}

process.exit(failed ? 1 : 0);
