# Woodpecker Guesthouse

Next.js + Supabase rebuild of woodpeckersguesthouse.co.za. See
`docs/superpowers/specs/2026-08-13-woodpecker-guesthouse-design.md` (repo root) for the full design spec.

## Local development

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in Supabase/Resend/WhatsApp values.
3. Run the schema: paste `supabase/migrations/0001_init.sql`, then `0002_admin_auth.sql`, then `0003_blog.sql` into the Supabase SQL editor, in that order.
4. Seed real content: `node scripts/seed.mjs` (requires `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` set). Seeds all 8 rooms with real copy and real photos already uploaded to Storage — see commit `897db4f8` if you need to re-upload photos from a fresh WP export.
5. `npm run dev`

## Admin panel

`/admin` — staff sign-in (Supabase Auth), rooms CRUD, gallery manager (multi-upload with auto-optimize).

- **First admin account:** create the user via the Supabase dashboard (Authentication → Users → Invite), then run
  `update public.profiles set role = 'admin' where email = '...';` in the SQL editor. Every other invited account
  defaults to `role = 'staff'`, which is enough to sign in and edit content.
- **Optional 2FA:** staff can enable TOTP at `/admin/security`. Not required unless you want to make it mandatory later.
- **Public pages use ISR** (`revalidate = 60`) — admin edits appear on the live site within about a minute, no
  redeploy required.

## Blog admin

`/admin/blog` — AI-drafted articles about Hazyview, the Panorama Route and Kruger, reviewed before they go live.

- **Monthly generation cron** (`/api/cron/generate-blog`, 1st of the month) drafts 2 posts and emails `CONTACT_TO_EMAIL` to review.
- **"Generate a draft now"** button on `/admin/blog` does the same thing on demand.
- **Review queue:** every draft starts as `Draft`. Click **Approve** to schedule it (publishes on the next daily run), or **Discard**. Nothing reaches the public site without a human clicking Approve.
- **Daily publish cron** (`/api/cron/publish-blog`) flips `Approved` posts to `Published` once their schedule is due.
- **No fabricated hero images or contact details:** generated posts start with no hero image and a CTA that links to `/accommodation` and `/contact` only — never a photo or phone number that isn't real. Add a hero image the same way as room photos: paste a `site-media` URL into the post's edit page.
- Requires `ANTHROPIC_API_KEY` and `CRON_SECRET` in Vercel — both crons return 503/401 without them (in production; local dev skips the `CRON_SECRET` check but still needs `ANTHROPIC_API_KEY` + a configured Supabase project to actually run).

## Deploy

Vercel, git-push auto-deploy on `main`. **Root Directory must be set to `woodpecker-guesthouse`** in the Vercel
project settings (this lives in a monorepo). Set the same env vars from `.env.example` in the Vercel dashboard.

After first deploy: add `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` as **GitHub Actions repo secrets** (different
from the Vercel env vars above) so `.github/workflows/keep-supabase-alive.yml` can run.

## Known follow-ups (see spec §10)

- **Done 2026-08-14:** all 8 rooms now have real copy, bed/guest details and real photos (recovered from the
  client's WordPress DB export + uploads folder), the restaurant page links to all 4 real menu PDFs, conferencing
  and attractions have real copy, and both legal pages have the full real text. A live Supabase project is
  provisioned, all 3 migrations are applied, and the site has been verified end-to-end against it — real rooms
  render with real photos, RLS confirmed blocking anonymous writes while allowing public reads, admin routes
  correctly redirect unauthenticated requests.
- Real room **rates** were not in the WP export (the old site left pricing to Nightsbridge) — `rate_from` is still
  null on every room; fill in via `/admin/rooms` once known, or leave null (the room cards handle it gracefully).
- Real Nightsbridge property ID — genuinely not recoverable from the WP export either (searched the full DB dump;
  the embedded widget markup has no property-specific ID in it). Set `NEXT_PUBLIC_NIGHTSBRIDGE_PROPERTY_ID` once the
  client provides it (see `src/components/booking/NightsbridgeWidget.tsx`).
- Gallery is still empty (`gallery_categories` seeded, `gallery_images` is not) — the WP export used a gallery
  plugin (FooGallery) whose data wasn't parsed in this pass. Populate via `/admin/gallery`, or ask if you want the
  FooGallery data parsed too.
- **No admin account created yet.** Deliberately not done by AI — create your own via the Supabase dashboard
  (Authentication → Users → Invite) with your real email, then promote it per the "First admin account" step above.
  Once that's done, the login/rooms-CRUD/gallery-upload/blog-generate/publish flows should get one real logged-in
  pass before you rely on them daily — RLS and routing are verified, but no one has actually clicked through the
  admin UI against live data yet.
- Blog pipeline crons (`vercel.json`) need `ANTHROPIC_API_KEY` and `CRON_SECRET` set in Vercel before they'll run;
  until then the admin's "Generate a draft now" button is the only working entry point, and it needs the same
  `ANTHROPIC_API_KEY`.