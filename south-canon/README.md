# South Canon

Theatrical licensing platform. Next.js 15 + Supabase.

## Local development

    cp .env.local.example .env.local   # fill from Supabase project settings
    npm install
    npm run dev

## Tests

    npm test        # unit (Vitest)
    npm run e2e     # end-to-end (Playwright)

## Database

Migrations live in `supabase/migrations/` and are applied in filename order with
`npx supabase db push`. `supabase/seed.sql` loads one sample play for local work.

## Admin

`/admin` requires a Supabase user whose `app_metadata` contains `{"role": "admin"}`.

## Milestones

- M1 (this repo state): public catalogue, play detail template, admin CRUD
- M2: licence application pipeline, estimator, gated perusal PDFs, producer accounts
- M3: writer portal with royalty statements

See `docs/superpowers/specs/2026-07-26-south-canon-design.md`.