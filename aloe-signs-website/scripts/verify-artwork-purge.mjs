/**
 * Seeds an EXPIRED submission with a real object in storage, runs the purge
 * endpoint, and confirms both the row and the file are gone.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
import { sql } from '@vercel/postgres';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
let failed = false;
const check = (ok, label, detail = '') => {
  if (ok) console.log(`PASS ${label}`);
  else { console.error(`FAIL ${label}${detail ? ': ' + detail : ''}`); failed = true; }
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL.trim(),
  process.env.SUPABASE_SERVICE_ROLE_KEY.trim()
);

// 1. Seed an already-expired submission.
const { rows } = await sql`
  INSERT INTO artwork_submissions
    (reference, contact_person, contact_number, status, ip_hash, delete_after, notified_at)
  VALUES ('AW-PURGE', 'Purge Bot', '0000000000', 'received', 'purgehash',
          NOW() - INTERVAL '1 day', NOW())
  RETURNING id
`;
const id = rows[0].id;

// 2. Put a real object in storage and register it.
const path = `${id}/purge-test.pdf`;
const { error: upErr } = await supabase.storage
  .from('artwork-uploads')
  .upload(path, Buffer.from('%PDF-1.4\n%%EOF\n', 'utf8'), { contentType: 'application/pdf' });
check(!upErr, 'seeded a real file in storage', upErr?.message);

await sql`
  INSERT INTO artwork_submission_files (submission_id, storage_path, original_name, size_bytes, mime_type)
  VALUES (${id}, ${path}, 'purge-test.pdf', 16, 'application/pdf')
`;

// 3. Purge.
const res = await fetch(`${BASE}/api/cron/purge-artwork`);
const body = await res.json();
check(res.ok && body.ok === true, 'purge endpoint responded', JSON.stringify(body));
check((body.purged ?? 0) >= 1, 'reported at least one purged submission', JSON.stringify(body));

// 4. Row gone?
const { rows: after } = await sql`SELECT id FROM artwork_submissions WHERE id = ${id}`;
check(after.length === 0, 'expired submission row deleted');

// 5. File gone?
const { data: listed } = await supabase.storage.from('artwork-uploads').list(id, { search: 'purge-test.pdf' });
check(!listed?.some(o => o.name === 'purge-test.pdf'), 'storage object deleted');

// 6. Cascade: file rows gone with the parent?
const { rows: orphans } = await sql`SELECT id FROM artwork_submission_files WHERE submission_id = ${id}`;
check(orphans.length === 0, 'file rows cascade-deleted');

// Clean up whatever survived.
await supabase.storage.from('artwork-uploads').remove([path]);
await sql`DELETE FROM artwork_submissions WHERE id = ${id}`;

process.exit(failed ? 1 : 0);
