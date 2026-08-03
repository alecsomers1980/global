# Graph Report - everest-motoring  (2026-08-02)

## Corpus Check
- 287 files · ~132,945 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1092 nodes · 1253 edges · 206 communities (124 shown, 82 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `06bcf9fa`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Inventory Admin & AI Actions
- Third-Party Dependencies
- Email Templates & Tests
- Post-Sale Scripts & React
- Affiliate Reports
- AI Provider Chain
- News Admin (AI Posts)
- Monthly Report Builder
- Package & Build Tooling
- Affiliates Admin Actions
- AI News Generator
- Trade-Ins Admin
- Community 12
- Community 13
- Community 14
- Community 15
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
- Community 68
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
- Community 90
- Community 91
- Community 128
- Community 129
- Community 130
- Community 131
- Community 132
- Community 133
- Community 134
- Community 135
- Community 136
- Community 137
- Community 138
- Community 139
- Community 140
- Community 141
- Community 142
- Community 143
- Community 144
- Community 145
- Community 146
- Community 147
- Community 148
- Community 152
- submitContactForm
- calculator.js
- VehicleGallery.jsx
- Icon.jsx
- Everest Motoring — premium redesign
- dependencies
- @anthropic-ai/sdk
- clsx
- framer-motion
- @google-analytics/data
- lucide-react
- marked
- @mux/mux-player-react
- next
- @radix-ui/react-dialog
- @radix-ui/react-dropdown-menu
- react-dom
- @react-email/tailwind
- @react-pdf/renderer
- resend
- @sentry/nextjs
- @supabase/ssr
- tailwind-merge
- AdminNav.jsx
- trends.js
- StatTile.jsx
- page.js
- page.js
- DeleteVehicleButton.jsx
- FloatingWhatsApp.jsx
- VehicleForm.jsx
- seo_actions.js
- page.js
- actions.js
- page.js
- page.js
- page.js

## God Nodes (most connected - your core abstractions)
1. `react` - 16 edges
2. `Everest Motoring — premium redesign` - 11 edges
3. `requireAdmin()` - 10 edges
4. `generateNewsArticle()` - 9 edges
5. `testTemplates()` - 9 edges
6. `fetchGaReport()` - 9 edges
7. `SystemNotificationEmail()` - 8 edges
8. `buildReportData()` - 8 edges
9. `generateSeoForCar()` - 8 edges
10. `main()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --references--> `qrcode`  [EXTRACTED]
  src/app/api/admin/flyer/[carId]/route.js → package.json
- `GET()` --references--> `qrcode`  [EXTRACTED]
  src/app/api/affiliate/flyer/[carId]/route.js → package.json
- `GET()` --references--> `qrcode`  [EXTRACTED]
  src/app/api/affiliate/share-image/[carId]/route.js → package.json
- `testTemplates()` --references--> `react`  [EXTRACTED]
  scripts/test-all-emails.js → package.json
- `testTemplates()` --references--> `react`  [EXTRACTED]
  scripts/test-emails.js → package.json

## Import Cycles
- None detected.

## Communities (206 total, 82 thin omitted)

### Community 0 - "Inventory Admin & AI Actions"
Cohesion: 0.14
Nodes (5): getEngine(), pollSingleClipAction(), preflightSceneImagesAction(), NOTE: maxDuration cannot be exported from a "use server" module (Next.js, startSingleClipAction()

### Community 1 - "Third-Party Dependencies"
Cohesion: 0.20
Nodes (7): qrcode, qrcode, CONTACTS, GET(), CONTACTS, GET(), GET()

### Community 2 - "Email Templates & Tests"
Cohesion: 0.07
Nodes (30): testTemplates(), testTemplates(), GET(), GET(), isAuthorized(), submitContactForm(), CONTACT_EMAIL, submitContactForm() (+22 more)

### Community 3 - "Post-Sale Scripts & React"
Cohesion: 0.09
Nodes (37): react, react, env, resend, supa, addDeliveryPhotoToSale(), addOffInventorySale(), getLeadsForCar() (+29 more)

### Community 4 - "Affiliate Reports"
Cohesion: 0.11
Nodes (28): aggregateLeads(), fetchAffiliateReport(), buildReportData(), getLogoDataUrl(), renderReportPdf(), categorise(), fetchAllEmailsSince(), fetchEmailStats() (+20 more)

### Community 5 - "AI Provider Chain"
Cohesion: 0.14
Nodes (24): @google/generative-ai, @google/generative-ai, callClaude(), callGemini(), callWithRetry(), fetchImage(), runWithFallback(), TRANSIENT_STATUSES (+16 more)

### Community 6 - "News Admin (AI Posts)"
Cohesion: 0.24
Nodes (11): deleteNewsPost(), generateNewsPost(), generateNewsPostAction(), pickFeaturedCar(), publishNewsPost(), requireAdmin(), uniqueSlug(), unpublishNewsPost() (+3 more)

### Community 7 - "Monthly Report Builder"
Cohesion: 0.15
Nodes (15): ActivitySection(), AffiliateSection(), buildLeadStatusRows(), buildPlatformRows(), cleanCaption(), deltaColor(), deltaPct(), formatDuration() (+7 more)

### Community 8 - "Package & Build Tooling"
Cohesion: 0.09
Nodes (21): autoprefixer, eslint, eslint-config-next, devDependencies, autoprefixer, eslint, eslint-config-next, postcss (+13 more)

### Community 9 - "Affiliates Admin Actions"
Cohesion: 0.13
Nodes (8): addAffiliateAction(), toggleAffiliateApproval(), AddAffiliateModal(), AffiliateApprovalToggle(), AffiliateRow(), STATUS_STYLES, AffiliateTopActions(), metadata

### Community 10 - "AI News Generator"
Cohesion: 0.13
Nodes (20): ANTI_SLOP_BLOCK, buildBuyingGuidePrompt(), buildLocalPrompt(), buildModelReviewPrompt(), BUYING_GUIDE_TOPICS, countWords(), _ctrlRe, DEALERSHIP (+12 more)

### Community 11 - "Trade-Ins Admin"
Cohesion: 0.18
Nodes (11): requireAdmin(), sanitizeAmount(), sendTradeInOfferAction(), updateTradeInStatus(), buildDefaultBody(), OfferModal(), metadata, TradeInsTable() (+3 more)

### Community 12 - "Community 12"
Cohesion: 0.18
Nodes (12): getApiKey(), pollSeedanceClip(), SEEDANCE_STYLE_PROMPTS, SEEDANCE_STYLES, sleep(), startSeedanceClip(), motionDirectiveForScene(), pollCinematicTask() (+4 more)

### Community 13 - "Community 13"
Cohesion: 0.40
Nodes (3): jsonLd, metadata, StandaloneFinanceCalculator()

### Community 14 - "Community 14"
Cohesion: 0.27
Nodes (12): cfHeaders(), { createClient }, enableAndWaitForMp4(), fs, ingestToCloudflare(), loadManifest(), main(), MANIFEST (+4 more)

### Community 15 - "Community 15"
Cohesion: 0.53
Nodes (5): CarDetailsPage(), formatWarranty(), generateMetadata(), resolveCar(), SERVICE_HISTORY_LABELS

### Community 16 - "Community 16"
Cohesion: 0.29
Nodes (8): authHeaders(), createStreamFromUrl(), deleteStream(), deleteStreamFromVideoUrl(), enableDownloads(), getStreamStatus(), NOTE: Do NOT trigger /downloads here — stream/copy returns before the, requireEnv()

### Community 17 - "Community 17"
Cohesion: 0.29
Nodes (8): addCongratsVoiceover(), DEFAULT_VOICE_SETTINGS, getSilenceFrames(), padWithSilence(), parseMp3Frames(), requireEnv(), synthesizeVoiceover(), muxAudioOntoVideo()

### Community 18 - "Community 18"
Cohesion: 0.24
Nodes (4): saveBankDetails(), AffiliateDashboardClient(), BankDetailsForm(), metadata

### Community 19 - "Community 19"
Cohesion: 0.40
Nodes (3): FinancingDetailsForm(), metadata, REQUIRED_DOCS

### Community 20 - "Community 20"
Cohesion: 0.24
Nodes (6): cfHeaders, enableDownloadsAndWait(), getDownloadsState(), needsAttention, sleep(), tallies

### Community 21 - "Community 21"
Cohesion: 0.29
Nodes (5): inviteClientAction(), updateLeadStatusAction(), LeadsTable(), LeadStatusSelector(), metadata

### Community 23 - "Community 23"
Cohesion: 0.20
Nodes (8): { createClient }, envFile, fs, keyMatch, supabase, supabaseKey, supabaseUrl, urlMatch

### Community 24 - "Community 24"
Cohesion: 0.42
Nodes (5): requireAdmin(), updatePassword(), updateProfileDetails(), metadata, ProfileForm()

### Community 25 - "Community 25"
Cohesion: 0.25
Nodes (6): anonMatch, { createClient }, envFile, fs, supabase, urlMatch

### Community 26 - "Community 26"
Cohesion: 0.25
Nodes (6): { createClient }, envFile, fs, keyMatch, supabase, urlMatch

### Community 27 - "Community 27"
Cohesion: 0.25
Nodes (6): { createClient }, envFile, fs, keyMatch, supabase, urlMatch

### Community 28 - "Community 28"
Cohesion: 0.25
Nodes (6): { createClient }, envFile, fs, keyMatch, supabase, urlMatch

### Community 29 - "Community 29"
Cohesion: 0.25
Nodes (6): { createClient }, envFile, fs, keyMatch, supabase, urlMatch

### Community 30 - "Community 30"
Cohesion: 0.25
Nodes (6): { createClient }, envFile, fs, keyMatch, supabase, urlMatch

### Community 31 - "Community 31"
Cohesion: 0.25
Nodes (6): { createClient }, envFile, fs, keyMatch, supabase, urlMatch

### Community 33 - "Community 33"
Cohesion: 0.39
Nodes (7): CATEGORY_ICON, CATEGORY_LABEL, estimateReadTime(), formatDate(), generateMetadata(), getPost(), NewsPostPage()

### Community 35 - "Community 35"
Cohesion: 0.25
Nodes (6): { createClient }, envFile, fs, keyMatch, supabase, urlMatch

### Community 36 - "Community 36"
Cohesion: 0.25
Nodes (6): { createClient }, envFile, fs, keyMatch, supabase, urlMatch

### Community 37 - "Community 37"
Cohesion: 0.25
Nodes (6): { createClient }, envFile, fs, keyMatch, supabaseAdmin, urlMatch

### Community 38 - "Community 38"
Cohesion: 0.25
Nodes (6): { createClient }, envFile, fs, keyMatch, supabase, urlMatch

### Community 39 - "Community 39"
Cohesion: 0.25
Nodes (6): { createClient }, envFile, fs, keyMatch, supabaseAdmin, urlMatch

### Community 40 - "Community 40"
Cohesion: 0.25
Nodes (6): { createClient }, envFile, fs, keyMatch, supabaseAdmin, urlMatch

### Community 41 - "Community 41"
Cohesion: 0.25
Nodes (6): { createClient }, envFile, fs, keyMatch, supabaseAdmin, urlMatch

### Community 42 - "Community 42"
Cohesion: 0.67
Nodes (6): bad(), checkGA(), checkSocial(), env(), info(), ok()

### Community 43 - "Community 43"
Cohesion: 0.29
Nodes (6): fs, http, path, SCOPES, server, { URLSearchParams }

### Community 44 - "Community 44"
Cohesion: 0.29
Nodes (5): authUrl, clientId, clientSecret, oauth, server

### Community 45 - "Community 45"
Cohesion: 0.29
Nodes (5): { createClient }, fs, INTRO_LOCAL, OUTRO_LOCAL, path

### Community 46 - "Community 46"
Cohesion: 0.43
Nodes (3): assignCarAction(), AssignClientUI(), metadata

### Community 47 - "Community 47"
Cohesion: 0.33
Nodes (4): metadata, TEMPLATES, TemplateViewer(), WIDTHS

### Community 49 - "Community 49"
Cohesion: 0.83
Nodes (3): pollTestHandoverVideo(), requireAdmin(), startTestHandoverVideo()

### Community 50 - "Community 50"
Cohesion: 0.48
Nodes (6): GET(), getEngine(), IN_PROGRESS_STATES, isAuthorized(), pickNextCar(), updateCar()

### Community 51 - "Community 51"
Cohesion: 0.38
Nodes (6): CATEGORY_ICON, CATEGORY_LABEL, estimateReadTime(), formatDate(), metadata, NewsIndexPage()

### Community 52 - "Community 52"
Cohesion: 0.40
Nodes (5): deleteStream(), fs, main(), MANIFEST, path

### Community 53 - "Community 53"
Cohesion: 0.33
Nodes (4): acct, headers, sub, tok

### Community 54 - "Community 54"
Cohesion: 0.33
Nodes (4): args, buckets, query, supabase

### Community 56 - "Community 56"
Cohesion: 0.67
Nodes (5): createLocalPost(), getAccessToken(), postCarToGbp(), postNewsToGbp(), requireEnv()

### Community 63 - "Community 63"
Cohesion: 0.33
Nodes (4): inter, metadata, microgramme, siteConfig

### Community 65 - "Community 65"
Cohesion: 0.60
Nodes (4): BG_RELATIVE_PATH, composeSceneOneImage(), fetchCarImage(), loadBrandedBackground()

### Community 66 - "Community 66"
Cohesion: 0.70
Nodes (4): getVehiclePath(), getVehicleSlug(), getVehicleUrl(), slugify()

### Community 67 - "Community 67"
Cohesion: 0.50
Nodes (3): { createClient }, PROCESSING_STATES, supabase

### Community 70 - "Community 70"
Cohesion: 0.83
Nodes (3): decryptBankField(), encryptBankField(), getKey()

### Community 72 - "Community 72"
Cohesion: 0.83
Nodes (3): getIndexNowKey(), getKeyLocation(), submitToIndexNow()

### Community 73 - "Community 73"
Cohesion: 0.67
Nodes (3): buildVehicleJsonLd(), DEALER, stripUndefined()

### Community 74 - "Community 74"
Cohesion: 0.67
Nodes (3): news_posts_touch, public.news_posts, public.news_posts_touch_updated()

### Community 164 - "Everest Motoring — premium redesign"
Cohesion: 0.17
Nodes (11): Admin, Approach, Chart palette (admin), Constraint, Direction, Everest Motoring — premium redesign, Foundation (shared), Goal (+3 more)

### Community 165 - "dependencies"
Cohesion: 0.18
Nodes (11): class-variance-authority, @mux/mux-node, @next/third-parties, dependencies, class-variance-authority, @mux/mux-node, @next/third-parties, @react-email/components (+3 more)

### Community 185 - "AdminNav.jsx"
Cohesion: 0.60
Nodes (4): AdminNavDesktop(), AdminNavMobile(), NAV_GROUPS, useIsActive()

### Community 193 - "page.js"
Cohesion: 0.16
Nodes (9): AiVideoStatus(), DeleteVehicleButton(), InventoryTable(), MarkSoldButton(), metadata, SaleVideoPicker(), SeoFixButton(), formatSharedDate() (+1 more)

### Community 198 - "VehicleForm.jsx"
Cohesion: 0.16
Nodes (9): metadata, metadata, CAR_FEATURES, COLOURS, CONDITION_RATINGS, FUEL_TYPES, IMAGE_CATEGORIES, SERVICE_HISTORY (+1 more)

### Community 199 - "seo_actions.js"
Cohesion: 0.43
Nodes (5): autoFixSeoBatch(), autoFixSeoForCar(), pingDeletedVehicle(), pingVehicleUrls(), requireAdmin()

### Community 200 - "page.js"
Cohesion: 0.32
Nodes (6): NewsRowActions(), AdminNewsPage(), CATEGORY_LABEL, formatDate(), metadata, STATUS_STYLES

## Knowledge Gaps
- **302 isolated node(s):** `DEALERSHIP`, `SEO_ANGLE_BLOCK`, `ANTI_SLOP_BLOCK`, `BUYING_GUIDE_TOPICS`, `LOCAL_TOPICS` (+297 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **82 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Post-Sale Scripts & React` to `Email Templates & Tests`, `Trade-Ins Admin`, `Affiliate Reports`, `dependencies`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `Third-Party Dependencies`, `Post-Sale Scripts & React`, `AI Provider Chain`, `Package & Build Tooling`, `@anthropic-ai/sdk`, `clsx`, `framer-motion`, `@google-analytics/data`, `lucide-react`, `marked`, `@mux/mux-player-react`, `next`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `react-dom`, `@react-email/tailwind`, `@react-pdf/renderer`, `resend`, `@sentry/nextjs`, `@supabase/ssr`, `tailwind-merge`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `renderReportPdf()` connect `Affiliate Reports` to `Post-Sale Scripts & React`, `Monthly Report Builder`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `DEALERSHIP`, `SEO_ANGLE_BLOCK`, `ANTI_SLOP_BLOCK` to the rest of the system?**
  _302 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Inventory Admin & AI Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.13970588235294118 - nodes in this community are weakly interconnected._
- **Should `Email Templates & Tests` be split into smaller, more focused modules?**
  _Cohesion score 0.06938020351526364 - nodes in this community are weakly interconnected._
- **Should `Post-Sale Scripts & React` be split into smaller, more focused modules?**
  _Cohesion score 0.09191919191919191 - nodes in this community are weakly interconnected._