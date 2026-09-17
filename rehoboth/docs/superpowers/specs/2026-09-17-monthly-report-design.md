# Monthly Report — design

**Date:** 2026-09-17 · **Status:** approved by Alec (brainstorm, this date)

A PDF report for the previous calendar month, generated on the 1st, emailed to the client and kept in the admin. Ports the Everest Motoring report pipeline (`everest-motoring/src/lib/reports/`) with two deliberate changes: GA4 is read through a service account rather than OAuth, and reports are stored so the admin can list and re-download them.

## Goals

- On the 1st of each month, Frieda receives a PDF covering the previous month without anyone doing anything.
- Every past report is one click away in the admin.
- The report never fails outright because one source is down.
- Nothing in it can breach the medicines-law wording rule that the rest of the site enforces.

## Non-goals

- Social media metrics (no social accounts connected; Everest's `social.js` is not ported).
- Year-on-year comparisons (there is no history yet; the layout leaves room, nothing is computed).
- A dashboard with live charts. This is a document.

## Report contents

PDF, A4 portrait, `@react-pdf/renderer`. Brand: `--brand` teal `#6C8781` for rules and tile figures, ink `#1B2521` for text. Fonts: Marcellus (headings) and Karla (body) registered from TTFs committed under `public/fonts/`, falling back to Helvetica if registration fails. Delta arrows are ASCII + colour (`+12%` green / `-4%` red), never glyphs — Everest's Helvetica lesson.

Sections, in order. Every figure that has a previous month shows its change vs that month.

1. **Cover strip** — "Rehoboth Herbal Co. · Monthly Report · September 2026", generated date, the period covered in SAST.
2. **Executive summary** — 3–4 sentences + up to two suggestions, AI-written from the computed metrics. Rendered only when `REPORT_AI_SUMMARY=on` (cron) or `?ai=1` on the admin preview. See *AI summary*.
3. **Sales** — tiles: paid orders, revenue (R), average order value, orders delivered vs collected from the farm. One line beneath: "N checkouts started but not paid" (orders with status `pending`/`failed` created in the month).
4. **Products** — two five-row tables: top products by revenue and by units, each row `product · size · units · R revenue`.
5. **Customers & enquiries** — tiles: new customer accounts, contact messages received, stockist applications received, stockist applications approved this month.
6. **News** — articles published this month (title + date), total articles live.
7. **Website traffic** — tiles: sessions, users, new users, page views, engagement rate. Tables: top 10 pages (path, views), traffic sources by channel group (sessions), device category (sessions), top 5 countries (sessions). If tracking began mid-month, a note reads "Tracking started DD Month; figures cover DD–DD." If GA4 is unavailable, the section is replaced by one line: "Website traffic was unavailable when this report was generated."

## Period

The report month is the previous calendar month **in Africa/Johannesburg**. Vercel runs the cron in UTC; `lib/reports/period.ts` converts: month boundaries are computed in SAST and then expressed as UTC instants for the Supabase queries and as `YYYY-MM-DD` dates for GA4 (which takes the property's own timezone — the property must be set to Johannesburg when created).

`period.ts` exports `previousMonth(now = new Date())` → `{ key: "2026-09", label: "September 2026", startUtc, endUtc, startDate, endDate }` and `monthFromKey("2026-09")` for the admin's Generate-now.

## Data sources

### Shop data — `lib/reports/shop.ts`

Service-role Supabase client, all queries bounded by `[startUtc, endUtc)`.

| Metric | Query |
|---|---|
| Paid orders, revenue, AOV, delivery/collect split | `orders` where `status in ('paid','fulfilled')` and `paid_at` in period; sum `total`; count by `collect_from_farm` |
| Checkouts not paid | `orders` where `status in ('pending','failed','cancelled')` and `created_at` in period |
| Top products | `order_items` joined to those paid orders; group by `product_name, size_label`; sum `qty`, sum `qty * unit_price` |
| New customers | `customers` where `created_at` in period |
| Messages | `contact_messages` where `created_at` in period |
| Stockist applications received / approved | `stockist_applications` where `created_at` in period; `status = 'approved'` and `updated_at` in period — **`updated_at` does not exist on that table; migration adds it** (see *Migration*) |
| Articles | `news_posts` where `published and published_at` in period; total where `published` |

Attribution rule: revenue is attributed to the month the order was **paid** (`paid_at`), not created — an order started on the 31st and paid on the 1st belongs to the new month. Everest attributes by `created_at` because it has no paid date; Rehoboth has one, so use it.

The previous month is computed with the same function against the previous period, once, for deltas.

### Website traffic — `lib/reports/ga.ts`

GA4 Data API `runReport`, authenticated with a **service account** (`GA_SERVICE_ACCOUNT_JSON`, the key file's contents as one env var; `GA4_PROPERTY_ID`, the numeric ID). No OAuth, no refresh token, nothing expires. Google's `@google-analytics/data` client.

Five requests, all `dateRanges: [{ startDate, endDate }]`:

- totals: `sessions, totalUsers, newUsers, screenPageViews, engagementRate`
- pages: dimension `pagePath`, metric `screenPageViews`, limit 10
- channels: dimension `sessionDefaultChannelGroup`, metric `sessions`
- devices: dimension `deviceCategory`, metric `sessions`
- countries: dimension `country`, metric `sessions`, limit 5

"Tracking started" is detected by a sixth request for the property's first day with any sessions in the period (`date` dimension, ordered ascending, limit 1); if that day is after `startDate`, the note is shown.

Any thrown error → `{ available: false }`; the report renders the one-line fallback. The error is logged with the month key so the cron log shows *why*.

### Tracking tag — `app/layout.tsx`

`next/script` (`strategy="afterInteractive"`) loading `gtag.js` with `NEXT_PUBLIC_GA_MEASUREMENT_ID`; rendered only when that var is set, so dev and previews send nothing. `next.config.ts` CSP gains `https://www.googletagmanager.com` in `script-src`, and `https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com` in `connect-src` and `img-src`. Anonymised IP is default in GA4; no consent banner is added (out of scope; noted for the POPIA placeholders task).

## AI summary — `lib/reports/summary.ts`

Same "AI CFO" pattern as Everest: the model receives the **finished metrics object** (current month, previous month, deltas, GA availability) and returns `{ headline, findings: [{ what, why, action }] }` — it computes nothing and is told the figures are final. `claude-sonnet-4-6` via the existing `@anthropic-ai/sdk` dependency, 20 s timeout, best-effort: any failure drops the section silently.

Two gates, both mandatory:

- **Enable gate:** rendered only when `REPORT_AI_SUMMARY=on` (cron) or the admin preview is called with `?ai=1`. Off by default; Alec reviews a real render before setting the env var.
- **Wording gate:** output passes through `lib/compliance.ts`'s `screen()` before rendering. A blocked result drops the section and logs the blocked words. The system prompt also forbids health claims, but the code check is the one that counts.

`toPdfSafe()` strips characters outside the registered fonts' ranges before rendering, as in Everest.

## Rendering — `lib/reports/MonthlyReport.tsx` + `build.ts`

`build.ts` orchestrates: `period → shop (this + previous) → ga → summary → renderToBuffer(<MonthlyReport data />)`. Returns `{ pdf: Buffer, data: ReportData }`. `ReportData` is one typed object; `MonthlyReport.tsx` is a pure function of it (so it can be rendered with mock data in a test).

Layout rules carried over from Everest, verbatim: every titled table wrapped in `<View wrap={false}>` so a heading never strands; rows `wrap={false}`; section titles use `minPresenceAhead`. Tiles are a four-up row; tables are two-column where content allows.

## Storage — migration `0011_monthly_reports.sql`

```sql
create table monthly_reports (
  month        text primary key,            -- '2026-09'
  storage_path text not null,               -- 'reports/2026-09.pdf'
  generated_at timestamptz not null default now(),
  emailed_to   text[] not null default '{}',
  email_error  text,
  ga_available boolean not null,
  ai_included  boolean not null
);
alter table monthly_reports enable row level security;   -- no policies: service role only

alter table stockist_applications add column updated_at timestamptz not null default now();
create trigger stockist_applications_touch before update on stockist_applications
  for each row execute function moddatetime(updated_at);
```

Private Storage bucket `reports` (created in the same migration via `storage.buckets`). PDFs are uploaded with `upsert: true` at `reports/<month>.pdf`, and the `monthly_reports` row is upserted on `month` — **regenerating a month replaces it**; there is never a second row or file for the same month.

`moddatetime` is a Postgres extension available on Supabase; the migration enables it.

## Delivery — `lib/reports/email.ts`

Resend, from `Rehoboth Herbal Co. <orders@rehobothherbal.co.za>` (domain verified 2026-09-17), to `REPORT_TO` (`info@rehobothherbal.co.za`), cc `REPORT_CC` (`alec@emb3r.co.za`), subject `Rehoboth Herbal Co. — September 2026 report`, attachment `Rehoboth-Report-2026-09.pdf`, two-line plain body naming the period and saying the report is also in the admin under Reports.

Failure is recorded on the row (`email_error`) and does not fail the run: the PDF is already stored and visible.

## Trigger — `app/api/cron/monthly-report/route.ts`

`GET`, requires `Authorization: Bearer ${CRON_SECRET}` (Vercel sends this automatically for configured crons), 401 otherwise. Runs `build → store → email` for `previousMonth()`, returns JSON `{ month, stored, emailed, gaAvailable, aiIncluded, errors[] }`. `maxDuration = 60`.

`vercel.json`:

```json
{ "crons": [{ "path": "/api/cron/monthly-report", "schedule": "0 6 1 * *" }] }
```

06:00 UTC = 08:00 SAST, so the client has it at the start of the working day. (Vercel Hobby runs daily-granularity crons within an hour of the time; the project is on Pro, where the time is exact.)

## Admin — `app/admin/reports/page.tsx` + actions

New **Reports** item in `AdminNav` (after Settings, icon: a document). Page lists `monthly_reports` newest first: month, generated date, "emailed to …" or "email failed: …", a **Download** button (server action returns a 60-second signed URL for the private file; the browser opens it), and a **Generate now** button for the previous month plus a month picker for older months. Generate-now calls the same `build → store → email` path with `email: false`, so a preview does not spam the client; a separate **Send** button emails a stored report on demand.

Admin actions live in `app/admin/actions.ts` beside the others and go through `lib/admin.ts` — same token verification, same `RefusedError` pattern for messages meant for the screen.

Preview route: `app/api/admin/reports/[month]/route.ts` returns the PDF inline for a given month (admin token in `Authorization`), honouring `?ai=1`. This is how Alec reviews the summary before enabling it.

## Environment variables

| Name | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Vercel prod | `G-XXXXXXX` — the tag on the site |
| `GA4_PROPERTY_ID` | Vercel prod | numeric property ID (not the G- id) |
| `GA_SERVICE_ACCOUNT_JSON` | Vercel prod | service-account key JSON, single line |
| `CRON_SECRET` | Vercel prod | cron auth; Vercel injects it into cron requests |
| `REPORT_TO`, `REPORT_CC` | Vercel prod | recipients |
| `REPORT_AI_SUMMARY` | Vercel prod | `on` to render the summary in the cron run |
| `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `SUPABASE_*` | already set | reused |

Vercel stores these as Sensitive — `vercel env pull` returns blanks, so values are verified by the preview route, not by pulling (Everest lesson). Watch for a leading BOM on `GA4_PROPERTY_ID`: paste it, don't upload it.

## Set-up checklist for Alec (done once)

1. Google Analytics → create a GA4 property "Rehoboth Herbal Co.", timezone **Africa/Johannesburg**, currency ZAR, web data stream for `https://www.rehobothherbal.co.za`. Note the `G-` measurement ID and the numeric property ID (Admin → Property settings).
2. Google Cloud → create a project (or reuse Ember's) → IAM → Service accounts → create `rehoboth-report` → Keys → add JSON key → download.
3. GA4 → Admin → Property access management → add the service account's email as **Viewer**.
4. Vercel → add the env vars in the table above; redeploy.
5. Open `/admin/reports`, click Generate now, check the PDF (with `?ai=1` on the preview route to see the summary). Set `REPORT_AI_SUMMARY=on` when satisfied.

## Testing

- `lib/reports/period.test.ts` — month boundaries across the SAST/UTC line (a run at 00:30 SAST on the 1st reports the month that just ended; 23:30 UTC on the 30th does too).
- `lib/reports/shop.test.ts` — attribution by `paid_at`, status filters, top-product grouping across sizes, empty month returns zeros not nulls.
- `lib/reports/summary.test.ts` — a summary containing a blocked word is dropped; a model error is dropped; both leave `aiIncluded: false`.
- `MonthlyReport` rendered with mock data via the esbuild recipe from the Everest notes, then read as a PDF: check page breaks with 10-row tables, the GA-unavailable variant, and the AI section on and off. This is a manual gate, not a unit test.
- One end-to-end run against production data via Generate now before the first cron fires on 2026-10-01.

## Out of scope, noted

- Cookie consent for GA (POPIA) — belongs with the Information Officer / VAT placeholders task.
- Follower or social metrics.
- Anything rendered on the public site.
