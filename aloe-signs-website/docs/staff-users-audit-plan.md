# Staff Users, Roles, Audit Logs & Dept Completion — Implementation Spec

**Author:** Claude (architect). **Implementer:** DeepSeek v4 (via ds-agent).
**Date:** 2026-07-07

This spec is the single source of truth for five changes to `aloe-signs-website`:

1. Department **Completed** control moved inline with the department, stamped with the short code of the user who ticked it.
2. An **audit log** ("who / what / when") viewer for jobcard activity, site/config changes, and sales.
3. Five **staff users** provisioned, forced to change password on first login.
4. **Roles**: Andre = admin (prices, create users, view logs); everyone else = user.
5. **Profile** page (edit details + change password). Users can add shop products (already allowed).

---

## 0. Identity & role model (no new profiles table)

Store everything auth-relevant in Supabase Auth metadata — avoids an extra table and lets middleware gate on the Edge without a DB call.

- **`app_metadata`** (admin-controlled, set via service-role admin API): `role` (`"admin"|"user"`), `short_code` (`"ADB"|"MDB"|"CK"|"CMW"|"AB"`), `must_change_password` (bool).
- **`user_metadata`** (user-editable via `supabase.auth.updateUser`): `full_name`, `phone`.

`supabase.auth.getUser()` (used in middleware + routes) hits the auth server and returns fresh `app_metadata`, so role changes take effect immediately.

### The 5 staff accounts

| short | full name | email | role |
|-------|-----------|-------|------|
| ADB | Andre De Bod | andre@aloesigns.co.za | **admin** |
| MDB | Melissa De Bod | melissa@aloesigns.co.za | user |
| CK | Chanelle Kotze | artwork@aloesigns.co.za | user |
| CMW | Marina De Bod | marina@aloesigns.co.za | user |
| AB | Anushka Bezuidenhout | admin@aloesigns.co.za | user |

> ⚠️ `admin@aloesigns.co.za` is **AB (a normal user)**, not the admin. Never infer admin from the email prefix.

### `lib/auth.ts` (new, server-only)

```ts
import { createServerSupabase } from '@/lib/supabase-server';

const ADMIN_EMAILS = ['andre@aloesigns.co.za']; // owner emails may be added here

export async function getStaff() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const email = user.email ?? '';
  const role = user.app_metadata?.role === 'admin' || ADMIN_EMAILS.includes(email) ? 'admin' : 'user';
  const code = user.app_metadata?.short_code ?? null;
  return { user, email, role, code, mustChange: !!user.app_metadata?.must_change_password };
}

export async function requireAdmin() {
  const staff = await getStaff();
  if (!staff) return { ok: false as const, status: 403 };
  if (staff.role !== 'admin') return { ok: false as const, status: 403 };
  return { ok: true as const, staff };
}
```

---

## 1. Audit log

### 1a. Table — new route `app/api/setup-audit/route.ts` (idempotent GET, same pattern as setup-jobcards)

```sql
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  actor_email TEXT,
  actor_code  TEXT,
  action      TEXT NOT NULL,       -- e.g. jobcard.update, jobcard.department_completed, settings.update, product.create, sale.order
  entity_type TEXT,                -- jobcard | product | settings | order | user
  entity_id   TEXT,
  summary     TEXT,                -- human readable
  meta        JSONB DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS audit_log_created_idx ON audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_entity_idx  ON audit_log (entity_type);
```

### 1b. Helper — `lib/audit.ts` (new)

```ts
import { sql } from '@vercel/postgres';
export async function logAudit(e: {
  actorEmail?: string|null; actorCode?: string|null; action: string;
  entityType?: string; entityId?: string; summary?: string; meta?: any;
}) {
  try {
    await sql`INSERT INTO audit_log (actor_email, actor_code, action, entity_type, entity_id, summary, meta)
      VALUES (${e.actorEmail??null}, ${e.actorCode??null}, ${e.action}, ${e.entityType??null},
              ${e.entityId??null}, ${e.summary??null}, ${JSON.stringify(e.meta??{})}::jsonb)`;
  } catch (err) { console.error('audit log failed', err); } // never break the request
}
```

