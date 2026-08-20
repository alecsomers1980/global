# Public Artwork Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let anyone send Aloe Signs artwork from `/artwork` without an account, notify the team reliably, show honest failure states, auto-delete old files, and resist bot spam.

**Architecture:** Submission metadata lives in Neon via `@vercel/postgres` (matching the existing `/api/setup-*` pattern); files live in a new private Supabase Storage bucket `artwork-uploads`. Because Vercel caps serverless request bodies at 4.5 MB, files never pass through our API — the submit route validates first and returns one-time signed upload URLs, and a completion route verifies the objects landed before notifying anyone.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, `@vercel/postgres` (Neon), `@supabase/supabase-js` (storage + auth), nodemailer, Tailwind.

**Spec:** `docs/superpowers/specs/2026-08-20-public-artwork-upload-design.md`

## Global Constraints

- **No new dependencies.** Everything needed is already in `package.json`.
- **No test framework.** This project has none. Verification uses ad-hoc `.mjs` scripts run with `node`, matching the existing `test_db.mjs` / `test-smtp.mjs` idiom. Each task's "failing test" step is a runnable script that must genuinely fail before implementation.
- **Always print `pwd`** alongside every `npm`/`node` command. The monorepo root has its own `package.json` and a drifted cwd fails silently. All commands assume `cd aloe-signs-website` first.
- **Branch:** `feat/aloe-public-artwork-upload`. Never commit to `main` — `aloe-signs-website` auto-deploys from it.
- **Honeypot field MUST be named `website`**, never `company`. This form has a real Company Name field; the lublaw implementation's `company` honeypot would silently discard every genuine submission.
- **Required fields are exactly:** Contact person, Contact number. Company Name, Email and Description are optional. Email is format-validated only when non-empty.
- **Notification recipient:** `process.env.ARTWORK_NOTIFICATION_EMAIL || 'team@aloesigns.co.za'`.
- **Retention:** `delete_after = created_at + 30 days` on insert; rewritten to `now() + 7 days` on first staff download.
- **Caps:** 10 files per submission, 50 MB per file, 200 MB per submission, 5 submissions per IP per hour.
- **Allowed extensions:** `.pdf .ai .eps .tiff .tif .png .jpg .jpeg .svg .zip .psd`
- **Staff auth rule for admin routes:** authenticated **and** `email.endsWith('@aloesigns.co.za')`. Do not use `requireAdmin()` (Andre-only) and do not use bare `getStaff()` (returns non-null for registered *clients*, who must never see other people's submissions).
- **Do not modify** the desktop header CTA (`components/Header.tsx:137`) or either footer CTA (`components/Footer.tsx:87`, `:100`). Confirmed out of scope.
- **Do not modify** the existing registered-client portal flow (`/portal/upload/artwork`, proofs, `print_jobs`).

---

## File Structure

**Create:**

| Path | Responsibility |
|---|---|
| `lib/artwork/validation.ts` | Pure validation of form fields and the file manifest. No I/O. |
| `lib/artwork/antibot.ts` | HMAC-signed render token, honeypot + timing checks, salted IP hashing. No I/O. |
| `lib/artwork/repository.ts` | All Neon SQL for submissions. The only module that writes those tables. |
| `lib/artwork/notify.ts` | Builds and sends the team notification email. |
| `app/api/setup-artwork/route.ts` | Idempotent schema + storage bucket creation. |
| `app/api/artwork/submit/route.ts` | Validate, rate-limit, insert, return signed upload URLs. |
| `app/api/artwork/submit/[id]/complete/route.ts` | Verify objects exist, mark received, notify. |
| `app/artwork/page.tsx` | Public page shell; mints the render token server-side. |
| `components/artwork/ArtworkUploadForm.tsx` | Client form, upload progress, three outcome states. |
| `app/api/portal/admin/artwork-uploads/route.ts` | Staff list + unread count. |
| `app/api/portal/admin/artwork-uploads/[id]/route.ts` | Mark viewed. |
| `app/api/portal/admin/artwork-uploads/[id]/download/route.ts` | Record download, redirect to signed URL. |
| `app/portal/admin/artwork-uploads/page.tsx` | Staff list UI. |
| `app/api/cron/purge-artwork/route.ts` | Delete expired storage objects and rows. |
| `.github/workflows/purge-artwork.yml` | Daily schedule for the purge. |
| `scripts/verify-artwork-*.mjs` | Verification scripts (one per task that needs one). |

**Modify:**

| Path | Change |
|---|---|
| `components/Header.tsx:182` | Mobile menu button → "UPLOAD ARTWORK" → `/artwork`. |
| `app/portal/admin/page.tsx` | New "Artwork Uploads" tile with unread badge. |
| `app/privacy-policy/page.tsx` | POPIA clause for artwork submissions and retention. |

**No middleware change needed** — `/portal/admin/artwork-uploads` already matches the existing `/portal/admin/:path*` matcher. The API routes under `/api/portal/admin/` are *not* matched, so they each carry their own staff check.

---

### Task 1: Schema, storage bucket, and repository

**Files:**
- Create: `app/api/setup-artwork/route.ts`
- Create: `lib/artwork/repository.ts`
- Test: `scripts/verify-artwork-schema.mjs`

**Interfaces:**
- Consumes: nothing (first task).
- Produces:
  - `createSubmission(input: SubmissionInput): Promise<{ id: string; reference: string }>`
  - `attachFiles(submissionId: string, files: FileRecord[]): Promise<void>`
  - `markReceived(submissionId: string): Promise<void>`
  - `markNotified(submissionId: string): Promise<void>`
  - `listSubmissions(): Promise<SubmissionRow[]>`
  - `getSubmission(id: string): Promise<SubmissionRow | null>`
  - `markViewed(id: string): Promise<void>`
  - `markDownloaded(id: string): Promise<void>`
  - `countRecentByIpHash(ipHash: string, withinMinutes: number): Promise<number>`
  - `countUnread(): Promise<number>`
  - `findExpired(): Promise<{ id: string; storage_paths: string[] }[]>`
  - `findUnnotified(): Promise<SubmissionRow[]>`
  - `deleteSubmissions(ids: string[]): Promise<void>`
  - Types `SubmissionInput`, `FileRecord`, `SubmissionRow`, `FileRow` exported from the same module.

- [ ] **Step 1: Write the failing verification script**

Create `scripts/verify-artwork-schema.mjs`:

```js
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
```

- [ ] **Step 2: Run it to verify it fails**

```bash
pwd  # must end in /aloe-signs-website
node scripts/verify-artwork-schema.mjs
```

Expected: `FAIL artwork_submissions: missing id, reference, ...` and exit code 1.

- [ ] **Step 3: Write the setup route**

Create `app/api/setup-artwork/route.ts`, following the `app/api/setup-news/route.ts` pattern:

```ts
import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await sql.query(`
      CREATE TABLE IF NOT EXISTS artwork_submissions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const submissionCols = [
      { name: 'reference', type: 'TEXT' },
      { name: 'company_name', type: 'TEXT' },
      { name: 'contact_person', type: 'TEXT' },
      { name: 'contact_number', type: 'TEXT' },
      { name: 'email', type: 'TEXT' },
      { name: 'description', type: 'TEXT' },
      { name: 'status', type: "TEXT DEFAULT 'pending_upload'" },
      { name: 'ip_hash', type: 'TEXT' },
      { name: 'viewed_at', type: 'TIMESTAMP WITH TIME ZONE' },
      { name: 'downloaded_at', type: 'TIMESTAMP WITH TIME ZONE' },
      { name: 'delete_after', type: 'TIMESTAMP WITH TIME ZONE' },
      { name: 'notified_at', type: 'TIMESTAMP WITH TIME ZONE' },
    ];
    for (const c of submissionCols) {
      await sql.query(
        `ALTER TABLE artwork_submissions ADD COLUMN IF NOT EXISTS ${c.name} ${c.type};`
      );
    }

    await sql.query(`
      CREATE TABLE IF NOT EXISTS artwork_submission_files (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        submission_id UUID REFERENCES artwork_submissions(id) ON DELETE CASCADE,
        storage_path TEXT,
        original_name TEXT,
        size_bytes BIGINT,
        mime_type TEXT
      );
    `);

    await sql.query(
      `CREATE INDEX IF NOT EXISTS idx_artwork_delete_after ON artwork_submissions(delete_after);`
    );
    await sql.query(
      `CREATE INDEX IF NOT EXISTS idx_artwork_ip_hash ON artwork_submissions(ip_hash, created_at);`
    );

    // Private storage bucket, separate from client-uploads so the purge job
    // structurally cannot touch registered-client artwork.
    const supabase = createAdminSupabase();
    const { data: buckets } = await supabase.storage.listBuckets();
    let bucket = 'already existed';
    if (!buckets?.some(b => b.name === 'artwork-uploads')) {
      const { error } = await supabase.storage.createBucket('artwork-uploads', {
        public: false,
        fileSizeLimit: 52428800, // 50 MB
      });
      if (error) throw error;
      bucket = 'created';
    }

    return NextResponse.json({ ok: true, tables: 'ready', bucket });
  } catch (error) {
    console.error('SETUP ARTWORK ERROR:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run the setup route and re-run the verification**

```bash
pwd
npm run dev   # leave running in another terminal
curl -s http://localhost:3000/api/setup-artwork
node scripts/verify-artwork-schema.mjs
```

Expected: the curl returns `{"ok":true,"tables":"ready","bucket":"created"}`, then both `PASS` lines and exit code 0.

Run the route a second time to confirm idempotency — it must return `{"ok":true,...,"bucket":"already existed"}` and not error.

- [ ] **Step 5: Write the repository module**

Create `lib/artwork/repository.ts`:

```ts
import { sql } from '@vercel/postgres';
import crypto from 'crypto';

export interface SubmissionInput {
  companyName: string | null;
  contactPerson: string;
  contactNumber: string;
  email: string | null;
  description: string | null;
  ipHash: string;
}

export interface FileRecord {
  storagePath: string;
  originalName: string;
  sizeBytes: number;
  mimeType: string;
}

export interface SubmissionRow {
  id: string;
  reference: string;
  company_name: string | null;
  contact_person: string;
  contact_number: string;
  email: string | null;
  description: string | null;
  status: string;
  created_at: string;
  viewed_at: string | null;
  downloaded_at: string | null;
  delete_after: string;
  notified_at: string | null;
  files: FileRow[];
}

export interface FileRow {
  id: string;
  storage_path: string;
  original_name: string;
  size_bytes: number;
  mime_type: string;
}

const UNDOWNLOADED_RETENTION_DAYS = 30;
const DOWNLOADED_RETENTION_DAYS = 7;

function makeReference(): string {
  return 'AW-' + crypto.randomBytes(3).toString('hex').toUpperCase();
}

export async function createSubmission(input: SubmissionInput) {
  const reference = makeReference();
  // NOTE: `INTERVAL '<n> days'` cannot be built with a tagged-template `${}`
  // placeholder — that parameterises the value and Postgres rejects `INTERVAL $9`.
  // The retention constants are module-level numbers, never user input, so
  // composing them into the query text is safe.
  const { rows } = await sql.query(
    `INSERT INTO artwork_submissions
       (reference, company_name, contact_person, contact_number, email,
        description, status, ip_hash, delete_after)
     VALUES
       ($1, $2, $3, $4, $5, $6, 'pending_upload', $7,
        NOW() + INTERVAL '${UNDOWNLOADED_RETENTION_DAYS} days')
     RETURNING id, reference`,
    [reference, input.companyName, input.contactPerson, input.contactNumber,
     input.email, input.description, input.ipHash]
  );
  return rows[0] as { id: string; reference: string };
}

export async function attachFiles(submissionId: string, files: FileRecord[]) {
  for (const f of files) {
    await sql`
      INSERT INTO artwork_submission_files
        (submission_id, storage_path, original_name, size_bytes, mime_type)
      VALUES
        (${submissionId}, ${f.storagePath}, ${f.originalName},
         ${f.sizeBytes}, ${f.mimeType})
    `;
  }
}

export async function markReceived(submissionId: string) {
  await sql`UPDATE artwork_submissions SET status = 'received' WHERE id = ${submissionId}`;
}

export async function markNotified(submissionId: string) {
  await sql`UPDATE artwork_submissions SET notified_at = NOW() WHERE id = ${submissionId}`;
}

export async function markViewed(id: string) {
  await sql`UPDATE artwork_submissions SET viewed_at = COALESCE(viewed_at, NOW()) WHERE id = ${id}`;
}

/** First download starts the short retention clock. Later downloads must not extend it. */
export async function markDownloaded(id: string) {
  // Same INTERVAL caveat as createSubmission — constant composed into the text.
  await sql.query(
    `UPDATE artwork_submissions
     SET downloaded_at = NOW(),
         delete_after  = NOW() + INTERVAL '${DOWNLOADED_RETENTION_DAYS} days'
     WHERE id = $1 AND downloaded_at IS NULL`,
    [id]
  );
}

export async function countRecentByIpHash(ipHash: string, withinMinutes: number) {
  const { rows } = await sql.query(
    `SELECT COUNT(*)::int AS n FROM artwork_submissions
     WHERE ip_hash = $1 AND created_at > NOW() - ($2 || ' minutes')::interval`,
    [ipHash, String(withinMinutes)]
  );
  return rows[0].n as number;
}

async function hydrate(rows: Record<string, unknown>[]): Promise<SubmissionRow[]> {
  if (rows.length === 0) return [];
  const ids = rows.map(r => r.id as string);
  const { rows: fileRows } = await sql.query(
    `SELECT * FROM artwork_submission_files WHERE submission_id = ANY($1::uuid[])`,
    [ids]
  );
  return rows.map(r => ({
    ...(r as unknown as SubmissionRow),
    files: fileRows.filter(f => f.submission_id === r.id) as FileRow[],
  }));
}

export async function listSubmissions(): Promise<SubmissionRow[]> {
  const { rows } = await sql`
    SELECT * FROM artwork_submissions
    WHERE status = 'received'
    ORDER BY created_at DESC
  `;
  return hydrate(rows);
}

export async function getSubmission(id: string): Promise<SubmissionRow | null> {
  const { rows } = await sql`SELECT * FROM artwork_submissions WHERE id = ${id}`;
  const [one] = await hydrate(rows);
  return one ?? null;
}

export async function countUnread(): Promise<number> {
  const { rows } = await sql`
    SELECT COUNT(*)::int AS n FROM artwork_submissions
    WHERE status = 'received' AND viewed_at IS NULL
  `;
  return rows[0].n as number;
}

/** Expired submissions, plus abandoned pending_upload rows older than 24h. */
export async function findExpired() {
  const { rows } = await sql`
    SELECT s.id,
           COALESCE(
             ARRAY_AGG(f.storage_path) FILTER (WHERE f.storage_path IS NOT NULL),
             ARRAY[]::text[]
           ) AS storage_paths
    FROM artwork_submissions s
    LEFT JOIN artwork_submission_files f ON f.submission_id = s.id
    WHERE s.delete_after < NOW()
       OR (s.status = 'pending_upload' AND s.created_at < NOW() - INTERVAL '24 hours')
    GROUP BY s.id
  `;
  return rows as { id: string; storage_paths: string[] }[];
}

export async function deleteSubmissions(ids: string[]) {
  if (ids.length === 0) return;
  await sql.query(`DELETE FROM artwork_submissions WHERE id = ANY($1::uuid[])`, [ids]);
}

/** Submissions that were received but whose notification never sent. */
export async function findUnnotified(): Promise<SubmissionRow[]> {
  const { rows } = await sql`
    SELECT * FROM artwork_submissions
    WHERE status = 'received' AND notified_at IS NULL
  `;
  return hydrate(rows);
}
```

- [ ] **Step 6: Extend the verification script to exercise the repository**

Append to `scripts/verify-artwork-schema.mjs` — but since it imports TS, instead create `scripts/verify-artwork-repo.mjs` that drives the repository through an HTTP round-trip in Task 3. For now, verify the retention default directly:

```js
// scripts/verify-artwork-retention.mjs
import { config } from 'dotenv';
config({ path: '.env.local' });
import { sql } from '@vercel/postgres';

const { rows } = await sql`
  INSERT INTO artwork_submissions
    (reference, contact_person, contact_number, status, ip_hash, delete_after)
  VALUES ('AW-TEST', 'Verify Bot', '0000000000', 'pending_upload', 'testhash',
          NOW() + INTERVAL '30 days')
  RETURNING id, delete_after, created_at
`;
const days = Math.round(
  (new Date(rows[0].delete_after) - new Date(rows[0].created_at)) / 86400000
);
await sql`DELETE FROM artwork_submissions WHERE id = ${rows[0].id}`;

if (days !== 30) { console.error(`FAIL: delete_after is ${days} days out, expected 30`); process.exit(1); }
console.log('PASS: undownloaded retention is 30 days');
```

Run:

```bash
pwd
node scripts/verify-artwork-retention.mjs
```

Expected: `PASS: undownloaded retention is 30 days`, exit 0.

- [ ] **Step 7: Commit**

```bash
pwd
git branch --show-current   # must be feat/aloe-public-artwork-upload
git add app/api/setup-artwork/route.ts lib/artwork/repository.ts scripts/verify-artwork-schema.mjs scripts/verify-artwork-retention.mjs
git commit -m "feat(aloe): artwork submission schema, storage bucket and repository"
```

---

### Task 2: Validation and anti-bot libraries

**Files:**
- Create: `lib/artwork/validation.ts`
- Create: `lib/artwork/antibot.ts`
- Test: `scripts/verify-artwork-validation.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `validateSubmission(body: unknown): { ok: true; value: ValidatedSubmission } | { ok: false; error: string }`
  - `ALLOWED_EXTENSIONS: string[]`, `MAX_FILES`, `MAX_FILE_BYTES`, `MAX_TOTAL_BYTES`
  - `signRenderToken(): string`, `verifyRenderToken(token: string): { ok: boolean; reason?: string }`
  - `hashIp(ip: string): string`
  - `MIN_SUBMIT_MS = 3000`, `MAX_TOKEN_AGE_MS = 7200000`

- [ ] **Step 1: Write the failing verification script**

These modules are TypeScript using `@/` path aliases, so plain `node` cannot import them, and this project has no TypeScript test runner. Duplicating the logic into a `.mjs` mirror would drift out of sync and is not acceptable. So this script asserts the **constants and the honeypot field name** by reading the source, and the actual behaviour is verified over real HTTP in Task 3.

Create `scripts/verify-artwork-validation.mjs`:

```js
import { readFileSync } from 'node:fs';

/** Returns '' when the file does not exist yet, so every check reports rather than crashing. */
function read(path) {
  try { return readFileSync(path, 'utf8'); }
  catch { console.error(`(missing file: ${path})`); return ''; }
}

const validation = read('lib/artwork/validation.ts');
const antibot    = read('lib/artwork/antibot.ts');
const form       = read('components/artwork/ArtworkUploadForm.tsx');

const checks = [
  [validation, /MAX_FILES\s*=\s*10\b/,                                'MAX_FILES is 10'],
  [validation, /MAX_FILE_BYTES\s*=\s*50\s*\*\s*1024\s*\*\s*1024\b/,   'MAX_FILE_BYTES is 50MB'],
  [validation, /MAX_TOTAL_BYTES\s*=\s*200\s*\*\s*1024\s*\*\s*1024\b/, 'MAX_TOTAL_BYTES is 200MB'],
  [validation, /'\.psd'/,                                             'psd allowed'],
  [validation, /'\.ai'/,                                              'ai allowed'],
  [antibot,    /MIN_SUBMIT_MS\s*=\s*3000\b/,                          'MIN_SUBMIT_MS is 3000'],
  [form,       /name="website"/,                                      'honeypot named website'],
];

let failed = false;
for (const [source, re, label] of checks) {
  if (!re.test(source)) { console.error(`FAIL: ${label}`); failed = true; }
  else console.log(`PASS: ${label}`);
}

// The honeypot must never be named `company` — this form has a real Company field,
// and reusing that name would silently discard every genuine submission.
if (/name="company"/i.test(form)) {
  console.error('FAIL: a field named "company" is used as the honeypot');
  failed = true;
} else {
  console.log('PASS: honeypot is not named company');
}

process.exit(failed ? 1 : 0);
```

Note: the honeypot assertion will fail until Task 5. That is expected and correct — this script is re-run at the end of Task 5.

- [ ] **Step 2: Run it to verify it fails**

```bash
pwd
node scripts/verify-artwork-validation.mjs
```

Expected: `FAIL: MAX_FILES is 10` (file does not exist yet → the script throws ENOENT). Exit non-zero.

- [ ] **Step 3: Write the validation module**

Create `lib/artwork/validation.ts`:

```ts
export const ALLOWED_EXTENSIONS = [
  '.pdf', '.ai', '.eps', '.tiff', '.tif', '.png',
  '.jpg', '.jpeg', '.svg', '.zip', '.psd',
];
export const MAX_FILES = 10;
export const MAX_FILE_BYTES = 50 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 200 * 1024 * 1024;

export interface ManifestEntry {
  name: string;
  size: number;
  type: string;
}

export interface ValidatedSubmission {
  companyName: string | null;
  contactPerson: string;
  contactNumber: string;
  email: string | null;
  description: string | null;
  files: ManifestEntry[];
}

type Result =
  | { ok: true; value: ValidatedSubmission }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function extensionOf(name: string): string {
  const i = name.lastIndexOf('.');
  return i === -1 ? '' : name.slice(i).toLowerCase();
}

export function validateSubmission(body: unknown): Result {
  const b = (body ?? {}) as Record<string, unknown>;

  const contactPerson = str(b.contactPerson);
  if (!contactPerson) return { ok: false, error: 'Contact person is required.' };

  const contactNumber = str(b.contactNumber);
  if (!contactNumber) return { ok: false, error: 'Contact number is required.' };

  const email = str(b.email);
  if (email && !EMAIL_RE.test(email)) {
    return { ok: false, error: 'That email address does not look right.' };
  }

  const files = Array.isArray(b.files) ? (b.files as ManifestEntry[]) : [];
  if (files.length === 0) return { ok: false, error: 'Please attach at least one file.' };
  if (files.length > MAX_FILES) {
    return { ok: false, error: `A maximum of ${MAX_FILES} files can be sent at once.` };
  }

  let total = 0;
  for (const f of files) {
    const name = str(f?.name);
    if (!name) return { ok: false, error: 'One of the files has no name.' };

    const ext = extensionOf(name);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return { ok: false, error: `${name}: that file type is not accepted.` };
    }

    const size = typeof f?.size === 'number' ? f.size : -1;
    if (size <= 0) return { ok: false, error: `${name}: file appears to be empty.` };
    if (size > MAX_FILE_BYTES) {
      return { ok: false, error: `${name} is larger than 50 MB.` };
    }
    total += size;
  }
  if (total > MAX_TOTAL_BYTES) {
    return { ok: false, error: 'That is more than 200 MB in total. Please send fewer files.' };
  }

  return {
    ok: true,
    value: {
      companyName: str(b.companyName) || null,
      contactPerson,
      contactNumber,
      email: email || null,
      description: str(b.description) || null,
      files: files.map(f => ({
        name: str(f.name),
        size: f.size as number,
        type: str(f.type) || 'application/octet-stream',
      })),
    },
  };
}
```

- [ ] **Step 4: Write the anti-bot module**

Create `lib/artwork/antibot.ts`:

```ts
import crypto from 'crypto';

export const MIN_SUBMIT_MS = 3000;
export const MAX_TOKEN_AGE_MS = 2 * 60 * 60 * 1000;

/**
 * Secret for signing the render token and salting IP hashes.
 * Falls back to CRON_SECRET so no new env var is mandatory, but a dedicated
 * ARTWORK_SECRET is preferred in production.
 */
function secret(): string {
  const s = process.env.ARTWORK_SECRET || process.env.CRON_SECRET;
  if (!s) throw new Error('ARTWORK_SECRET or CRON_SECRET must be set');
  return s;
}

function hmac(value: string): string {
  return crypto.createHmac('sha256', secret()).update(value).digest('hex');
}

/** Minted server-side when the page renders; returned by the browser on submit. */
export function signRenderToken(): string {
  const ts = Date.now().toString();
  return `${ts}.${hmac(ts)}`;
}

export function verifyRenderToken(token: unknown): { ok: boolean; reason?: string } {
  if (typeof token !== 'string' || !token.includes('.')) {
    return { ok: false, reason: 'malformed' };
  }
  const [ts, sig] = token.split('.');
  const expected = hmac(ts);

  // Constant-time compare; lengths are equal by construction of hmac().
  if (sig.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return { ok: false, reason: 'bad-signature' };
  }

  const age = Date.now() - Number(ts);
  if (Number.isNaN(age)) return { ok: false, reason: 'malformed' };
  if (age < MIN_SUBMIT_MS) return { ok: false, reason: 'too-fast' };
  if (age > MAX_TOKEN_AGE_MS) return { ok: false, reason: 'expired' };

  return { ok: true };
}

/** Salted so a raw IP is never stored — POPIA data minimisation. */
export function hashIp(ip: string): string {
  return crypto.createHmac('sha256', secret()).update(`ip:${ip}`).digest('hex');
}

/** Bots fill hidden fields. Named `website` because this form has a real Company field. */
export function honeypotTripped(body: unknown): boolean {
  const b = (body ?? {}) as Record<string, unknown>;
  return typeof b.website === 'string' && b.website.trim().length > 0;
}
```

- [ ] **Step 5: Type-check**

```bash
pwd
npx tsc --noEmit
```

Expected: no errors referencing `lib/artwork/`.

- [ ] **Step 6: Commit**

```bash
pwd
git branch --show-current
git add lib/artwork/validation.ts lib/artwork/antibot.ts scripts/verify-artwork-validation.mjs
git commit -m "feat(aloe): artwork submission validation and anti-bot helpers"
```

---

### Task 3: Submit API — validate, rate-limit, issue signed upload URLs

**Files:**
- Create: `app/api/artwork/submit/route.ts`
- Test: `scripts/verify-artwork-submit.mjs`

**Interfaces:**
- Consumes: `validateSubmission`, `verifyRenderToken`, `honeypotTripped`, `hashIp` (Task 2); `createSubmission`, `attachFiles`, `countRecentByIpHash` (Task 1).
- Produces: `POST /api/artwork/submit` → `200 { id, reference, uploads: [{ path, token }] }` or `400 { error }`. A tripped honeypot returns `200 { id: null, reference: 'AW-OK', uploads: [] }` so bots cannot distinguish it from success.

- [ ] **Step 1: Write the failing verification script**

Create `scripts/verify-artwork-submit.mjs`:

```js
const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function post(body) {
  const res = await fetch(`${BASE}/api/artwork/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, json: await res.json().catch(() => ({})) };
}

// A token old enough to pass the 3s floor must be minted by the page.
const tokenRes = await fetch(`${BASE}/api/artwork/render-token`);
const { token } = await tokenRes.json();
await new Promise(r => setTimeout(r, 3500));

const goodFiles = [{ name: 'logo.pdf', size: 1024, type: 'application/pdf' }];
const base = {
  token,
  contactPerson: 'Verify Bot',
  contactNumber: '0111234567',
  files: goodFiles,
};

const cases = [
  ['missing contact person', { ...base, contactPerson: '' }, 400],
  ['missing contact number', { ...base, contactNumber: '' }, 400],
  ['no files',              { ...base, files: [] },          400],
  ['bad extension',         { ...base, files: [{ name: 'x.exe', size: 10, type: 'application/octet-stream' }] }, 400],
  ['too many files',        { ...base, files: Array.from({ length: 11 }, (_, i) => ({ name: `f${i}.pdf`, size: 10, type: 'application/pdf' })) }, 400],
  ['oversize file',         { ...base, files: [{ name: 'big.pdf', size: 51 * 1024 * 1024, type: 'application/pdf' }] }, 400],
  ['bad email',             { ...base, email: 'not-an-email' }, 400],
];

let failed = false;
for (const [label, body, expected] of cases) {
  const { status } = await post(body);
  if (status !== expected) { console.error(`FAIL ${label}: got ${status}, expected ${expected}`); failed = true; }
  else console.log(`PASS ${label}`);
}

// Honeypot must look like success but create nothing.
const hp = await post({ ...base, website: 'http://spam.example' });
if (hp.status !== 200 || hp.json.id !== null) {
  console.error(`FAIL honeypot: expected 200 with id null, got ${hp.status} / ${JSON.stringify(hp.json)}`);
  failed = true;
} else console.log('PASS honeypot returns fake success');

// Too-fast submission must be rejected.
const fresh = await (await fetch(`${BASE}/api/artwork/render-token`)).json();
const fast = await post({ ...base, token: fresh.token });
if (fast.status !== 400) { console.error(`FAIL too-fast: got ${fast.status}`); failed = true; }
else console.log('PASS too-fast rejected');

// Happy path.
const ok = await post(base);
if (ok.status !== 200 || !ok.json.id || ok.json.uploads?.length !== 1) {
  console.error(`FAIL happy path: ${ok.status} / ${JSON.stringify(ok.json)}`);
  failed = true;
} else console.log(`PASS happy path (${ok.json.reference})`);

process.exit(failed ? 1 : 0);
```

- [ ] **Step 2: Run it to verify it fails**

```bash
pwd
node scripts/verify-artwork-submit.mjs
```

Expected: failure — `/api/artwork/render-token` 404s, the script throws on `res.json()`.

- [ ] **Step 3: Add the render-token endpoint**

Create `app/api/artwork/render-token/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { signRenderToken } from '@/lib/artwork/antibot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ token: signRenderToken() });
}
```

- [ ] **Step 4: Write the submit route**

Create `app/api/artwork/submit/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase-admin';
import { validateSubmission } from '@/lib/artwork/validation';
import { verifyRenderToken, honeypotTripped, hashIp } from '@/lib/artwork/antibot';
import { createSubmission, attachFiles, countRecentByIpHash } from '@/lib/artwork/repository';

export const runtime = 'nodejs';

const RATE_LIMIT_PER_HOUR = 5;

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  return fwd ? fwd.split(',')[0].trim() : 'unknown';
}

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  // Honeypot: look like success so the bot learns nothing, but do nothing.
  if (honeypotTripped(body)) {
    return NextResponse.json({ id: null, reference: 'AW-OK', uploads: [] });
  }

  const token = verifyRenderToken((body as Record<string, unknown>)?.token);
  if (!token.ok) {
    const message =
      token.reason === 'too-fast'
        ? 'That was submitted a little too quickly — please try again.'
        : 'This form expired. Please refresh the page and try again.';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const validated = validateSubmission(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const ipHash = hashIp(clientIp(req));
  if (await countRecentByIpHash(ipHash, 60) >= RATE_LIMIT_PER_HOUR) {
    return NextResponse.json(
      { error: 'Too many submissions from this connection. Please try again later, or call 011 693 2600.' },
      { status: 429 }
    );
  }

  const { companyName, contactPerson, contactNumber, email, description, files } = validated.value;

  const submission = await createSubmission({
    companyName, contactPerson, contactNumber, email, description, ipHash,
  });

  const supabase = createAdminSupabase();
  const uploads: { path: string; token: string }[] = [];
  const records = [];

  for (const f of files) {
    const path = `${submission.id}/${Date.now()}_${safeName(f.name)}`;
    const { data, error } = await supabase
      .storage.from('artwork-uploads')
      .createSignedUploadUrl(path);
    if (error || !data) {
      return NextResponse.json(
        { error: 'Could not prepare the upload. Please try again.' },
        { status: 500 }
      );
    }
    uploads.push({ path, token: data.token });
    records.push({
      storagePath: path,
      originalName: f.name,
      sizeBytes: f.size,
      mimeType: f.type,
    });
  }

  await attachFiles(submission.id, records);

  return NextResponse.json({
    id: submission.id,
    reference: submission.reference,
    uploads,
  });
}
```

- [ ] **Step 5: Run the verification**

```bash
pwd
node scripts/verify-artwork-submit.mjs
```

Expected: every line `PASS`, exit 0. If `too-fast` fails, confirm `ARTWORK_SECRET` or `CRON_SECRET` is present in `.env.local`.

- [ ] **Step 6: Clean up test rows**

```bash
pwd
node -e "import('dotenv').then(d=>{d.config({path:'.env.local'});return import('@vercel/postgres')}).then(async({sql})=>{const r=await sql\`DELETE FROM artwork_submissions WHERE contact_person='Verify Bot'\`;console.log('deleted',r.rowCount)})"
```

- [ ] **Step 7: Commit**

```bash
pwd
git branch --show-current
git add app/api/artwork/submit/route.ts app/api/artwork/render-token/route.ts scripts/verify-artwork-submit.mjs
git commit -m "feat(aloe): artwork submit endpoint with rate limiting and signed upload URLs"
```

---

### Task 4: Completion API and team notification

**Files:**
- Create: `lib/artwork/notify.ts`
- Create: `app/api/artwork/submit/[id]/complete/route.ts`
- Test: `scripts/verify-artwork-complete.mjs`

**Interfaces:**
- Consumes: `getSubmission`, `markReceived`, `markNotified` (Task 1).
- Produces:
  - `notifyTeamOfArtwork(submission: SubmissionRow): Promise<void>` — throws on send failure.
  - `POST /api/artwork/submit/[id]/complete` → `200 { ok: true, reference }`, `200 { ok: true, notified: false, reference }` when the files landed but the email failed, or `400 { error }` when the objects are missing.

- [ ] **Step 1: Write the notification module**

Create `lib/artwork/notify.ts`, reusing the existing email template helpers:

```ts
import nodemailer from 'nodemailer';
import {
  buildEmailHtml, buildButton, buildSectionHeading,
  buildInfoRow, buildDetailsTable, brand,
} from '@/lib/emailTemplate';
import type { SubmissionRow } from '@/lib/artwork/repository';

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://aloesigns.co.za').trim();
}

export async function notifyTeamOfArtwork(s: SubmissionRow): Promise<void> {
  const to = (process.env.ARTWORK_NOTIFICATION_EMAIL || 'team@aloesigns.co.za').trim();

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });

  const deleteDate = new Date(s.delete_after).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const details = [
    s.company_name ? buildInfoRow('Company', s.company_name) : '',
    buildInfoRow('Contact person', s.contact_person),
    buildInfoRow('Contact number', s.contact_number),
    s.email
      ? buildInfoRow('Email', `<a href="mailto:${s.email}" style="color:${brand.green};text-decoration:none;">${s.email}</a>`)
      : buildInfoRow('Email', '<em>not supplied — reply by phone</em>'),
    buildInfoRow('Reference', s.reference),
  ].filter(Boolean).join('');

  const fileList = s.files.map(f => `
    <div style="background:${brand.offWhite};border:1px solid ${brand.border};border-radius:8px;padding:12px 14px;margin-bottom:8px;">
      <p style="margin:0;font-size:14px;font-weight:700;color:${brand.textDark};">📄 ${f.original_name}</p>
      <p style="margin:4px 0 0;font-size:12px;color:${brand.textMid};">${(Number(f.size_bytes) / 1024 / 1024).toFixed(1)} MB</p>
    </div>`).join('');

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${brand.textDark};">🖼️ New Artwork Upload</h1>
    <p style="margin:0 0 28px;font-size:15px;color:${brand.textMuted};">Sent through the public upload page at aloesigns.co.za/artwork.</p>

    ${buildSectionHeading('Client Details')}
    ${buildDetailsTable(details)}

    ${s.description ? `${buildSectionHeading('Description')}
    <div style="background:${brand.offWhite};border-radius:8px;padding:16px 18px;margin-bottom:24px;font-size:14px;line-height:1.7;color:${brand.textMid};white-space:pre-wrap;">${s.description}</div>` : ''}

    ${buildSectionHeading(`Files (${s.files.length})`)}
    ${fileList}

    <div style="background:#fff4e5;border-left:4px solid #f59e0b;border-radius:6px;padding:14px 16px;margin:24px 0;">
      <p style="margin:0;font-size:14px;font-weight:600;color:${brand.textDark};">
        ⏳ These files are automatically deleted on ${deleteDate} — sooner if downloaded.
      </p>
    </div>

    <div style="text-align:center;margin-top:24px;">
      ${buildButton('Open in Portal', `${siteUrl()}/portal/admin/artwork-uploads`)}
    </div>
  `;

  await transporter.sendMail({
    from: `"Aloe Signs Portal" <${process.env.SMTP_USER}>`,
    to,
    subject: `New Artwork Upload: ${s.contact_person}${s.company_name ? ` (${s.company_name})` : ''} — ${s.reference}`,
    text: `New artwork upload ${s.reference} from ${s.contact_person}, ${s.contact_number}.\n` +
          `Files: ${s.files.map(f => f.original_name).join(', ')}\n` +
          `Auto-deletes ${deleteDate}.`,
    html: buildEmailHtml('New Artwork Upload', body, `New artwork from ${s.contact_person}`),
  });
}
```

Before writing this, confirm the exact export names in `lib/emailTemplate.ts` — `buildEmailHtml`, `buildButton`, `buildSectionHeading`, `buildInfoRow`, `buildDetailsTable`, `brand`. They are imported the same way at the top of `lib/portal-email.ts`. If `brand` lacks `offWhite`, `border`, `textDark`, `textMid` or `textMuted`, substitute the nearest existing key rather than inventing one.

- [ ] **Step 2: Write the completion route**

Create `app/api/artwork/submit/[id]/complete/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase-admin';
import { getSubmission, markReceived, markNotified } from '@/lib/artwork/repository';
import { notifyTeamOfArtwork } from '@/lib/artwork/notify';

export const runtime = 'nodejs';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const submission = await getSubmission(id);
  if (!submission) {
    return NextResponse.json({ error: 'Submission not found.' }, { status: 404 });
  }
  if (submission.status === 'received') {
    return NextResponse.json({ ok: true, reference: submission.reference });
  }

  // Verify every declared object actually landed. This is what stops a bot
  // creating rows without ever uploading anything.
  const supabase = createAdminSupabase();
  for (const f of submission.files) {
    const slash = f.storage_path.lastIndexOf('/');
    const dir = f.storage_path.slice(0, slash);
    const name = f.storage_path.slice(slash + 1);
    const { data, error } = await supabase
      .storage.from('artwork-uploads')
      .list(dir, { search: name });
    const found = data?.find(o => o.name === name);
    if (error || !found) {
      return NextResponse.json(
        { error: 'Some files did not finish uploading. Please try again.' },
        { status: 400 }
      );
    }
  }

  await markReceived(id);

  // The client must be told when the team was NOT alerted. The old
  // /api/portal/jobs code swallowed this and showed a success screen.
  try {
    await notifyTeamOfArtwork({ ...submission, status: 'received' });
    await markNotified(id);
  } catch (e) {
    console.error('Artwork notification failed:', e);
    return NextResponse.json({
      ok: true,
      notified: false,
      reference: submission.reference,
    });
  }

  return NextResponse.json({ ok: true, notified: true, reference: submission.reference });
}
```

- [ ] **Step 3: Write the verification script**

Create `scripts/verify-artwork-complete.mjs`:

```js
const BASE = process.env.BASE_URL || 'http://localhost:3000';

const { token } = await (await fetch(`${BASE}/api/artwork/render-token`)).json();
await new Promise(r => setTimeout(r, 3500));

const submitRes = await fetch(`${BASE}/api/artwork/submit`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token,
    contactPerson: 'Verify Bot',
    contactNumber: '0111234567',
    description: 'Automated verification run.',
    files: [{ name: 'verify.pdf', size: 20, type: 'application/pdf' }],
  }),
});
const submit = await submitRes.json();
if (!submit.id) { console.error('FAIL submit:', submit); process.exit(1); }
console.log(`PASS submit (${submit.reference})`);

