Output ONLY file blocks in EXACTLY this format (no prose, no outer fences):

===FILE: <project-relative-path>===
<full file contents>
===END===

Project: Next.js 14 App Router + TypeScript. Build staff magic-link auth primitives — STATELESS, using Node's built-in `crypto` (no new dependencies, no database). Env vars available: AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AUTH_SECRET, RESEND_API_KEY (optional), EMAIL_FROM, APP_BASE_URL. Types: StaffSession { id: string; name: string; role: "Admin" | "Box Office" | string } from "@/lib/types".

Build these files:

===FILE: lib/auth-tokens.ts===
Stateless signed tokens using `import crypto from "node:crypto"` and process.env.AUTH_SECRET. Implement a generic HMAC-signed token:
- `signToken(payload: object, ttlSeconds: number): string` → builds `{ ...payload, exp: Date.now() + ttlSeconds*1000 }`, base64url-encodes the JSON, computes HMAC-SHA256 over it with AUTH_SECRET, returns `${payloadB64}.${sigB64url}`.
- `verifyToken<T = any>(token: string): T | null` → split on ".", recompute HMAC, compare with `crypto.timingSafeEqual`, parse payload, return null if signature invalid or `exp` in the past; otherwise return the payload (typed).
- Convenience wrappers:
  - `createMagicToken(email: string): string` → signToken({ email }, 900) (15 min).
  - `readMagicToken(token: string): { email: string } | null` → verifyToken then return {email} or null.
  - `createSessionToken(s: StaffSession): string` → signToken({ id:s.id, name:s.name, role:s.role }, 60*60*12) (12h).
  - `readSessionToken(token: string): StaffSession | null`.
Throw a clear error at module load if AUTH_SECRET is missing. Use URL-safe base64 (replace +/ with -_ and strip =).
===END===

lib/users.ts — look up staff in the Airtable Users table (self-contained fetch; read AIRTABLE_API_KEY + AIRTABLE_BASE_ID; encode the table-name path segment because table names may contain spaces). Users table fields: primary "Name", "Email", "Role" (single select: Admin, Box Office, PR & Media, Sponsorships, Operations), "Active" (checkbox).
- `getUserByEmail(email: string): Promise<StaffSession | null>` → GET `Users?filterByFormula=` encodeURIComponent(`AND(LOWER({Email})='${email.toLowerCase().replace(/'/g,"\\'")}',{Active}=1)`); if a record matches, return { id: record.id, name: fields["Name"] || email, role: fields["Role"] || "" }; else null. Throw on non-ok HTTP with the body text.

lib/email.ts — minimal mailer, no SDK.
- `sendMail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<void>`.
- If process.env.RESEND_API_KEY is set: POST to https://api.resend.com/emails with Authorization: Bearer ${RESEND_API_KEY}, JSON { from: process.env.EMAIL_FROM || "Maynardville <noreply@maynardville.co.za>", to, subject, html }; throw on non-ok.
- Otherwise (dev/no key): console.log a clearly-formatted block showing to/subject and the full html (so magic-link URLs are visible in server logs). Never throw in the dev path.
Add a comment that this same helper will send the workflow notification emails later.

===FILE: .env.example===
Reproduce all of these keys with empty values and a short comment each, noting all live in Maynardville-owned accounts:
AIRTABLE_API_KEY= (PAT with data.records:read/write + schema.bases:read/write)
AIRTABLE_BASE_ID=
CURRENT_SEASON=2026
AUTH_SECRET= (long random string; signs magic-link + session tokens)
RESEND_API_KEY= (optional; if blank, magic-link emails are logged to the server console in dev)
EMAIL_FROM=Maynardville <noreply@maynardville.co.za>
QUICKET_API_KEY=
QUICKET_USER_TOKEN=
APP_BASE_URL=http://localhost:3000
===END===

Output each file as its own ===FILE:===/===END=== block, relative paths. No commentary.