### 1c. Where to log (add calls in existing routes)

- **`api/portal/admin/jobcards/[id]` PUT** — before UPDATE, `SELECT` the current row; diff against body. Log `jobcard.update` with `summary` = changed field names. Compare `department_completion_json`: for each dept newly flipped to `completed`, also log `jobcard.department_completed` (summary `"Artwork completed by ADB"`, meta `{dept, code}`). If `status` changed, include in summary.
- **`api/portal/admin/jobcards` POST (create)** — `jobcard.create`.
- **`api/portal/admin/jobcards/[id]` DELETE** — `jobcard.delete`.
- **`api/settings` PUT** — `settings.update`, summary = which pricing keys changed (artwork rate / HP Latex / Vinyl).
- **`api/products` POST** — `product.create`; **`api/products/[id]`** PUT/PATCH → `product.update`, DELETE → `product.delete`.
- **`api/orders/create` POST** — `sale.order` (actor = customer email, code null), meta `{orderNumber, total, items}`.

Actor for staff routes = `getStaff()` → `{email, code}`.

### 1d. Viewer — `app/portal/admin/logs/page.tsx` (admin-only) + `app/api/portal/admin/logs/route.ts`

- API `GET /api/portal/admin/logs?tab=all|jobcards|site|sales&limit=&before=`:
  - `requireAdmin()`; 403 otherwise.
  - `all` → recent `audit_log` rows.
  - `jobcards` → `entity_type='jobcard'`.
  - `site` → `entity_type IN ('settings','product','user')`.
  - `sales` → **union** of: `audit_log` rows with `action='sale.order'` **and** invoiced jobcards
    (`SELECT ... FROM jobcards WHERE final_invoice IS NOT NULL OR (total IS NOT NULL AND status IN ('Completed'))`),
    each normalised to `{when, who, ref, amount, source: 'shop'|'jobcard'}`.
- Page: dark portal styling (match existing admin pages). Tab bar (All / Jobcards / Site changes / Sales). Table: **When · Who (code) · Action · Entity · Summary**. Sales tab shows **When · Who · Ref · Amount · Source**. Simple "load more" by `before` cursor.

---

## 2. Provisioning + roles + first-login

### 2a. Provisioning route — `app/api/setup-staff-users/route.ts` (GET, idempotent, service-role)

- Uses `createAdminSupabase()`.
- For each of the 5 staff: `admin.createUser({ email, password: <random 12-char>, email_confirm: true, app_metadata: {role, short_code, must_change_password: true}, user_metadata: {full_name} })`.
- If the user already exists (`listUsers` scan by email), **skip creation** but ensure `app_metadata` role/short_code are set (update), and report `status: "exists"`.
- Returns JSON `{ created: [{email, tempPassword}], existing: [email] }`. (Claude runs this once, captures temp passwords, deletes nothing.)
- Guard: only runnable by an admin session **or** when no staff exist yet (bootstrap). Keep it simple: require `requireAdmin()` OR a one-time `?token=` matching an env secret. For this session Claude will hit it with an admin session; simplest is to allow it if `requireAdmin()` passes — but that's circular before Andre exists. **Resolution:** allow the route if there are currently **zero** users carrying `app_metadata.role` (bootstrap), else require admin.

### 2b. Admin "Users" management — `app/portal/admin/users/page.tsx` + `app/api/portal/admin/users/route.ts` (+ `[id]`)

- All routes `requireAdmin()`.
- `GET` → `admin.listUsers()`, filter to staff (has `app_metadata.short_code` or `@aloesigns.co.za`), return `{id, email, full_name, short_code, role}`.
- `POST` → create a new user (Andre creating new staff): body `{email, full_name, short_code, role}`, random temp password, `must_change_password:true`; returns temp password. Log `user.create`.
- `PATCH /[id]` → update `role`/`short_code`/`full_name`, or `action:"reset_password"` (new temp + `must_change_password:true`). Log `user.update`.
- Page: admin-only table of staff with role dropdown, "Add user" form, "Reset password" button (shows the new temp once).

