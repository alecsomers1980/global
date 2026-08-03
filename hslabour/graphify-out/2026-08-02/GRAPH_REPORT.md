# Graph Report - hslabour  (2026-07-22)

## Corpus Check
- 141 files · ~91,456 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 504 nodes · 963 edges · 39 communities (27 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3d295334`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Admin Services & Dashboard
- Ebook Admin & Commissions
- Insights Admin (AI Articles)
- City-Service Marketing Pages
- TypeScript Config & Type Refs
- Core Dependencies
- Jobs Pages (PlacementPartner)
- Ebook Shop & Checkout
- Dev Dependencies
- Marketing Homepage & Components
- Contact & Employers Pages
- Affiliates Admin
- Community 12
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
- Community 34
- Community 36
- Community 37
- Community 38
- Community 39

## God Nodes (most connected - your core abstractions)
1. `createAdminClient()` - 73 edges
2. `createClient()` - 41 edges
3. `Container()` - 22 edges
4. `compilerOptions` - 16 edges
5. `formatRands()` - 13 edges
6. `company` - 9 edges
7. `generateInsight()` - 8 edges
8. `isAdmin()` - 8 edges
9. `getEbookProduct()` - 8 edges
10. `AdminEbookPage()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `generateStaticParams()` --calls--> `fetchJobs()`  [EXTRACTED]
  app/(marketing)/jobs/[slug]/page.tsx → lib/jobs/feed.ts
- `JobDetailPage()` --calls--> `getJob()`  [EXTRACTED]
  app/(marketing)/jobs/[slug]/page.tsx → lib/jobs/feed.ts
- `JobsPage()` --calls--> `fetchJobs()`  [EXTRACTED]
  app/(marketing)/jobs/page.tsx → lib/jobs/feed.ts
- `isAdmin()` --calls--> `createClient()`  [EXTRACTED]
  app/admin/affiliates/actions.ts → lib/supabase/server.ts
- `approveAffiliate()` --calls--> `createAdminClient()`  [EXTRACTED]
  app/admin/affiliates/actions.ts → lib/supabase/admin.ts

## Import Cycles
- None detected.

## Communities (39 total, 12 thin omitted)

### Community 0 - "Admin Services & Dashboard"
Cohesion: 0.07
Nodes (40): AdminHome(), metadata, isAdmin(), setJobStatus(), STATUSES, SvcResult, uploadDeliverable(), metadata (+32 more)

### Community 1 - "Ebook Admin & Commissions"
Cohesion: 0.08
Nodes (44): EbookResult, isAdmin(), saveEbookSettings(), setCommissionStatus(), uploadEbookFile(), CommissionActions(), AdminEbookPage(), metadata (+36 more)

### Community 2 - "Insights Admin (AI Articles)"
Cohesion: 0.10
Nodes (33): approveInsight(), backTo(), createBlankInsight(), discardInsight(), generateInsightNow(), GenerateState, isAdmin(), publishInsightNow() (+25 more)

### Community 3 - "City-Service Marketing Pages"
Cohesion: 0.09
Nodes (26): CityServicePage(), generateMetadata(), metadata, steps, generateMetadata(), ServiceDetailPage(), ContactForm(), ContactFormProps (+18 more)

### Community 4 - "TypeScript Config & Type Refs"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 5 - "Core Dependencies"
Cohesion: 0.11
Nodes (19): fast-xml-parser, lucide-react, next, dependencies, fast-xml-parser, lucide-react, next, react (+11 more)

### Community 6 - "Jobs Pages (PlacementPartner)"
Cohesion: 0.17
Nodes (17): JobsPage(), employmentTypeLabel, generateMetadata(), generateStaticParams(), JobDetailPage(), employmentTypeLabel, formatDate(), JobCard() (+9 more)

### Community 7 - "Ebook Shop & Checkout"
Cohesion: 0.11
Nodes (23): EbookPage(), metadata, InsightsPage(), metadata, ArticlePage(), generateMetadata(), generateStaticParams(), metadata (+15 more)

### Community 8 - "Dev Dependencies"
Cohesion: 0.07
Nodes (27): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+19 more)

