# Woodpecker Guesthouse

Next.js + Supabase rebuild of woodpeckersguesthouse.co.za. See
`docs/superpowers/specs/2026-08-13-woodpecker-guesthouse-design.md` (repo root) for the full design spec.

## Local development

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in Supabase/Resend/WhatsApp values.
3. Run the schema: paste `supabase/migrations/0001_init.sql` then `0002_admin_auth.sql` into the Supabase SQL editor, in that order.
4. Seed sample content: `node scripts/seed.mjs` (requires `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` set).
5. `npm run dev`

## Admin panel

`/admin` — staff sign-in (Supabase Auth), rooms CRUD, gallery manager (multi-upload with auto-optimize).

- **First admin account:** create the user via the Supabase dashboard (Authentication → Users → Invite), then run
  `update public.profiles set role = 'admin' where email = '...';` in the SQL editor. Every other invited account
  defaults to `role = 'staff'`, which is enough to sign in and edit content.
- **Optional 2FA:** staff can enable TOTP at `/admin/security`. Not required unless you want to make it mandatory later.
- **Public pages use ISR** (`revalidate = 60`) — admin edits appear on the live site within about a minute, no
  redeploy required.

## Deploy

Vercel, git-push auto-deploy on `main`. **Root Directory must be set to `woodpecker-guesthouse`** in the Vercel
project settings (this lives in a monorepo). Set the same env vars from `.env.example` in the Vercel dashboard.

After first deploy: add `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` as **GitHub Actions repo secrets** (different
from the Vercel env vars above) so `.github/workflows/keep-supabase-alive.yml` can run.

## Known follow-ups (see spec §10)

- Real room copy/photos/rates for Double Room 1–3 and Family Room 1–2 — pending the client's WordPress export.
- Real Nightsbridge property ID — set `NEXT_PUBLIC_NIGHTSBRIDGE_PROPERTY_ID` once known (see
  `src/components/booking/NightsbridgeWidget.tsx`).
- Restaurant menu content and full legal page text — pending the WordPress export.
- AI blog pipeline (Plan C) not yet built.
- No live Supabase project provisioned yet for this client — every "unconfigured" fallback path in the code is
  what's actually been exercised so far, not the real auth/CRUD/upload flow. Full end-to-end verification (login,
  room edits, gallery upload against production, not just localhost — the Buffer/Blob corruption bug is invisible
  in dev) is a deploy-time follow-up.