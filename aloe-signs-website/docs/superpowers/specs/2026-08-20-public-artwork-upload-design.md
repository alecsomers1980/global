# Public Artwork Upload — Design

**Date:** 2026-08-20
**Status:** Approved (brainstorming complete, awaiting implementation plan)

## Problem

Clients must register a portal account before they can send Aloe Signs their artwork.
That is friction on the single most common thing a client wants to do. The request is a
public, no-login upload page at `/artwork`, with the team reliably notified, visible
failure states, automatic cleanup to control storage cost, and spam resistance.

## Goals

1. Rename the menu button "LET'S START A PROJECT" to "UPLOAD ARTWORK", pointing at `/artwork`.
2. A public `/artwork` page needing no account: Company Name, Contact person (required),
   Contact number (required), Email, Description, multiple file uploads.
3. Notify `team@aloesigns.co.za` by email, **and** surface an unread badge in the portal
   admin dashboard.
4. Show the client an explicit failure message when a submission does not go through.
5. The upload form lives at `/artwork`.
6. Artwork is deleted 7 days after staff download it (30 days if never downloaded).
7. The endpoint must resist bot spam.

## Non-goals

- Retiring the existing registered-client portal. It stays, unchanged, including
  `/portal/upload/artwork` and the proof approve / request-edit loop.
- Merging public submissions into the existing `/portal/admin/artwork` page.
- Replacing the desktop header CTA (confirmed: it stays as-is).
- CAPTCHA or any third-party bot-protection service.

## Success criteria

Each of these is checkable against the running app, not by inspection.

1. `GET /artwork` returns 200 when logged out.
2. Submitting with contact person + contact number + at least one file succeeds; omitting
   either required field is rejected both client-side and server-side.
3. Files land in the `artwork-uploads` bucket; a matching row appears in `artwork_submissions`.
4. `team@aloesigns.co.za` receives a branded email within a minute.
5. `/portal/admin` shows a badge with the count of unopened submissions; opening one clears it.
6. With SMTP deliberately broken, the client sees "we could not notify the team", **not** a
   success screen, and the submission is still saved.
7. A submission with the honeypot field filled is silently discarded — no row, no email.
8. A submission posted under 3 seconds after page load is rejected.
9. An 11th file, a `.exe`, or an oversized file is rejected server-side (not only in the browser).
10. Marking a submission downloaded sets `delete_after` to 7 days out; running the purge
    endpoint removes expired rows **and** their storage objects.
11. The desktop header CTA still reads "LET'S START A PROJECT" and still points at `/get-quote`.

## Architecture

### Storage split

This project has **two databases**, and the split is deliberate here:

- **Neon** (via `@vercel/postgres`) — news, jobcards, products, settings, audit log.
  Schema is created by idempotent `/api/setup-*` routes.
- **Supabase** — auth, the `client-uploads` storage bucket, and `print_jobs` /
  `print_job_files` / `proofs` / `profiles`. These tables have no migration files; they were
  created by hand in the dashboard.

**Decision: metadata in Neon, files in Supabase Storage.**

Metadata goes to Neon because the `/api/setup-*` route pattern lets the schema be created and
evolved programmatically. There is no Supabase Postgres connection string in the environment,
so a Supabase table would require manual SQL-editor steps on every change.

Files go to a **new private Supabase Storage bucket `artwork-uploads`**, separate from
`client-uploads`, so the purge job structurally cannot delete registered-client artwork.

### Upload flow

A plain form POST does not work. Vercel caps serverless request bodies at **4.5 MB** and
artwork PDFs and `.ai` files routinely exceed that. Letting the browser write directly to
Supabase Storage would require a public insert policy on the bucket, letting anyone on the
internet fill it. Both are rejected.

The flow is **validate first, then issue one-time signed upload URLs**:

1. `POST /api/artwork/submit` — browser sends form fields plus a file manifest
   (names, sizes, MIME types). No file bytes. The route runs every validation and anti-bot
   check, inserts the submission as `pending_upload`, and returns short-lived signed upload
   URLs from `createSignedUploadUrl`.
