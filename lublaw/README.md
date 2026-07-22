# Lublaw — B Lubbe & Associates Attorneys

Next.js rebuild of https://lublaw.co.za/. See `docs/superpowers/specs/2026-07-22-lublaw-rebuild-design.md`
at the monorepo root for the full design spec.

## Local development

    npm install
    cp .env.local.example .env.local   # fill in Supabase + Resend keys
    npm run dev                        # http://localhost:3012

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key (RLS-enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key — used only in `scripts/import-blog.mjs` and the admin image-upload API route. Never expose client-side. |
| `RESEND_API_KEY` | Contact form email delivery. Without it, the form fails gracefully with a visible error. |
| `CONTACT_TO_EMAIL` | Where contact form submissions are sent (default `info@lublaw.co.za`) |

## First-time Supabase setup

See `supabase/README.md`.

## Blog migration

Historical blog posts are scraped into `intake/legacy-blog/posts.json`, then imported via:

    npm run import-blog          # dry run
    npm run import-blog:apply    # writes to Supabase + uploads images to Storage

## Deployment

Not yet deployed. Intended target: Vercel, git-push auto-deploy from `main`, matching the
majority of sibling projects in this monorepo. Requires: Vercel project linked, environment
variables set in the Vercel dashboard, a verified Resend sending domain (currently using the
sandbox `onboarding@resend.dev` sender — swap in `src/app/api/contact/route.ts` once available).
