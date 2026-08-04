# Newsroom Platform — Bushnews Public Site (Design)

**Date:** 2026-07-29
**Status:** Approved, ready for implementation plan
**Scope of this spec:** Sub-project 2 of 4 — the public-facing site, built for Bushnews, with the multi-tenancy seams designed in.

---

## 1. Context

The client owns a network of regional Mpumalanga news titles. A prior evaluation (WordPress theme swaps vs. a Next.js platform) concluded in favour of **one Next.js platform serving all news titles**. Two client-facing documents already exist:

- [News Network Rebuild — Options & Costs](https://claude.ai/code/artifact/2f34c2ff-d680-4a62-956a-49b091253650)
- [One Newsroom Platform — How It Works](https://claude.ai/code/artifact/908a4369-ae8a-44bc-a73a-0d13624b1af5)

### Decisions already locked

| Decision | Value |
|---|---|
| Platform shape | One codebase, one deploy, many domains (true multi-tenant) |
| Titles in scope | bushnews, mp-update, lentsu, mapulaneng, rivoningohealth, + 3 clones (Langa Media, Miss Bushbuckridge, Bushbuckridge Heroes) = **8** |
| Out of the platform | knp-panorama (travel), woodpecker (booking), Temosho (mining) — no shared foundation |
| Database | One Supabase project, free tier → Pro ($25/mo) when it scales |
| Media | **Cloudflare R2**, not Supabase Storage |
| Caching | Next.js ISR at the edge, so reader traffic does not hit Supabase |
| Build base | Extend the existing `bushbuckridge-news` project, not a fresh scaffold |
| Bushnews look | jNews "AI News" layout structure, Bushnews red identity |
| Layout system | Shared primitives + per-site homepage composed in code |

### Why extend rather than restart

The existing project holds the two expensive assets:

1. **~1,110 posts already migrated** (977 from 2025, 133 from 2026) plus a working WordPress-SQL → Supabase pipeline that gets re-run for the other four titles.
2. **A multi-tenant schema** — `site_id` is already present on `posts`, `categories`, and `advertisements`.

The front-end is ~1,400 lines and is being replaced by this work regardless, so there is nothing there worth preserving.

---

## 2. Reference layout

Target: <https://jnews.io/ai-news/> — a demo skin of the jNews WordPress theme.

Structure, top to bottom:

1. **Header** — light. Logo left, horizontal category nav, search icon, dark-mode toggle, accent-coloured action button. Active nav item carries an accent underline.
2. **Hero band** — dark. Large featured card (image, category pill, headline overlaid, byline + date), two secondary cards beneath it, and a right-hand column of five headlines each with an accent category kicker and date, separated by hairlines.
3. **Trending** — section heading with accent underline, four cards across, prev/next arrows.
4. **Latest story** — 8/4 split. Main column is horizontal rows (thumbnail left, headline + byline + two-line excerpt right). Sidebar carries an ad slot and a numbered "Popular posts" widget (large #1 card, then 02–05 rows).
5. **Load More** — centred, hairlines either side.
6. **Footer** — four columns (logo + blurb + social, recent posts, categories, newsletter signup), then a bottom bar.

---

## 3. Brand

Bushnews keeps its own identity; only the *layout* is inherited from the reference.

| Token | Value | Source |
|---|---|---|
| Accent | `#E60000` (live site reports `#FF0000`; the existing build already uses `#E60000` — keep `#E60000`) | bushnews.co.za |
| Body / heading face | Roboto | bushnews.co.za |
| Logo | `https://bushnews.co.za/wp-content/uploads/2023/09/LOGO-s.png` | to be re-exported at 2× by the client if available |
| Hero band | Dark, per the reference | — |

The reference's indigo accent is **not** used anywhere.

---

## 4. Architecture

### 4.1 Repository

Rename `bushbuckridge-news/` → `newsroom-platform/` and split it into its own private GitHub repo, following the established filter-repo procedure used for the other projects. The project is a platform, not a single site, and at two commits deep this is the cheapest possible moment to stop naming it after one title.

```
newsroom-platform/
  middleware.ts                  # hostname → site
  src/
    sites/
      registry.ts                # domain → site config map
      bushnews/config.ts         # tokens, nav, logo, domains
      bushnews/HomePage.tsx      # jNews-style composition
    components/news/             # shared primitives (see §5)
    app/(site)/
      page.tsx                   # dispatches to the resolved site's HomePage
      [category]/page.tsx
      article/[slug]/page.tsx
      search/page.tsx
    lib/
```

### 4.2 Tenancy

- `middleware.ts` resolves the request hostname against `sites/registry.ts` and attaches the resolved site id to the request.
- Server components read the resolved site and pass its id into every query. **Every** Supabase read filters on `site_id`.
- Localhost and preview deploys fall back to `bushnews`.
- An unknown hostname returns 404 rather than silently serving a default.

### 4.3 Theming

Each site config exports brand tokens. The root layout emits them as CSS custom properties on `<body>`; components style through `var(--brand-accent)` and friends and never hardcode a colour value. This is what makes the same primitive usable by a red masthead and a blue one.

### 4.4 Layout system

Each site composes its own `HomePage.tsx` from shared primitives, in code — not from a layout config schema, and not from a drag-drop builder.

Rationale: the remaining seven titles each match a *different* reference demo, and those references have not been supplied yet. A layout-config schema designed against a single known layout would be a guess, and every demo that failed to fit would force schema churn. Code composition pixel-matches freely. **Revisit converting to config after three sites are built** and the genuinely repeating structures are known.

Article, category, and search pages stay structurally shared across all titles, differing only by brand tokens. *(Assumption stated to the client: if a title needs a structurally different article page, that is additional scope.)*

---

## 5. Modules

### Primitives — `src/components/news/`

`CategoryPill`, `Byline`, `ArticleCard`, `ArticleRow`, `HeadlineListItem`, `SectionHeading`, `AdSlot`.

### Composed modules

| Module | Contents | Data source |
|---|---|---|
| `SiteHeader` | logo, 6-category nav, search, theme toggle | site config |
| `HeroBand` | 1 feature + 2 secondary + 5 headlines, on dark | latest `is_top_story`, then next 2, then next 5 |
| `TrendingCarousel` | 4 across, prev/next | recent posts spread across categories, excluding hero items |
| `LatestFeed` | horizontal rows + Load More | paginated by `published_at` |
| `Sidebar` | ad slot + numbered Popular posts | `advertisements` (active, in date window); Popular by `view_count`, falling back to `is_top_story` + recency while `view_count` is still empty |
| `SiteFooter` | 4 columns + newsletter capture | site config + recent posts + categories |

The nav carries **six** real categories, not the reference's nine — the header must absorb a shorter nav without looking sparse.

### Category data (from the WordPress dump)

Counts below are **all-time totals from WordPress**, not counts of migrated rows — which is why they exceed the 1,110 posts currently in Supabase. See §10.1.

| Category | Slug | Posts |
|---|---|---|
| Community | `community` | 1,139 |
| Top Story | `top-story` | 849 |
| Crime | `crime` | 691 |
| Lifestyle | `lifestyle` | 153 |
| Sports | `sports` | 107 |
| Politics | `politics` | 30 |
| Notice | `notice` | 15 |
| Uncategorized | `uncategorized` | 96 |

"Top Story" is an editorial flag, not a section — it maps to the existing `is_top_story` column and drives the hero slot. It does **not** appear in the nav. "Uncategorized" does not appear in the nav either.

---

## 6. Data model changes

Three gaps block the layout as specified:

| # | Gap | Blocks | Change |
|---|---|---|---|
| 1 | No post → category relationship. `posts` and `categories` exist with no join and no `category_id` | Nav, all category routes, every category pill | Add a `post_categories` join table; migrate `wp_term_relationships` from the dump |
| 2 | No author field | Bylines throughout | Add `posts.author`; migrate `post_author` via `wp_users` |
| 3 | No popularity signal | Trending and Popular modules | Add `posts.view_count` plus an increment RPC, called from a client beacon (ISR-safe) |

Excerpts are **not** a schema change — they are derived from `content`, which the existing homepage already does.

All three changes carry `site_id` semantics consistent with the existing tables.

---

## 7. Media migration

Existing images move from Supabase Storage to Cloudflare R2, and stored URLs are rewritten. `getImageUrl` in `src/lib/supabase.ts` currently resolves against `storage.from('media')` and must stop doing so.

**External dependency:** a Cloudflare R2 account and credentials are required from Alec before this step can run. This is the only blocking external dependency in the spec.

---

## 8. Success criteria

Verified by running the site, not by inspection:

1. Bushnews homepage renders entirely from live Supabase data — no placeholder or demo content paths remain reachable.
2. Visual comparison against the reference at 1440px, 768px, and 375px shows matching structure and module order.
3. All six category routes resolve and return real posts. No nav link 404s.
4. Search returns results across title and content.
5. Article pages render with byline, category pill, and featured image.
6. Tenancy proven: a throwaway second `site_id` row is added and confirmed not to leak into Bushnews queries, then removed.
7. No `storage.from('media')` URLs remain anywhere in the codebase or the data.
8. Lighthouse performance ≥ 90 on an article page.

---

## 9. Explicitly deferred

Recorded here so they are re-surfaced at the relevant later spec, not quietly lost:

| Deferred | Re-surface at |
|---|---|
| Saved Posts / bookmarks (needs reader accounts) | Admin spec |
| Comments system and comment counts | Admin spec |
| Share counts | Admin spec |
| AI features (summarise, article assist, LLM/GEO) | Monetisation + AI spec |
| Newsroom admin / CMS | Admin spec |
| Ad booking and self-serve portal | Monetisation spec |
| The other 7 titles and their migrations | Rollout spec |
| ~1,000 pre-2025 archive posts | Rollout spec — see §10 |

---

## 10. Open questions for the client

1. **Archive depth.** The WordPress dump contains roughly 2,186 published items; 1,110 were migrated (2025 onward). Around a thousand older articles, and their URLs, are not in Supabase. Does she want the full archive carried over, or is 2025-onward acceptable? This affects redirects and any inbound links.
2. **`noindex, nofollow`.** `bushnews.co.za` currently serves `noindex, nofollow`, instructing search engines not to index the site at all. Either this is an error that has been suppressing all organic traffic, or it is deliberate. It must be resolved before cutover.
3. **Logo asset.** The available logo is a small WordPress upload. A higher-resolution original is preferred.

---

## 11. Risks

| Risk | Mitigation |
|---|---|
| The remaining seven layouts differ more than expected, and the primitives don't stretch | Primitives are built to Bushnews's needs only; extend per site rather than pre-generalising |
| Popularity data is empty at launch, so Popular posts looks arbitrary | Seed the ordering with `is_top_story` + recency until `view_count` accumulates |
| R2 credentials delayed | Media migration is the last step; everything else proceeds against existing URLs |
| Free-tier Supabase limits | Text-only in Postgres, images on R2, ISR at the edge — the limits are not reachable at this scale |

---

## 12. Sub-project map

This spec is one of four. The others follow separately.

1. Tenancy + theming foundation *(folded into this spec, since the public site is its first consumer)*
2. **Public site — this spec**
3. Newsroom admin / CMS — the real blocker for daily publishing
4. Monetisation, AI, and rollout of the remaining titles