2. Browser uploads each file directly to Supabase Storage, tracking per-file progress.
   No size ceiling, and the bucket stays private.
3. `POST /api/artwork/submit/[id]/complete` — the route **verifies each object actually
   exists at its declared size**, flips status to `received`, and sends the notification.

Step 3's verification is what stops a bot creating thousands of empty submission rows: a row
that never completes stays `pending_upload` and is swept by the purge job.

## Data model (Neon)

Created by an idempotent `/api/setup-artwork` route, following the `/api/setup-news` pattern.

**`artwork_submissions`**

| column | type | notes |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `reference` | TEXT | short human reference shown to the client |
| `company_name` | TEXT | optional |
| `contact_person` | TEXT NOT NULL | required |
| `contact_number` | TEXT NOT NULL | required |
| `email` | TEXT | optional; format-validated if present |
| `description` | TEXT | optional |
| `status` | TEXT | `pending_upload` → `received` |
| `ip_hash` | TEXT | salted SHA-256, for rate limiting (not the raw IP) |
| `created_at` | TIMESTAMPTZ | default now |
| `viewed_at` | TIMESTAMPTZ | NULL = unread, drives the dashboard badge |
| `downloaded_at` | TIMESTAMPTZ | first staff download; starts the 7-day clock |
| `delete_after` | TIMESTAMPTZ | created + 30 days, rewritten to downloaded + 7 days |
| `notified_at` | TIMESTAMPTZ | NULL after a failed send; drives the retry |

**`artwork_submission_files`**

| column | type | notes |
|---|---|---|
| `id` | UUID PK | |
| `submission_id` | UUID FK | cascade delete |
| `storage_path` | TEXT | path within `artwork-uploads` |
| `original_name` | TEXT | |
| `size_bytes` | BIGINT | declared, then verified against storage |
| `mime_type` | TEXT | |

## The form

Fields, in order: Company Name · **Contact person** (required) · **Contact number**
(required) · Email · Description · multi-file picker with per-file progress.

**Known tradeoff:** email is optional per the requirement, so a submission with a mistyped
phone number is unreachable. Email format is validated when present, but the field stays
optional as specified.

## Error states

Three distinct outcomes. A false success is never shown.

| Condition | What the client sees |
|---|---|
| Upload failed | "Your artwork did not send." Retry button; file list preserved so nothing is retyped. |
| Uploaded, notification failed | "We have your artwork, but couldn't alert the team — please call 011 693 2600." Submission is saved with `notified_at` NULL. |
| Success | Confirmation with the reference number. |

The middle case is the hole in the current code: `app/api/portal/jobs/route.ts` wraps
`notifyAdminArtworkUpload` in a try/catch that only logs, so a dead SMTP server shows the
client a success screen and tells nobody. Here, the daily job retries any submission with
`notified_at` NULL.

## Admin portal

- New **Artwork Uploads** tile on `/portal/admin`, with an unread-count badge styled like the
  existing cart counter. Unread means `viewed_at IS NULL`.
- New page `/portal/admin/artwork-uploads` listing submissions with contact details,
  description, files, age, and **"deletes in N days"**.
- Kept separate from `/portal/admin/artwork` because the models genuinely differ: no user
  account, no proof loop, and these auto-delete while registered-client jobs do not.
- Recipient moves to a new `ARTWORK_NOTIFICATION_EMAIL` env var defaulting to
  `team@aloesigns.co.za`, replacing the address currently hardcoded at
  `lib/portal-email.ts:354`, so it can change without a deploy.

## Retention

- On insert: `delete_after = created_at + 30 days`.
- On first staff download: `downloaded_at = now()`, `delete_after = now() + 7 days`.
- Daily purge deletes expired storage objects, then their rows, plus any `pending_upload`
  row older than 24 hours.