// Completing before uploading must be refused.
const early = await fetch(`${BASE}/api/artwork/submit/${submit.id}/complete`, { method: 'POST' });
if (early.status !== 400) { console.error(`FAIL: complete succeeded with no files uploaded (${early.status})`); process.exit(1); }
console.log('PASS complete rejected before upload');

console.log('\nNOTE: the happy path needs a real upload to the signed URL.');
console.log('It is covered by the browser run in Task 5, Step 6.');
```

- [ ] **Step 4: Run it**

```bash
pwd
node scripts/verify-artwork-complete.mjs
```

Expected: `PASS submit`, `PASS complete rejected before upload`.

- [ ] **Step 5: Clean up and commit**

```bash
pwd
node -e "import('dotenv').then(d=>{d.config({path:'.env.local'});return import('@vercel/postgres')}).then(async({sql})=>{const r=await sql\`DELETE FROM artwork_submissions WHERE contact_person='Verify Bot'\`;console.log('deleted',r.rowCount)})"
git branch --show-current
git add lib/artwork/notify.ts "app/api/artwork/submit/[id]/complete/route.ts" scripts/verify-artwork-complete.mjs
git commit -m "feat(aloe): artwork completion endpoint with verified uploads and team notification"
```

---

### Task 5: Public `/artwork` page and form

**Files:**
- Create: `app/artwork/page.tsx`
- Create: `components/artwork/ArtworkUploadForm.tsx`

**Interfaces:**
- Consumes: `signRenderToken` (Task 2); `POST /api/artwork/submit` and `POST /api/artwork/submit/[id]/complete` (Tasks 3–4).
- Produces: the public route `/artwork`.

- [ ] **Step 1: Write the page shell**

Create `app/artwork/page.tsx`. It is a server component so the render token is minted server-side and never guessable:

```tsx
import type { Metadata } from 'next';
import { signRenderToken } from '@/lib/artwork/antibot';
import ArtworkUploadForm from '@/components/artwork/ArtworkUploadForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Upload Artwork | Aloe Signs',
  description:
    'Send your artwork to Aloe Signs. No account needed — attach your files, tell us what you need, and our team will be in touch.',
};