### 2c. Role gating — `middleware.ts`

Extend the existing matcher logic:
- Keep `view@aloesigns.co.za` redirect.
- Read `user.app_metadata`. Compute `isAdmin = role==='admin' || email==='andre@aloesigns.co.za'`.
- If `app_metadata.must_change_password` is true and path starts with `/portal/admin` → redirect to `/portal/change-password`.
- If path starts with `/portal/admin/settings`, `/portal/admin/users`, or `/portal/admin/logs` and **not** admin → redirect to `/portal/admin`.
- Also enforce admin in each of those API routes (defense in depth) via `requireAdmin()`.

### 2d. First-login change password — `app/portal/change-password/page.tsx` + `app/api/portal/profile/complete-first-login/route.ts`

- Page (client): "Set a new password" → `supabase.auth.updateUser({ password })` → then `POST /api/portal/profile/complete-first-login` → redirect to `/portal/admin`.
- Route: authenticated; uses `createAdminSupabase().auth.admin.updateUserById(user.id, { app_metadata: { ...existing, must_change_password: false } })`. (Client can't edit `app_metadata`; must be server/service-role.)

### 2e. Profile — `app/portal/profile/page.tsx`

- Shows email (read-only), `full_name`, `phone` (editable → `updateUser({ data: {...} })`), and a "Change password" section (`updateUser({ password })`).
- Link to profile from the admin dashboard header. Admin also sees "Users" and "Logs" tiles (only when `role==='admin'`).

---

## 3. Department "Completed" inline + who (jobcard page)

File: `app/portal/admin/jobcards/[id]/page.tsx`.

- On mount, read current user's short code once:
  `const [me, setMe] = useState<string|null>(null)` → `createClientSupabase().auth.getUser()` → `setMe(user?.app_metadata?.short_code ?? null)`.
- Replace the per-department pair `<Toggle .../> <DeptCompleted .../>` with a single **`DeptRow`** that puts the dept on/off toggle **and** the Completed control on one line:

```
[✓ dept toggle]  Artwork            Completed [✓]  ✓ ADB · 2026-07-07  [date]
```

- `department_completion_json[deptKey]` gains `completed_by`. When the Completed box is ticked, set
  `{ completed: true, completed_at: now, completed_by: me }`. When already completed, render `✓ {completed_by} · {date}` inline (keep the small editable date input).
- Keep the eight departments and their existing conditional detail panels (`{jobcard.prod_artwork && (…)}`) unchanged — only the header row layout changes. Delete the old standalone `DeptCompleted` usages (replaced by `DeptRow`).
- No schema change (column is already `department_completion_json JSONB`).
- Server PUT already persists the JSON; add the audit diff described in 1c.

---

## 4. Dashboard nav

`app/portal/admin/page.tsx`: add tiles **Profile** (all), **Users** and **Logs** (render only when the signed-in user is admin — fetch role client-side via `getUser().app_metadata.role`, or gate the links). Keep existing tiles.

---

## Build / run order (Claude executes after DeepSeek codes)

1. `GET /api/setup-audit` (create audit_log).
2. `GET /api/setup-staff-users` (create the 5 accounts) → capture temp passwords.
3. `npm run build` / dev smoke: login as Andre → forced change password → Settings/Users/Logs visible; login as a user → those hidden/blocked; tick a dept Completed → shows code; make a shop order + edit a jobcard → appears in Logs.

## Open items for the user
- Should any owner/dev email besides `andre@` keep admin? (add to `ADMIN_EMAILS`).
- Profile edits: email is **read-only** (changing a Supabase auth email needs re-confirmation) — confirm that's fine.
