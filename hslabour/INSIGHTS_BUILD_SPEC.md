# Insights (AI Article Generator) — Build Spec

Mirrors rvrinc's insights system for H&S Labour Brokers, tuned for SEO / GEO / AI-citation.
**Workflow:** Claude architects (this spec + prescriptive `.ds` prompts); DeepSeek transcribes to files.

## Decisions (locked)
- **Writer LLM (runtime):** DeepSeek API (OpenAI-compatible, `DEEPSEEK_API_KEY`, model `deepseek-chat`).
- **Images:** Gemini `gemini-2.5-flash-image` → Unsplash → curated per-category fallback.
- **Categories (5):** Hiring & Workforce · Labour Law & Compliance · Career & Job-Seeking · Employment Trends & Industry · Payroll & HR Management.
- **Cadence:** 2 drafts/month (scheduled 7th & 21st), **human-approved** before publish.
- **Section URL:** `/insights`.

## Flow
1. `generate-insights` cron (monthly) → 2 DRAFTs, least-used category, scheduled 7th/21st.
2. Admin reviews at `/admin/insights` → edit + APPROVE or DISCARD.
3. `publish-insights` cron (daily) → APPROVED & due → PUBLISHED.
4. Public `/insights` + `/insights/[slug]` (ISR), with Article + Breadcrumb JSON-LD.

## Data
`insights_posts` (migration `0006_insights.sql`, already written): id, title, slug, excerpt,
meta_title, meta_description, content(md), category, image_url, status
(DRAFT|APPROVED|PUBLISHED|DISCARDED), scheduled_for, created_at, published_at. RLS on, no
policies (service-role only). Public bucket `insight_images`.

## Files
DeepSeek-generated (via `.ds`):
- `lib/insights/generator.ts` — CATEGORIES, pickNextCategory, generateInsight (DeepSeek API),
  Gemini image + Unsplash + fallback, slugify. (p30)
- `lib/insights/queries.ts` — getPublishedPosts, getPostBySlug, getPublishedSlugs. (p30)
- `components/seo/ArticleJsonLd.tsx`. (p30)
- `app/api/cron/generate-insights/route.ts`, `app/api/cron/publish-insights/route.ts`. (p30)
- `app/insights/layout.tsx`, `app/insights/page.tsx`, `app/insights/[slug]/page.tsx`. (p31)
- `app/admin/insights/page.tsx`, `app/admin/insights/actions.ts`,
  `app/admin/insights/[id]/page.tsx`. (p32)

Claude hand-written / integration:
- `supabase/migrations/0006_insights.sql` ✓
- `vercel.json` crons, `app/sitemap.ts`, `public/llms.txt`, footer "Insights" link,
  `/admin` card.

## Env vars (Vercel)
`DEEPSEEK_API_KEY`, `GEMINI_API_KEY`, `UNSPLASH_ACCESS_KEY`, `CRON_SECRET`.

## Run
```
DS_MAX_TOKENS=16000 node opencode-glm-extension/ds-run.js hslabour/.ds/p30-insights-core.txt hslabour/.ds/r30.txt
node opencode-glm-extension/ds-apply.js hslabour/.ds/r30.txt hslabour
# repeat for p31, p32
```
Then run `0006_insights.sql` in Supabase, set env vars, `tsc`/`eslint`/`build`, commit.