### Community 9 - "Marketing Homepage & Components"
Cohesion: 0.22
Nodes (7): metadata, accreditations, AudienceSplit(), Container(), Stats, testimonials, cn()

### Community 10 - "Contact & Employers Pages"
Cohesion: 0.40
Nodes (3): metadata, LocalBusinessJsonLd(), NOTE: physical `address` is intentionally omitted until the client provides it.

### Community 11 - "Affiliates Admin"
Cohesion: 0.27
Nodes (9): AdminResult, approveAffiliate(), declineAffiliate(), isAdmin(), Affiliate, AffiliateRow(), AdminAffiliatesPage(), metadata (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.21
Nodes (5): metadata, reasons, metadata, ClosingCta(), ParallaxSectionProps

### Community 15 - "Community 15"
Cohesion: 0.20
Nodes (5): metadata, metadata, JobFiltersProps, PlacementPartnerEmbed(), JobsSource

### Community 16 - "Community 16"
Cohesion: 0.21
Nodes (5): metadata, metadata, metadata, LegalLayout(), LegalLayoutProps

### Community 18 - "Community 18"
Cohesion: 0.25
Nodes (4): earnings, metadata, steps, PageHeaderProps

### Community 19 - "Community 19"
Cohesion: 0.36
Nodes (7): callDeepSeek(), __dirname, main(), MAX_TOKENS, parseSSE(), ROOT, stripFences()

### Community 20 - "Community 20"
Cohesion: 0.40
Nodes (5): ContactFormData, hits, isRateLimited(), POST(), TODO: wire email (Resend). Avoid logging PII — record a redacted event only.

### Community 24 - "Community 24"
Cohesion: 0.50
Nodes (3): cspDirectives, nextConfig, securityHeaders

### Community 26 - "Community 26"
Cohesion: 0.67
Nodes (3): public.commissions, public.ebook_orders, public.ebook_product

### Community 27 - "Community 27"
Cohesion: 0.83
Nodes (3): public.service_jobs, public.shop_orders, public.shop_products

### Community 28 - "Community 28"
Cohesion: 0.50
Nodes (3): public.service_jobs, public.shop_orders, public.shop_products

## Knowledge Gaps
- **148 isolated node(s):** `Category`, `InsightPayload`, `UNSPLASH_TERMS`, `FALLBACK_IMAGES`, `DeepSeekResponse` (+143 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createAdminClient()` connect `Ebook Admin & Commissions` to `Admin Services & Dashboard`, `Insights Admin (AI Articles)`, `Affiliates Admin`, `Ebook Shop & Checkout`?**
  _High betweenness centrality (0.230) - this node is a cross-community bridge._
- **Why does `Container()` connect `Marketing Homepage & Components` to `City-Service Marketing Pages`, `Ebook Shop & Checkout`, `Contact & Employers Pages`, `Community 14`, `Community 15`, `Community 16`, `Community 18`, `Community 22`, `Community 23`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `getPublishedPosts()` connect `Ebook Shop & Checkout` to `Ebook Admin & Commissions`, `City-Service Marketing Pages`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **What connects `Category`, `InsightPayload`, `UNSPLASH_TERMS` to the rest of the system?**
  _148 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Services & Dashboard` be split into smaller, more focused modules?**
  _Cohesion score 0.06502732240437159 - nodes in this community are weakly interconnected._
- **Should `Ebook Admin & Commissions` be split into smaller, more focused modules?**
  _Cohesion score 0.08360655737704918 - nodes in this community are weakly interconnected._
- **Should `Insights Admin (AI Articles)` be split into smaller, more focused modules?**
  _Cohesion score 0.10121457489878542 - nodes in this community are weakly interconnected._