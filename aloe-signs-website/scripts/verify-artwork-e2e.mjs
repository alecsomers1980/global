/**
 * Drives the full public upload flow exactly as the browser does:
 * render-token -> submit -> uploadToSignedUrl -> complete.
 * Verifies the object really landed and reports whether the team was notified.
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

const { token } = await (await fetch(`${BASE}/api/artwork/render-token`)).json();
await new Promise(r => setTimeout(r, 3500));

// A minimal but genuinely valid PDF.
const pdf = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
  '2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\n' +
  'trailer<</Root 1 0 R>>\n%%EOF\n', 'utf8'
);

const submitRes = await fetch(`${BASE}/api/artwork/submit`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token,
    companyName: 'E2E Test Co',
    contactPerson: 'E2E Bot',
    contactNumber: '0111234567',
    email: 'e2e@example.com',
    description: 'Automated end-to-end verification.',
    files: [{ name: 'e2e-artwork.pdf', size: pdf.length, type: 'application/pdf' }],
  }),
});
const submit = await submitRes.json();
check(submitRes.ok && !!submit.id, 'submit accepted', JSON.stringify(submit));
if (!submit.id) process.exit(1);

// Completing before the upload must be refused.
const early = await fetch(`${BASE}/api/artwork/submit/${submit.id}/complete`, { method: 'POST' });
check(early.status === 400, 'complete refused before upload', `status ${early.status}`);

// Upload through the one-time signed URL, exactly as the browser does.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL.trim(),
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim()
);
const { path, token: uploadToken } = submit.uploads[0];
const { error: upErr } = await supabase.storage
  .from('artwork-uploads')
  .uploadToSignedUrl(path, uploadToken, pdf, { contentType: 'application/pdf' });
check(!upErr, 'file uploaded via signed URL', upErr?.message);

const doneRes = await fetch(`${BASE}/api/artwork/submit/${submit.id}/complete`, { method: 'POST' });
const done = await doneRes.json();
check(doneRes.ok && done.ok === true, 'complete accepted', JSON.stringify(done));
check(done.reference === submit.reference, 'reference is stable across submit and complete');

console.log(done.notified === false
  ? '\n  NOTE: notified=false — files landed but SMTP failed. This is the honest-failure path.'
  : '\n  NOTE: notified=true — the team email was sent.');

const { rows } = await sql`SELECT status, notified_at FROM artwork_submissions WHERE id = ${submit.id}`;
check(rows[0]?.status === 'received', 'row marked received', rows[0]?.status);

// Clean up storage and row.
// MUST use the service-role key: `supabase` above is the ANON client, and a
// private bucket refuses its delete *without raising* — which silently littered
// production with orphaned test files until someone listed the bucket by hand.
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL.trim(),
  process.env.SUPABASE_SERVICE_ROLE_KEY.trim(),
  { auth: { persistSession: false } }
);
const { error: rmErr } = await admin.storage.from('artwork-uploads').remove([path]);
check(!rmErr, 'test file removed from storage', rmErr?.message);
await sql`DELETE FROM artwork_submissions WHERE id = ${submit.id}`;
console.log('  cleaned up test submission and file');

process.exit(failed ? 1 : 0);
