# Graph Report - ember-social  (2026-07-29)

## Corpus Check
- 213 files · ~125,566 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1102 nodes · 1748 edges · 136 communities (73 shown, 63 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bcd4fb13`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Campaign Generate & Image-Change API
- Caption & Tagline Template Scripts
- Nano Showcase Preview Scripts
- Vercel Cron Jobs
- July Angle Revision Scripts
- AI Caption & OAuth Callbacks
- TypeScript Config & Type Refs
- Intelligence Save & OAuth Init
- Package & Build Tooling
- Client Review Builder Scripts
- Social History Analyzer
- Approvals & Brand Kit Dashboard
- Roadmap Docs & Hard Rules
- Image Regeneration & Brand Overlay
- Calendar & Inbox Dashboard
- AI Campaign Generator Core
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- Community 59
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- Community 94
- Community 95
- Community 96
- Community 97
- Community 98
- Community 99
- Community 100
- Community 101
- Community 102
- Community 103
- Community 104
- Community 105
- Community 117
- Community 118
- Community 119
- Community 120
- Community 121
- Community 122
- Community 123
- Community 124
- Community 125
- Community 126
- Community 127
- Community 128
- Community 129
- Community 130
- Community 131
- Community 132

## God Nodes (most connected - your core abstractions)
1. `createServerSupabaseClient()` - 48 edges
2. `resolveWorkspaceId()` - 41 edges
3. `createAdminClient()` - 27 edges
4. `compilerOptions` - 16 edges
5. `createClient()` - 15 edges
6. `renderShowcase()` - 14 edges
7. `resolveWorkspace()` - 13 edges
8. `buildHeadlineSvg()` - 13 edges
9. `renderLifestyle()` - 13 edges
10. `buildHeadlineSvg()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Everest Vehicle Post HTML Template (facebook-post)` --conceptually_related_to--> `Inventory-Aware Campaign Variants (Day 5 original, superseded)`  [INFERRED]
  scripts/vehicle-template/templates/facebook-post.html → docs/roadmap/day-5-inventory-aware-variants.md
- `Everest July 2026 Premium Lifestyle Content Plan` --conceptually_related_to--> `AI Lifestyle Images + Branded Overlay (Day 5 revised)`  [INFERRED]
  everest-july-2026-content-plan.md → docs/roadmap/day-5-revised-lifestyle-images.md
- `YouTube Family Reel Upload Package (2026-07-06)` --conceptually_related_to--> `Everest July 2026 Premium Lifestyle Content Plan`  [INFERRED]
  everest-youtube-family-reel-2026-07-06.md → everest-july-2026-content-plan.md
- `DashboardLayout()` --calls--> `createServerSupabaseClient()`  [EXTRACTED]
  src/app/dashboard/layout.tsx → src/lib/supabase/client.ts
- `PlanPage()` --calls--> `createAdminClient()`  [EXTRACTED]
  src/app/plan/[token]/page.tsx → src/lib/supabase/client.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Everest Motoring 4-Day Sprint** — docs_roadmap_day_1_brand_social_intake_unified_intake, docs_roadmap_day_2_smart_campaign_variants_campaign_generator, docs_roadmap_day_3_review_portal_pdf_client_review_portal, docs_roadmap_day_4_platform_previews_everest_polish_composer_previews [EXTRACTED 1.00]
- **Engagement Learning Loop (data -> insight -> generation)** — docs_roadmap_phase_a_3_post_results_engagement_persistence, docs_roadmap_phase_c_2_engagement_feedback_loop_feedback_loop, docs_roadmap_phase_d_2_predictive_scoring_ab_variants, docs_roadmap_phase_b_1_analyze_existing_posts_voice_inference [INFERRED 0.85]
- **Codebase Hard Rules (context.md)** — docs_roadmap_context_publish_spine, docs_roadmap_context_slug_vs_uuid_trap, docs_roadmap_context_supabase_client_selection [EXTRACTED 1.00]

## Communities (136 total, 63 thin omitted)

### Community 0 - "Campaign Generate & Image-Change API"
Cohesion: 0.10
Nodes (57): lifestyleCaption(), lifestyleHashtags(), maintenanceCaption(), maintenanceHashtags(), modelTrim(), seasonalCaption(), seasonalHashtags(), sellYourCarCaption() (+49 more)

### Community 1 - "Caption & Tagline Template Scripts"
Cohesion: 0.08
Nodes (61): hashCode(), LIFESTYLE_TAGLINES, lifestyleCaption(), lifestyleHashtags(), lifestyleTagline(), maintenanceCaption(), maintenanceHashtags(), modelTrim() (+53 more)

### Community 2 - "Nano Showcase Preview Scripts"
Cohesion: 0.05
Nodes (32): base, body, cFs, cH, CONTACT, ctaFs, ctaH, ctaXL (+24 more)

### Community 3 - "Vercel Cron Jobs"
Cohesion: 0.10
Nodes (32): admin(), authorized(), GET(), admin(), authorized(), GET(), POST(), fetchEngagementSnapshot() (+24 more)

### Community 4 - "July Angle Revision Scripts"
Cohesion: 0.09
Nodes (30): buildCarousel(), buildComparison(), buildFinance(), buildSeasonal(), byDate(), cellText(), CHANGES, crop45() (+22 more)

### Community 5 - "AI Caption & OAuth Callbacks"
Cohesion: 0.14
Nodes (15): POST(), POST(), POST(), GET(), POST(), POST(), ApprovePage(), GET() (+7 more)

### Community 6 - "TypeScript Config & Type Refs"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 7 - "Intelligence Save & OAuth Init"
Cohesion: 0.14
Nodes (16): POST(), GET(), GET(), GET(), GET(), GET(), GET(), PATCH() (+8 more)

### Community 8 - "Package & Build Tooling"
Cohesion: 0.07
Nodes (27): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, puppeteer, tailwindcss, @tailwindcss/postcss (+19 more)

### Community 9 - "Client Review Builder Scripts"
Cohesion: 0.13
Nodes (23): buildImage(), COLLAGE_CARS, collageFromBuffers(), crop45(), esc(), fetchBuf(), findCar(), fit() (+15 more)

### Community 10 - "Social History Analyzer"
Cohesion: 0.39
Nodes (7): computeBestHours(), computeCadence(), engagementFb(), engagementIg(), FbPost, IgPost, POST()

### Community 11 - "Approvals & Brand Kit Dashboard"
Cohesion: 0.14
Nodes (15): BrandKit, FilterTab, Post, BrandKit, BrandKitPage(), DEFAULT_KIT, FONT_OPTIONS, Intelligence (+7 more)

### Community 12 - "Roadmap Docs & Hard Rules"
Cohesion: 0.12
Nodes (23): Publish Spine (trigger -> approve -> cron -> FB publish), Unified Brand + Social History Intake (Day 1), Smart Campaign Generator + Per-Platform Variants (Day 2), Client Review Portal /plan/<token> + PDF Export (Day 3), Per-Platform Composer Previews + IG First Comment (Day 4), Inventory-Aware Campaign Variants (Day 5 original, superseded), AI Lifestyle Images + Branded Overlay (Day 5 revised), Migration 005: posts.last_error (manual SQL) (+15 more)

### Community 13 - "Image Regeneration & Brand Overlay"
Cohesion: 0.25
Nodes (13): confPath, fontsDir, applyBrandOverlay(), applyMultiCarOverlay(), applySellYoursOverlay(), applySpecCardOverlay(), applyTipCardOverlay(), escapeRegExp() (+5 more)

### Community 14 - "Calendar & Inbox Dashboard"
Cohesion: 0.12
Nodes (15): ALL_STATUSES, Post, MOCK_MESSAGES, PLATFORMS, PlatformsPage(), SocialAccount, SUPPORTED_PLATFORMS, Platform (+7 more)

### Community 15 - "AI Campaign Generator Core"
Cohesion: 0.06
Nodes (41): POST(), GET(), POST(), POST(), CAR_PILLARS, currentSASeason(), POST(), RENDERERS (+33 more)

### Community 16 - "Community 16"
Cohesion: 0.12
Nodes (10): clips, durs, endClip, finalOut, inputs, PREVIEW, segFiles, SHOTS (+2 more)

### Community 17 - "Community 17"
Cohesion: 0.23
Nodes (14): admin(), GET(), POST(), buildPrompt(), extractJson(), GeneratedArticle, generateNewsArticle(), HERO_DEFAULTS (+6 more)

### Community 18 - "Community 18"
Cohesion: 0.18
Nodes (10): buildCarouselPreview(), buildKenBurns(), cellText(), esc(), ff(), items, P(), PAD (+2 more)

### Community 19 - "Community 19"
Cohesion: 0.14
Nodes (8): FAMILY, OUT, scene2, segA, segB, segC, STILL_ONLY, TMP

### Community 20 - "Community 20"
Cohesion: 0.24
Nodes (8): CONTACT, contactItem(), esXml(), formatMileage(), formatPrice(), ICONS, renderShowcase(), specRow()

### Community 21 - "Community 21"
Cohesion: 0.15
Nodes (9): Props, Page(), Props, Props, Page(), Props, WorkspacePage(), isUuid() (+1 more)

### Community 22 - "Community 22"
Cohesion: 0.18
Nodes (7): ACCENT, { duration: dur, width: W, height: H }, endClip, offset, OUT, SRC, TMP

### Community 23 - "Community 23"
Cohesion: 0.31
Nodes (9): buildFeatures(), __dirname, escHtml(), FEATURE_ICONS, fmtMileage(), fmtPrice(), jget(), main() (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.24
Nodes (9): BrandKit, detectPostType(), isImageUrl(), PLATFORM_ICONS, PlatformMockup(), PostPreviewCard(), PostPreviewCardProps, STATUS_DOT (+1 more)

### Community 25 - "Community 25"
Cohesion: 0.29
Nodes (7): buildPrompt(), compositeOverlays(), escXml(), fmtMileage(), fmtPrice(), generateBase(), out

### Community 26 - "Community 26"
Cohesion: 0.27
Nodes (8): detectPostType(), __dirname, env, envFile, main(), openai, rewriteContent(), supabase

### Community 27 - "Community 27"
Cohesion: 0.20
Nodes (4): buf, out, REF_STILLS, urls

### Community 28 - "Community 28"
Cohesion: 0.27
Nodes (7): DashboardLayout(), navItems, Sidebar(), SidebarProps, Workspace, TopBar(), cn()

### Community 29 - "Community 29"
Cohesion: 0.29
Nodes (8): ComposePage(), DEFAULT_VARIANTS, PLATFORM_LIMITS, PlatformKey, MobileFramePreview(), Props, truncate(), PLATFORM_COLORS

### Community 30 - "Community 30"
Cohesion: 0.22
Nodes (4): PlanView(), PostData, Props, PlanPage()

### Community 31 - "Community 31"
Cohesion: 0.38
Nodes (9): public.brand_kits, public.client_intel_notes, public.client_intelligence, public.media, public.post_results, public.posts, public.social_accounts, public.workspace_api_keys (+1 more)

### Community 32 - "Community 32"
Cohesion: 0.22
Nodes (9): class-variance-authority, dependencies, class-variance-authority, @radix-ui/react-popover, @radix-ui/react-tabs, @radix-ui/react-toast, @radix-ui/react-popover, @radix-ui/react-tabs (+1 more)

### Community 33 - "Community 33"
Cohesion: 0.22
Nodes (7): apiKey, ids, keyHash, NOTE: this only yields reach/impressions if the Facebook page has already been, serviceKey, supabase, url

### Community 34 - "Community 34"
Cohesion: 0.22
Nodes (4): buf, out, REFS, urls

### Community 35 - "Community 35"
Cohesion: 0.39
Nodes (7): admin(), POST(), ArticlePayload, ClientSiteConfig, pushArticleToClient(), toRemotePayload(), unpublishOnClient()

### Community 36 - "Community 36"
Cohesion: 0.33
Nodes (7): createLocalPost(), GbpApiNotApproved, getFirstLocationName(), getFreshAccessToken(), LocalPostInput, refreshAccessToken(), TokenRow

### Community 37 - "Community 37"
Cohesion: 0.16
Nodes (9): getNextAvailableDateForVehicle(), POST(), detectPostType(), openai, rewriteSocialContent(), ALL_WEEKDAYS, isSunday(), SAST_WINDOW_UTC (+1 more)

### Community 39 - "Community 39"
Cohesion: 0.15
Nodes (12): Concept bank, Constraint that shapes the design, Decided against, Flow, Goal, Monthly content variety automation — design spec, Net effect, New `posts` columns (+4 more)

### Community 40 - "Community 40"
Cohesion: 0.29
Nodes (5): __dirname, env, envContent, envFile, supabase

### Community 41 - "Community 41"
Cohesion: 0.29
Nodes (4): __dirname, env, envFile, supabase

### Community 42 - "Community 42"
Cohesion: 0.29
Nodes (6): filter, inputFile, inStats, outDir, outputFile, outStats

### Community 43 - "Community 43"
Cohesion: 0.29
Nodes (4): __dirname, env, envFile, supabase

### Community 45 - "Community 45"
Cohesion: 0.33
Nodes (3): emberEnv, everestEnv, supabase

### Community 46 - "Community 46"
Cohesion: 0.33
Nodes (3): counts, nowIso, sinceIso

### Community 48 - "Community 48"
Cohesion: 0.33
Nodes (3): __dirname, env, everestEnvFile

### Community 49 - "Community 49"
Cohesion: 0.53
Nodes (5): admin(), DELETE(), EDITABLE_FIELDS, GET(), PATCH()

### Community 50 - "Community 50"
Cohesion: 0.53
Nodes (5): config, isPublicPath(), middleware(), PUBLIC_EXACT, PUBLIC_PREFIXES

### Community 52 - "Community 52"
Cohesion: 0.50
Nodes (3): h, main(), refreshGoogleToken()

### Community 54 - "Community 54"
Cohesion: 0.70
Nodes (4): aggregateInWindow(), emptyWindowResult(), fetchPageReach(), GET()

### Community 55 - "Community 55"
Cohesion: 0.27
Nodes (6): GET(), GET(), GET(), GET(), GET(), resolveWorkspace()

### Community 56 - "Community 56"
Cohesion: 0.60
Nodes (4): AnalyticsData, AnalyticsPage(), fmt(), fmtDecimal()

### Community 57 - "Community 57"
Cohesion: 0.50
Nodes (4): buildMonthOptions(), GenerateMarketingPlanButton(), GenerationResult, Props

### Community 58 - "Community 58"
Cohesion: 0.40
Nodes (3): Batch, PATTERN_LABELS, Props

### Community 59 - "Community 59"
Cohesion: 0.60
Nodes (4): news_articles_touch, public.news_articles, public.news_articles_touch_updated(), public.workspaces

### Community 61 - "Community 61"
Cohesion: 0.83
Nodes (3): admin(), authorized(), GET()

### Community 62 - "Community 62"
Cohesion: 0.67
Nodes (3): admin(), EDITABLE_FIELDS, PATCH()

### Community 64 - "Community 64"
Cohesion: 0.67
Nodes (3): public.campaign_batches, public.post_feedback, public.posts

## Knowledge Gaps
- **348 isolated node(s):** `Problem`, `Goal`, `Out of scope`, `Part 1 — Angle rotation (finance / comparison / seasonal-local)`, `Constraint that shapes the design` (+343 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **63 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createServerSupabaseClient()` connect `AI Caption & OAuth Callbacks` to `Community 36`, `Community 37`, `Community 21`, `Community 55`, `Community 28`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `resolveWorkspaceId()` connect `Intelligence Save & OAuth Init` to `AI Caption & OAuth Callbacks`, `Social History Analyzer`, `AI Campaign Generator Core`, `Community 17`, `Community 21`, `Community 55`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 32` to `Package & Build Tooling`, `Community 73`, `Community 74`, `Community 77`, `Community 78`, `Community 79`, `Community 80`, `Community 82`, `Community 83`, `Community 84`, `Community 85`, `Community 86`, `Community 87`, `Community 88`, `Community 89`, `Community 90`, `Community 91`, `Community 92`, `Community 93`, `Community 94`, `Community 95`, `Community 96`, `Community 97`, `Community 98`, `Community 99`, `Community 100`, `Community 101`, `Community 102`, `Community 103`, `Community 104`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `Problem`, `Goal`, `Out of scope` to the rest of the system?**
  _348 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Campaign Generate & Image-Change API` be split into smaller, more focused modules?**
  _Cohesion score 0.10096153846153846 - nodes in this community are weakly interconnected._
- **Should `Caption & Tagline Template Scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.07785602503912363 - nodes in this community are weakly interconnected._
- **Should `Nano Showcase Preview Scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._