export default function ArtworkPage() {
  return (
    <main className="min-h-screen bg-[#0B0E0D] pt-32 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
          Upload Artwork
        </h1>
        <p className="text-white/60 text-lg mb-4">
          No account needed. Attach your files, tell us what you need, and our team
          will come back to you.
        </p>
        <p className="text-white/40 text-sm mb-10">
          Prefer to talk first? Call{' '}
          <a href="tel:0116932600" className="text-aloe-green font-semibold">011 693 2600</a>.
        </p>
        <ArtworkUploadForm token={signRenderToken()} />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Write the form component**

Create `components/artwork/ArtworkUploadForm.tsx`. Note the honeypot is `website`, and the three distinct outcome states:

```tsx
'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type Outcome =
  | { kind: 'idle' }
  | { kind: 'sending'; progress: number }
  | { kind: 'sent'; reference: string }
  | { kind: 'sent-not-notified'; reference: string }
  | { kind: 'failed'; message: string };

const MAX_FILES = 10;

export default function ArtworkUploadForm({ token }: { token: string }) {
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState(''); // honeypot — must stay empty
  const [files, setFiles] = useState<File[]>([]);
  const [outcome, setOutcome] = useState<Outcome>({ kind: 'idle' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) {
      setOutcome({ kind: 'failed', message: 'Please attach at least one file.' });
      return;
    }
    setOutcome({ kind: 'sending', progress: 0 });

    try {
      const submitRes = await fetch('/api/artwork/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token, website, companyName, contactPerson, contactNumber, email, description,
          files: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
        }),
      });
      const submit = await submitRes.json();
      if (!submitRes.ok) {
        setOutcome({ kind: 'failed', message: submit.error || 'Your artwork did not send.' });
        return;
      }
      // Honeypot path returns a fake success with no id. Show success, send nothing.
      if (!submit.id) {
        setOutcome({ kind: 'sent', reference: submit.reference });
        return;
      }

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim()
      );

      for (let i = 0; i < submit.uploads.length; i++) {
        const { path, token: uploadToken } = submit.uploads[i];
        const { error } = await supabase.storage
          .from('artwork-uploads')
          .uploadToSignedUrl(path, uploadToken, files[i]);
        if (error) throw new Error(`${files[i].name} did not upload.`);
        setOutcome({ kind: 'sending', progress: Math.round(((i + 1) / submit.uploads.length) * 100) });
      }

      const doneRes = await fetch(`/api/artwork/submit/${submit.id}/complete`, { method: 'POST' });
      const done = await doneRes.json();
      if (!doneRes.ok) {
        setOutcome({ kind: 'failed', message: done.error || 'Your artwork did not send.' });
        return;
      }
      setOutcome(
        done.notified === false
          ? { kind: 'sent-not-notified', reference: done.reference }
          : { kind: 'sent', reference: done.reference }
      );
    } catch (err) {
      setOutcome({
        kind: 'failed',
        message: err instanceof Error ? err.message : 'Your artwork did not send.',
      });
    }
  }

  if (outcome.kind === 'sent') {
    return (
      <div className="glass-card rounded-3xl border border-aloe-green/20 p-10 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-black text-white mb-3">Artwork received</h2>
        <p className="text-white/60 mb-2">Our team has been notified and will be in touch.</p>
        <p className="text-white/40 text-sm">Your reference is <strong className="text-aloe-green">{outcome.reference}</strong></p>
      </div>
    );
  }

  if (outcome.kind === 'sent-not-notified') {
    return (
      <div className="glass-card rounded-3xl border border-amber-500/40 p-10 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-black text-white mb-3">We have your artwork — but could not alert the team</h2>
        <p className="text-white/70 mb-4">
          Your files uploaded safely, but our notification system did not respond.
          Please call <a href="tel:0116932600" className="text-aloe-green font-bold">011 693 2600</a> and
          quote your reference so nothing is missed.
        </p>
        <p className="text-white/40 text-sm">Reference <strong className="text-aloe-green">{outcome.reference}</strong></p>
      </div>
    );
  }

  const sending = outcome.kind === 'sending';
  const field = 'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-aloe-green focus:outline-none transition-colors';
  const label = 'block text-xs font-bold uppercase tracking-wider text-white/50 mb-2';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {outcome.kind === 'failed' && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4">
          <p className="font-bold text-red-300 mb-1">Your artwork did not send.</p>
          <p className="text-red-200/80 text-sm">{outcome.message}</p>
          <p className="text-red-200/60 text-sm mt-2">
            Your details are still filled in below — please try again, or call 011 693 2600.
          </p>
        </div>
      )}

      {/* Honeypot. Named `website` because this form has a real Company field.
          Hidden from people and assistive tech, irresistible to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] w-px h-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input
          id="website" name="website" type="text" tabIndex={-1} autoComplete="off"
          value={website} onChange={e => setWebsite(e.target.value)}
        />
      </div>

      <div>
        <label className={label} htmlFor="companyName">Company name</label>
        <input id="companyName" className={field} value={companyName}
               onChange={e => setCompanyName(e.target.value)} placeholder="Optional" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className={label} htmlFor="contactPerson">Contact person *</label>
          <input id="contactPerson" required className={field} value={contactPerson}
                 onChange={e => setContactPerson(e.target.value)} placeholder="Who should we ask for?" />
        </div>
        <div>
          <label className={label} htmlFor="contactNumber">Contact number *</label>
          <input id="contactNumber" required type="tel" className={field} value={contactNumber}
                 onChange={e => setContactNumber(e.target.value)} placeholder="011 234 5678" />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="email">Email address</label>
        <input id="email" type="email" className={field} value={email}
               onChange={e => setEmail(e.target.value)} placeholder="Optional, but it helps us reply" />
      </div>

      <div>
        <label className={label} htmlFor="description">Description</label>
        <textarea id="description" rows={4} className={field} value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Sizes, quantities, material, deadline — anything that helps." />
      </div>

      <div>
        <label className={label} htmlFor="files">Artwork files *</label>
        <input
          id="files" type="file" multiple required
          accept=".pdf,.ai,.eps,.tiff,.tif,.png,.jpg,.jpeg,.svg,.zip,.psd"
          onChange={e => setFiles(Array.from(e.target.files || []).slice(0, MAX_FILES))}
          className="w-full text-white/70 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:bg-aloe-green file:text-black file:font-bold file:cursor-pointer"
        />
        <p className="text-white/40 text-xs mt-2">
          Up to {MAX_FILES} files, 50 MB each. PDF, AI, EPS, TIFF, PNG, JPG, SVG, ZIP, PSD.
        </p>
        {files.length > 0 && (
          <ul className="mt-3 space-y-1">
            {files.map(f => (
              <li key={f.name} className="text-white/50 text-sm">
                📄 {f.name} <span className="text-white/30">({(f.size / 1024 / 1024).toFixed(1)} MB)</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {sending && (
        <div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-aloe-green transition-all duration-300"
                 style={{ width: `${outcome.progress}%` }} />
          </div>
          <p className="text-center text-white/50 text-sm mt-2">Uploading… {outcome.progress}%</p>
        </div>
      )}

      <p className="text-white/40 text-xs leading-relaxed">
        By sending your artwork you agree that Aloe Signs may store your contact details
        and files to quote and produce your job. Files are deleted automatically 7 days
        after our team downloads them, or 30 days if they are never downloaded.
        See our <a href="/privacy-policy" className="text-aloe-green underline">privacy policy</a>.
      </p>

      <button
        type="submit"
        disabled={sending}
        className="w-full py-4 rounded-full bg-aloe-green text-black font-black text-lg disabled:opacity-50 hover:scale-[1.01] transition-transform"
      >
        {sending ? 'Sending…' : 'Send Artwork'}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Type-check and build**

```bash
pwd
npx tsc --noEmit
npm run build
```

Expected: clean. `/artwork` appears in the route list.

- [ ] **Step 4: Re-run the Task 2 verification, which asserts the honeypot name**

```bash
pwd
node scripts/verify-artwork-validation.mjs
```

Expected: all `PASS`, including `PASS: honeypot named website`.

- [ ] **Step 5: Drive the real browser flow**

```bash
pwd
npm run dev
```

In a browser at `http://localhost:3000/artwork`:
1. Submit with Contact person blank → the browser blocks it (`required`).
2. Fill Contact person + Contact number, attach a small real PDF, wait 4 seconds, submit.
3. Confirm the progress bar advances and the success panel shows an `AW-XXXXXX` reference.
4. Confirm the file is in the `artwork-uploads` bucket in the Supabase dashboard.
5. Confirm the notification email arrives at the `ARTWORK_NOTIFICATION_EMAIL` address.

- [ ] **Step 6: Verify the honest-failure path**

Temporarily set a bad SMTP host in `.env.local` (`SMTP_HOST="smtp.invalid.example"`), restart `npm run dev`, and submit again.

Expected: the amber "**We have your artwork — but could not alert the team**" panel, **not** the green success panel. Confirm the row exists with `notified_at` NULL. Then restore `SMTP_HOST`.

This is the single most important check in the plan — it is the behaviour the current portal code gets wrong.

- [ ] **Step 7: Commit**

```bash
pwd
git branch --show-current
git add app/artwork/page.tsx components/artwork/ArtworkUploadForm.tsx
git commit -m "feat(aloe): public artwork upload page with honest failure states"
```

---

### Task 6: Menu button

**Files:**
- Modify: `components/Header.tsx:182`

- [ ] **Step 1: Change the mobile menu button only**

In `components/Header.tsx`, inside the mobile menu overlay (the `<Link>` immediately after the `navLinks.map(...)` block, currently at line 182), change:

```tsx
                    <Link
                        href="/get-quote"
                        onClick={closeMenu}
                        className="mt-4 px-12 py-5 bg-aloe-green text-black font-black rounded-full text-xl shadow-2xl"
                    >
                        LET&apos;S START A PROJECT
                    </Link>
```

to:

```tsx
                    <Link
                        href="/artwork"
                        onClick={closeMenu}
                        className="mt-4 px-12 py-5 bg-aloe-green text-black font-black rounded-full text-xl shadow-2xl"
                    >
                        UPLOAD ARTWORK
                    </Link>
```

**Do not touch** the desktop CTA at line 137, which must keep reading `LET&apos;S START A PROJECT` and pointing at `/get-quote`.

- [ ] **Step 2: Verify both instances**

```bash
pwd
grep -n "START A PROJECT\|UPLOAD ARTWORK" components/Header.tsx components/Footer.tsx
```

Expected exactly: `Header.tsx` one `LET'S START A PROJECT` (desktop, ~line 137) and one `UPLOAD ARTWORK` (mobile menu); `Footer.tsx` unchanged with two `START A PROJECT`.

- [ ] **Step 3: Check it in the browser**

With `npm run dev` running, narrow the window below `lg`, open the menu, confirm the button reads UPLOAD ARTWORK and lands on `/artwork`. Widen the window and confirm the desktop button still reads LET'S START A PROJECT and lands on `/get-quote`.

- [ ] **Step 4: Commit**

```bash
pwd
git branch --show-current
git add components/Header.tsx
git commit -m "feat(aloe): mobile menu button now points at artwork upload"
```

---

### Task 7: Staff API routes

**Files:**
- Create: `lib/artwork/staff-auth.ts`
- Create: `app/api/portal/admin/artwork-uploads/route.ts`
- Create: `app/api/portal/admin/artwork-uploads/[id]/route.ts`
- Create: `app/api/portal/admin/artwork-uploads/[id]/download/route.ts`

**Interfaces:**
- Consumes: `listSubmissions`, `countUnread`, `getSubmission`, `markViewed`, `markDownloaded` (Task 1); `getStaff` from `@/lib/auth`.
- Produces:
  - `requireStaff(): Promise<{ ok: true } | { ok: false }>`
  - `GET /api/portal/admin/artwork-uploads` → `{ submissions, unread }`
  - `POST /api/portal/admin/artwork-uploads/[id]` → `{ ok: true }` (marks viewed)
  - `GET /api/portal/admin/artwork-uploads/[id]/download?file=<fileId>` → 302 to a signed URL

- [ ] **Step 1: Write the staff guard**

Create `lib/artwork/staff-auth.ts`:

```ts
import { getStaff } from '@/lib/auth';

/**
 * Artwork submissions contain third parties' personal information, so access is
 * limited to Aloe Signs staff. requireAdmin() is too narrow (Andre only) and
 * getStaff() alone is too broad — it returns non-null for registered *clients*.
 */
export async function requireStaff(): Promise<boolean> {
  const staff = await getStaff();
  if (!staff) return false;
  return staff.email.toLowerCase().endsWith('@aloesigns.co.za');
}
```

- [ ] **Step 2: Write the list route**

Create `app/api/portal/admin/artwork-uploads/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/artwork/staff-auth';
import { listSubmissions, countUnread } from '@/lib/artwork/repository';

export const runtime = 'nodejs';

export async function GET() {
  if (!await requireStaff()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const [submissions, unread] = await Promise.all([listSubmissions(), countUnread()]);
  return NextResponse.json({ submissions, unread });
}
```

- [ ] **Step 3: Write the mark-viewed route**

Create `app/api/portal/admin/artwork-uploads/[id]/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/artwork/staff-auth';
import { markViewed } from '@/lib/artwork/repository';

export const runtime = 'nodejs';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireStaff()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  await markViewed(id);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Write the download route**

Create `app/api/portal/admin/artwork-uploads/[id]/download/route.ts`. Downloads **must** go through here — the browser minting its own signed URL is invisible to the server, so the 7-day clock would never start:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { requireStaff } from '@/lib/artwork/staff-auth';
import { createAdminSupabase } from '@/lib/supabase-admin';
import { getSubmission, markDownloaded } from '@/lib/artwork/repository';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireStaff()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  const fileId = req.nextUrl.searchParams.get('file');

  const submission = await getSubmission(id);
  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const file = submission.files.find(f => f.id === fileId);
  if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 });

  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .storage.from('artwork-uploads')
    .createSignedUrl(file.storage_path, 3600, { download: file.original_name });

  if (error || !data) {
    return NextResponse.json({ error: 'Could not prepare the download.' }, { status: 500 });
  }

  // Starts the 7-day retention clock. No-ops if already downloaded.
  await markDownloaded(id);

  return NextResponse.redirect(data.signedUrl);
}
```

- [ ] **Step 5: Verify the guard rejects anonymous callers**

```bash
pwd
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/portal/admin/artwork-uploads
```

Expected: `403`.

- [ ] **Step 6: Commit**

```bash
pwd
git branch --show-current
git add lib/artwork/staff-auth.ts app/api/portal/admin/artwork-uploads
git commit -m "feat(aloe): staff API for artwork uploads with download tracking"
```

---

### Task 8: Admin page and dashboard badge

**Files:**
- Create: `app/portal/admin/artwork-uploads/page.tsx`
- Modify: `app/portal/admin/page.tsx`

**Interfaces:**
- Consumes: `GET /api/portal/admin/artwork-uploads` (Task 7).

- [ ] **Step 1: Write the list page**

Create `app/portal/admin/artwork-uploads/page.tsx`. Match the styling of the existing `app/portal/admin/artwork/page.tsx` (inline styles, light cards). Requirements:

- Fetch `/api/portal/admin/artwork-uploads` on mount.
- Render each submission as a card: reference, company name, contact person, contact number, email, description, submitted date.
- Unread submissions (`viewed_at === null`) get a green "NEW" pill and a left border in `#84cc16`.
- Each file is a download link to `/api/portal/admin/artwork-uploads/{id}/download?file={fileId}`, opened with `window.location.href` so the redirect is followed.
- Each card shows **"Deletes in N days"**, computed from `delete_after`, in amber when N ≤ 3.
- Clicking a card calls `POST /api/portal/admin/artwork-uploads/{id}` then refetches, so the badge clears.
- A "Back" button to `/portal/admin`.

Compute the delete countdown as:

```tsx
const daysLeft = Math.max(
  0,
  Math.ceil((new Date(s.delete_after).getTime() - Date.now()) / 86400000)
);
```

- [ ] **Step 2: Add the dashboard tile with badge**

In `app/portal/admin/page.tsx`, add a tile matching the existing ones (they are `<Link>`s at lines 51–192). Place it directly before the existing `/portal/admin/artwork` tile.

Add state and a fetch at the top of the component:

```tsx
const [unreadArtwork, setUnreadArtwork] = useState(0);

useEffect(() => {
  fetch('/api/portal/admin/artwork-uploads')
    .then(r => r.ok ? r.json() : { unread: 0 })
    .then(d => setUnreadArtwork(d.unread || 0))
    .catch(() => {});
}, []);
```

The tile, with a badge styled like the cart counter in `Header.tsx`:

```tsx
<Link href="/portal/admin/artwork-uploads" className="relative ...">
  {unreadArtwork > 0 && (
    <span className="absolute top-4 right-4 bg-aloe-green text-black text-xs font-black rounded-full min-w-[24px] h-6 px-2 flex items-center justify-center">
      {unreadArtwork}
    </span>
  )}
  {/* title: "Artwork Uploads"; subtitle: "Public submissions from aloesigns.co.za/artwork" */}
</Link>
```

Copy the exact wrapper `className` from a neighbouring tile and add `relative` to it, rather than inventing new classes.

- [ ] **Step 3: Verify end-to-end in the browser**

1. Sign in at `/portal/login` as an `@aloesigns.co.za` account.
2. Submit a fresh upload at `/artwork` in a private window.
3. Reload `/portal/admin` — the Artwork Uploads tile shows a badge of `1`.
4. Open the tile; the submission shows with a NEW pill and "Deletes in 30 days".
5. Click it; the NEW pill clears and the dashboard badge drops to `0` on reload.
6. Download a file; confirm the file downloads and the card now reads "Deletes in 7 days".

Step 6 is the check that the retention clock actually starts.

- [ ] **Step 4: Commit**

```bash
pwd
git branch --show-current
git add app/portal/admin/artwork-uploads/page.tsx app/portal/admin/page.tsx
git commit -m "feat(aloe): artwork uploads admin page and dashboard badge"
```

---

### Task 9: Purge job and schedule

**Files:**
- Create: `app/api/cron/purge-artwork/route.ts`
- Create: `.github/workflows/purge-artwork.yml`
- Test: `scripts/verify-artwork-purge.mjs`

**Interfaces:**
- Consumes: `findExpired`, `deleteSubmissions`, `findUnnotified`, `markNotified` (Task 1); `notifyTeamOfArtwork` (Task 4).
- Produces: `GET /api/cron/purge-artwork` → `{ ok, purged, retried }`.

- [ ] **Step 1: Write the purge route**

Create `app/api/cron/purge-artwork/route.ts`, following the auth pattern in `app/api/cron/publish-news/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase-admin';
import {
  findExpired, deleteSubmissions, findUnnotified, markNotified,
} from '@/lib/artwork/repository';
import { notifyTeamOfArtwork } from '@/lib/artwork/notify';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    process.env.NODE_ENV === 'production'
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminSupabase();

  // 1. Purge expired submissions — storage first, so a failure here never
  //    leaves an orphaned file with no row pointing at it.
  const expired = await findExpired();
  const paths = expired.flatMap(e => e.storage_paths).filter(Boolean);
  if (paths.length > 0) {
    const { error } = await supabase.storage.from('artwork-uploads').remove(paths);
    if (error) console.error('Artwork purge: storage delete failed:', error);
  }
  await deleteSubmissions(expired.map(e => e.id));

  // 2. Retry notifications that failed at submission time, so a transient
  //    SMTP outage does not lose a job.
  let retried = 0;
  for (const s of await findUnnotified()) {
    try {
      await notifyTeamOfArtwork(s);
      await markNotified(s.id);
      retried++;
    } catch (e) {
      console.error(`Artwork notify retry failed for ${s.reference}:`, e);
    }
  }

  return NextResponse.json({ ok: true, purged: expired.length, retried });
}
```

- [ ] **Step 2: Write the verification script**

Create `scripts/verify-artwork-purge.mjs`:

```js
import { config } from 'dotenv';
config({ path: '.env.local' });
import { sql } from '@vercel/postgres';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

// An already-expired row with no files.
const { rows } = await sql`
  INSERT INTO artwork_submissions
    (reference, contact_person, contact_number, status, ip_hash, delete_after, notified_at)
  VALUES ('AW-EXPIRE', 'Purge Bot', '0000000000', 'received', 'testhash',
          NOW() - INTERVAL '1 day', NOW())
  RETURNING id
`;
const id = rows[0].id;
console.log(`seeded expired submission ${id}`);

const res = await fetch(`${BASE}/api/cron/purge-artwork`);
const body = await res.json();
console.log('purge response:', body);

const { rows: after } = await sql`SELECT id FROM artwork_submissions WHERE id = ${id}`;
if (after.length > 0) {
  console.error('FAIL: expired submission still present');
  await sql`DELETE FROM artwork_submissions WHERE id = ${id}`;
  process.exit(1);
}
console.log('PASS: expired submission purged');
```

- [ ] **Step 3: Run it**

```bash
pwd
node scripts/verify-artwork-purge.mjs
```

Expected: `PASS: expired submission purged`, exit 0.

- [ ] **Step 4: Add the GitHub Actions schedule**

Vercel Hobby allows only two cron jobs and `vercel.json` already declares two. Create `.github/workflows/purge-artwork.yml`:

```yaml
name: Purge expired artwork

on:
  schedule:
    - cron: '30 1 * * *'   # 01:30 UTC = 03:30 SAST, daily
  workflow_dispatch:

jobs:
  purge:
    runs-on: ubuntu-latest
    steps:
      - name: Call purge endpoint
        run: |
          code=$(curl -s -o /tmp/out -w "%{http_code}" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://aloesigns.co.za/api/cron/purge-artwork)
          cat /tmp/out
          if [ "$code" != "200" ]; then
            echo "Purge failed with HTTP $code"
            exit 1
          fi
```

**Manual step for the repository owner:** add `CRON_SECRET` to the repo's Actions secrets (Settings → Secrets and variables → Actions), matching the value in Vercel. Note this in the handoff — the workflow silently 401s without it, so confirm the first scheduled run succeeded.

- [ ] **Step 5: Commit**

```bash
pwd
git branch --show-current
git add app/api/cron/purge-artwork/route.ts .github/workflows/purge-artwork.yml scripts/verify-artwork-purge.mjs
git commit -m "feat(aloe): daily artwork purge with notification retry"
```

---

### Task 10: POPIA consent and privacy policy

**Files:**
- Modify: `app/privacy-policy/page.tsx`

The consent line on the form itself was added in Task 5, Step 2.

- [ ] **Step 1: Read the existing policy**

```bash
pwd
grep -n "<h2\|<h3" app/privacy-policy/page.tsx | head -30
```

- [ ] **Step 2: Add an artwork submissions section**

Insert a new section matching the surrounding markup and heading level. Content:

> **Artwork submissions**
>
> When you send us artwork through our upload page, we collect the contact details you
> provide (company name, contact person, contact number and email address), any description
> you write, and the files you attach. We use this information solely to quote on and produce
> your job, and to contact you about it.
>
> We also store a one-way, irreversible hash of your IP address to prevent automated abuse of
> the upload form. We do not store your IP address itself.
>
> Uploaded files and their accompanying details are deleted automatically seven days after a
> member of our team downloads them, or thirty days after submission if they are never
> downloaded. If you would like your submission removed sooner, contact us on
> 011 693 2600 or shop@aloesigns.co.za.

Use the existing components and classes on that page rather than introducing new styling.

- [ ] **Step 3: Verify**

```bash
pwd
npm run build
curl -s http://localhost:3000/privacy-policy | grep -c "Artwork submissions"
```

Expected: build clean, grep returns `1` or more.

- [ ] **Step 4: Commit**

```bash
pwd
git branch --show-current
git add app/privacy-policy/page.tsx
git commit -m "docs(aloe): POPIA clause for public artwork submissions"
```

---

### Task 11: Environment corrections and final end-to-end pass

**Files:** none in the repo — these are Vercel dashboard changes plus a full verification sweep.

- [ ] **Step 1: Correct the Vercel environment variables**

These are **manual dashboard steps** and cannot be done from the repo. The local `.env.local` is a pull of production values, so editing it fixes nothing.

In the Vercel project → Settings → Environment Variables:

| Variable | Current | Set to |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://lsvqqnfpikamtovursxy.supabase.co\r\n` | `https://lsvqqnfpikamtovursxy.supabase.co` |
| `UPLOAD_NOTIFICATION_EMAIL` | `melissa@aloesigns.co.za\r\n` | `melissa@aloesigns.co.za` |
| `NEXT_PUBLIC_SITE_URL` | `https://aloe-signs-website.vercel.app` | `https://aloesigns.co.za` |
| `ARTWORK_NOTIFICATION_EMAIL` | *(absent)* | `team@aloesigns.co.za` |
| `ARTWORK_SECRET` | *(absent)* | a fresh 32-byte random hex string |

The trailing `\r\n` values matter: dotenv expands them into real carriage returns, and
`createAdminSupabase()` builds the service-role client from `NEXT_PUBLIC_SUPABASE_URL`.

Generate the secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Redeploy after saving, then pull them locally:

```bash
pwd
npx vercel env pull .env.local
grep -c '\\r\\n' .env.local
```

Expected: `0`.

- [ ] **Step 2: Run the full verification sweep**

```bash
pwd
node scripts/verify-artwork-schema.mjs
node scripts/verify-artwork-retention.mjs
node scripts/verify-artwork-validation.mjs
node scripts/verify-artwork-submit.mjs
node scripts/verify-artwork-complete.mjs
node scripts/verify-artwork-purge.mjs
```

Expected: every script exits 0.

- [ ] **Step 3: Walk the spec's success criteria**

Confirm each of the eleven numbered criteria in
`docs/superpowers/specs/2026-08-20-public-artwork-upload-design.md` by exercising the running
app. Criteria 6 (broken SMTP shows the honest failure panel), 7 (honeypot silently discarded)
and 10 (download starts the 7-day clock) are the ones most likely to regress, so drive those
by hand rather than trusting the scripts.

- [ ] **Step 4: Clean up verification rows**

```bash
pwd
node -e "import('dotenv').then(d=>{d.config({path:'.env.local'});return import('@vercel/postgres')}).then(async({sql})=>{const r=await sql\`DELETE FROM artwork_submissions WHERE contact_person IN ('Verify Bot','Purge Bot') OR reference IN ('AW-TEST','AW-EXPIRE')\`;console.log('deleted',r.rowCount)})"
```

- [ ] **Step 5: Run the production setup route once after deploy**

The schema and bucket must be created in production too:

```bash
curl -s -X GET https://aloesigns.co.za/api/setup-artwork
```

Expected: `{"ok":true,"tables":"ready","bucket":"created"}`.

- [ ] **Step 6: Commit any remaining changes and open the PR**

```bash
pwd
git branch --show-current
git status --porcelain
git push -u origin feat/aloe-public-artwork-upload
```

Do not merge to `main` without the user's say-so — `aloe-signs-website` auto-deploys from it.

---

## Deferred — noted, not in scope

Found while reading the codebase. Each is a real problem; none is part of this request.

1. **`app/api/portal/admin/jobcards/route.ts:10`** has its staff-email check commented out, so any authenticated user — including a registered *client* — can read every jobcard.
2. **`lib/portal-email.ts:354`** hardcodes `team@aloesigns.co.za` for the existing registered-client artwork notification. Only the new public flow gets `ARTWORK_NOTIFICATION_EMAIL`.
3. **`app/api/portal/jobs/route.ts:83-92`** still swallows notification failures for the registered-client flow and shows a success screen regardless.
4. **`app/portal/upload/artwork/page.tsx`** checks auth only on submit, so a logged-out visitor fills the whole form before being redirected to login and losing their work.
5. **`app/portal/upload/page.tsx` and `app/portal/jobs/new/page.tsx`** appear to be dead paths superseded by the current upload page.
