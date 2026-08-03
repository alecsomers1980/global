# Graph Report - .  (2026-07-17)

## Corpus Check
- 155 files · ~110,513 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 585 nodes · 1074 edges · 55 communities (40 shown, 15 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Admin Bookings & Case Actions
- Public Site Pages
- Admin Settings & Users
- Case Management
- Third-Party Dependencies
- Contact API & React
- Clients & Documents Admin
- Package & Build Tooling
- AI Insights & Cron
- TypeScript Config & Type Refs
- Practice Areas & Sitemap
- ID Import SQL Script
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
- Community 30
- Community 31
- Community 32
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 46 edges
2. `Button` - 34 edges
3. `cn()` - 22 edges
4. `createClient()` - 19 edges
5. `createAdminClient()` - 17 edges
6. `compilerOptions` - 15 edges
7. `Footer()` - 13 edges
8. `Header()` - 13 edges
9. `getCaseStatuses` - 11 edges
10. `StatusPhase` - 10 edges

## Surprising Connections (you probably didn't know these)
- `sendAdminNotification()` --references--> `react`  [EXTRACTED]
  src/lib/email.ts → package.json
- `sendCaseUpdateEmail()` --references--> `react`  [EXTRACTED]
  src/lib/email.ts → package.json
- `sendContactEmail()` --references--> `react`  [EXTRACTED]
  src/lib/email.ts → package.json
- `AdminInsightsPage()` --calls--> `createClient()`  [EXTRACTED]
  src/app/admin/insights/page.tsx → src/lib/supabase/server.ts
- `generateMetadata()` --calls--> `createClient()`  [EXTRACTED]
  src/app/insights/[slug]/page.tsx → src/lib/supabase/server.ts

## Import Cycles
- None detected.

## Communities (55 total, 15 thin omitted)

### Community 0 - "Admin Bookings & Case Actions"
Cohesion: 0.08
Nodes (37): AdminBookingsPage(), assignAttorney(), NewCasePage(), CompleteProfilePage(), AdminDocumentUploadPage(), AdminInsightDetailPage(), approvePost(), discardPost() (+29 more)

### Community 1 - "Public Site Pages"
Cohesion: 0.06
Nodes (27): marbleHallTeam, metadata, pretoriaTeam, InsightsPage(), metadata, generateMetadata(), InsightDetailPage(), formatSubmission() (+19 more)

### Community 2 - "Admin Settings & Users"
Cohesion: 0.08
Nodes (36): AccountSettingsPage(), EMPTY_FORM, FormState, roleBadge, inter, legalServiceJsonLd, metadata, playfair (+28 more)

### Community 3 - "Case Management"
Cohesion: 0.12
Nodes (32): updateCaseStatus(), CaseDetailPage(), AdminCasesPage(), Props, SORT_FIELDS, Props, ReportsPage(), caseStatusSchema (+24 more)

### Community 4 - "Third-Party Dependencies"
Cohesion: 0.04
Nodes (45): @anthropic-ai/sdk, class-variance-authority, clsx, date-fns, lucide-react, next, dependencies, @anthropic-ai/sdk (+37 more)

### Community 5 - "Contact API & React"
Cohesion: 0.11
Nodes (28): react, react, contactSchema, POST(), notifySchema, POST(), POST(), AdminNotificationEmail() (+20 more)

### Community 6 - "Clients & Documents Admin"
Cohesion: 0.16
Nodes (24): ClientProfilePage(), AdminClientsPage(), AdminDocumentsPage(), deleteStatus(), saveStatus(), StatusPayload, StatusesPage(), AdminUser (+16 more)

### Community 7 - "Package & Build Tooling"
Cohesion: 0.07
Nodes (29): autoprefixer, eslint, eslint-config-next, devDependencies, autoprefixer, eslint, eslint-config-next, pg (+21 more)

### Community 8 - "AI Insights & Cron"
Cohesion: 0.11
Nodes (25): AdminInsightsPage(), generateNewInsight(), statusStyles, GET(), GET(), createAdminClient(), CATEGORIES, Category (+17 more)

### Community 9 - "TypeScript Config & Type Refs"
Cohesion: 0.08
Nodes (25): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+17 more)