**Downloads must be tracked server-side.** The existing admin page mints Supabase signed URLs
straight from the browser, which the server cannot observe. Public submissions therefore
download via `/api/portal/admin/artwork-uploads/[id]/download`, which records the download
and then redirects to a signed URL. Without this the 7-day clock never starts.

**Scheduling: a GitHub Actions workflow**, not a Vercel cron. Vercel Hobby allows two cron
jobs and `vercel.json` already defines two (`generate-news`, `publish-news`). A scheduled
workflow calling the endpoint with `CRON_SECRET` avoids the limit at no cost, and matches the
Supabase keep-alive pattern already used across these projects.

Deletion is irreversible, so the delete date appears both in the admin list and in the
notification email.

## Anti-spam

No CAPTCHA and no third-party service, per project standard.

1. **Honeypot** — a hidden field that bots fill. Tripping it returns a normal-looking success
   so the bot gets no signal, but nothing is written and nothing is sent.
   **The honeypot must not be named `company`.** The lublaw implementation uses that name, but
   this form has a real Company Name field; reusing it would silently discard every genuine
   submission. Use `website`.
2. **Timing** — the render timestamp is HMAC-signed by the server so it cannot be forged.
   Reject if submitted under 3 seconds, or over 2 hours, after render.
3. **Rate limit** — per salted IP hash, capped per hour, counted against `artwork_submissions`.
4. **Extension and MIME allowlist** — `.pdf .ai .eps .tiff .tif .png .jpg .jpeg .svg .zip .psd`.
   Executables and scripts rejected.
5. **Size caps** — per file and per submission.
6. **File count cap** — 10 per submission.
7. **One-time, short-lived upload URLs** — cannot be replayed to dump files.
8. **Existence verification at completion** — blocks mass empty-row creation.
9. **Private bucket, service-role key only; deny-all on the table.** The anon key never gets
   storage write access.

If real spam gets through, Cloudflare Turnstile drops in without redesign.

## Navigation changes

- **Change:** `components/Header.tsx:182` — the mobile menu button becomes "UPLOAD ARTWORK"
  pointing at `/artwork`.
- **Unchanged:** `components/Header.tsx:137` — the desktop header CTA stays
  "LET'S START A PROJECT" → `/get-quote`.
- **Unchanged pending confirmation:** `components/Footer.tsx:87` (Quick Links) and
  `components/Footer.tsx:100` ("Ready to grow?" card) still say "START A PROJECT" and point at
  `/get-quote`. Open question below.

## Environment fixes

Bundled because they actively break behaviour in this feature's blast radius:

- `NEXT_PUBLIC_SUPABASE_URL` and `UPLOAD_NOTIFICATION_EMAIL` both contain a literal `\r\n`
  inside the quoted value, which dotenv expands into a real CRLF.
- `NEXT_PUBLIC_SITE_URL` is `https://aloe-signs-website.vercel.app`, so "View in Admin Portal"
  buttons in notification emails link to the vercel.app domain instead of `aloesigns.co.za`.

These are Vercel environment variables. They must be corrected in the Vercel dashboard;
the local `.env.local` is a pull of them and cannot be the fix.

## POPIA

The form collects personal information (name, phone, email) from the public, so it needs:

- A consent line on the form stating what is collected, why, and the retention period.
- A matching clause in the privacy policy covering artwork submissions and the 7/30-day
  deletion schedule.

The salted IP hash rather than a raw IP is deliberate data minimisation.

## Risks

- **Irreversible deletion.** If staff download artwork and then need it again on day 8, it is
  gone. Mitigated by showing the delete date prominently, not by keeping a backup.
- **Signed upload URL expiry.** A very large file over a slow link could outlive the URL.
  Expiry needs to be generous enough to cover realistic South African upload speeds.
- **Unverified assumption:** the Vercel plan is assumed to be Hobby (2-cron limit). If the
  account is on Pro, a third Vercel cron would also work, but the GitHub Actions approach is
  fine either way.

## Open question

Should the two footer instances of "START A PROJECT" also become "UPLOAD ARTWORK"?
Default if unanswered: leave both pointing at `/get-quote`.