### Community 10 - "Practice Areas & Sitemap"
Cohesion: 0.14
Nodes (14): IconMap, metadata, sitemap(), attorneys, practiceAreas, Attorney, BlogPost, Branch (+6 more)

### Community 11 - "ID Import SQL Script"
Cohesion: 0.20
Nodes (8): buf, dataRows, escapeSql(), nameToSqlCondition(), NON_ID_VALUES, rows, skipped, wb

### Community 12 - "Community 12"
Cohesion: 0.36
Nodes (9): execSQL(), main(), resolve4, resolve6, resolveHost(), runSQLFile(), setupStorageBuckets(), supabase (+1 more)

### Community 13 - "Community 13"
Cohesion: 0.36
Nodes (8): public.attorneys, public.blog_posts, public.case_status_history, public.case_statuses, public.cases, public.documents, public.practice_areas, public.profiles

### Community 14 - "Community 14"
Cohesion: 0.48
Nodes (5): getAccessToken(), getDriveId(), graphGet(), listCaseFiles(), SharePointFile

### Community 15 - "Community 15"
Cohesion: 0.38
Nodes (6): public.case_status_history, public.cases, public.documents, public.is_admin(), public.is_admin_or_attorney(), public.profiles

### Community 16 - "Community 16"
Cohesion: 0.43
Nodes (6): public.attorneys, public.blog_posts, public.cases, public.documents, public.practice_areas, public.profiles

### Community 17 - "Community 17"
Cohesion: 0.53
Nodes (5): Image, composite_onto_background(), main(), Removes each team member's background and composites them onto Tanya's backgroun, remove_bg()

### Community 18 - "Community 18"
Cohesion: 0.47
Nodes (5): isActualIdNumber(), main(), NON_ID_VALUES, normalizeName(), supabase

### Community 19 - "Community 19"
Cohesion: 0.40
Nodes (3): attorneys, practiceAreas, supabase

### Community 20 - "Community 20"
Cohesion: 0.50
Nodes (4): formatSize(), Props, SharePointFile, SharePointFiles()

### Community 21 - "Community 21"
Cohesion: 0.40
Nodes (4): appointmentSchema, caseSchema, documentUploadSchema, loginSchema

### Community 22 - "Community 22"
Cohesion: 0.60
Nodes (4): ADMIN_ONLY_PREFIXES, config, EXEMPT_ADMIN_PATHS, middleware()

## Knowledge Gaps
- **191 isolated node(s):** `extends`, `next/core-web-vitals`, `public.practice_areas`, `public.attorneys`, `public.blog_posts` (+186 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Third-Party Dependencies` to `Contact API & React`, `Package & Build Tooling`?**
  _High betweenness centrality (0.163) - this node is a cross-community bridge._
- **Why does `react` connect `Contact API & React` to `Third-Party Dependencies`?**
  _High betweenness centrality (0.154) - this node is a cross-community bridge._
- **Why does `createClient()` connect `Admin Bookings & Case Actions` to `Public Site Pages`, `Case Management`, `Contact API & React`, `AI Insights & Cron`, `Practice Areas & Sitemap`?**
  _High betweenness centrality (0.151) - this node is a cross-community bridge._
- **What connects `extends`, `next/core-web-vitals`, `public.practice_areas` to the rest of the system?**
  _191 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Bookings & Case Actions` be split into smaller, more focused modules?**
  _Cohesion score 0.07890122735242548 - nodes in this community are weakly interconnected._
- **Should `Public Site Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.06429070580013976 - nodes in this community are weakly interconnected._
- **Should `Admin Settings & Users` be split into smaller, more focused modules?**
  _Cohesion score 0.07547169811320754 - nodes in this community are weakly interconnected._