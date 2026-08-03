# Graph Report - .  (2026-07-16)

## Corpus Check
- 209 files · ~102,314 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 830 nodes · 1264 edges · 104 communities (68 shown, 36 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Jobcards & Portal Admin API
- Orders, Auth & Contact API
- Artwork Admin Portal
- Global Layout & Shared Components
- Jobcard Detail Page
- News / Auto-Blog System
- Package & Build Tooling
- TypeScript Config & Type Refs
- Services Pages & SEO
- Shop Admin Orders Dashboard
- Shop Products & Data
- Planning Docs: Pricing, Jobcards & Roles
- About & Contact Pages
- Reel Render Pipeline
- Homepage & Hero Components
- News & Quote Public Pages
- Projects Portfolio Admin
- Email Template Generator
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
- Community 77
- Community 79
- Community 80
- Community 87
- Community 88
- Community 89
- Community 98

## God Nodes (most connected - your core abstractions)
1. `createServerSupabase()` - 58 edges
2. `logAudit()` - 31 edges
3. `formatPrice()` - 24 edges
4. `createClientSupabase()` - 21 edges
5. `createAdminSupabase()` - 18 edges
6. `JobcardEditPage()` - 16 edges
7. `compilerOptions` - 16 edges
8. `useCart()` - 15 edges
9. `requireAdmin()` - 13 edges
10. `buildButton()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `createServerSupabase()`  [EXTRACTED]
  app/api/portal/jobs/route.ts → lib/supabase-server.ts
- `GET()` --indirect_call--> `rowToProduct()`  [INFERRED]
  app/api/products/route.ts → lib/product-mapper.ts
- `Header()` --calls--> `useCart()`  [EXTRACTED]
  components/Header.tsx → context/CartContext.tsx
- `Cinematic UI Redesign Roadmap` --conceptually_related_to--> `Next.js create-next-app scaffold README`  [AMBIGUOUS]
  SITE.md → README.md
- `AdminOrderDetail()` --calls--> `formatPrice()`  [EXTRACTED]
  app/admin/orders/[id]/page.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Jobcard Auto-Pricing Flow** — docs_pricing_shop_plan_artwork_department_charge, docs_pricing_shop_plan_hp_latex_price_list, docs_pricing_shop_plan_auto_invoice_line_sync, docs_jobcard_form_updates_plan_hp_latex_multi_product_rows, docs_jobcard_form_updates_plan_vinyl_cut_multi_rows [INFERRED 0.85]
- **Admin Access Control & Accountability** — docs_staff_users_audit_plan_auth_metadata_role_model, docs_staff_users_audit_plan_staff_accounts, docs_staff_users_audit_plan_first_login_password_change, docs_staff_users_audit_plan_audit_log [INFERRED 0.85]

## Communities (104 total, 36 thin omitted)

### Community 0 - "Jobcards & Portal Admin API"
Cohesion: 0.06
Nodes (60): GET(), DELETE(), DEPT_LABELS, GET(), PUT(), GET(), POST(), GET() (+52 more)

### Community 1 - "Orders, Auth & Contact API"
Cohesion: 0.07
Nodes (53): PATCH(), POST(), POST(), POST(), POST(), PUT(), GET(), POST() (+45 more)

### Community 2 - "Artwork Admin Portal"
Cohesion: 0.05
Nodes (32): ALL_STATUSES, Allowance, Job, JobFile, Profile, Proof, PROOF_STATUS_COLORS, ProofComment (+24 more)

### Community 3 - "Global Layout & Shared Components"
Cohesion: 0.04
Nodes (41): @anthropic-ai/sdk, manrope, metadata, CookieConsent(), CartProvider(), heic-convert, lucide-react, next (+33 more)

### Community 4 - "Jobcard Detail Page"
Cohesion: 0.13
Nodes (29): calculateWorkflowStatus(), createEntry(), FileEntry, FLATBED_MATERIALS, JOBCARD_ITEM_OPTIONS, JobcardEditPage(), StatusCheckbox(), STATUSES (+21 more)

### Community 5 - "News / Auto-Blog System"
Cohesion: 0.11
Nodes (23): GET(), ensureUniqueSlug(), POST(), slugify(), NewsEditPage(), PostForm, STATUS_BADGES, NewArticleForm (+15 more)

### Community 6 - "Package & Build Tooling"
Cohesion: 0.07
Nodes (29): autoprefixer, eslint, eslint-config-next, devDependencies, autoprefixer, eslint, eslint-config-next, postcss (+21 more)

### Community 7 - "TypeScript Config & Type Refs"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 8 - "Services Pages & SEO"
Cohesion: 0.14
Nodes (14): generateMetadata(), generateStaticParams(), ServicePage(), sitemap(), Feature, FeatureGridProps, ProcessStepsProps, Step (+6 more)

### Community 9 - "Shop Admin Orders Dashboard"
Cohesion: 0.14
Nodes (12): AdminOrderDetail(), Order, AdminDashboard(), Order, PAYMENT_CONFIG, STATUS_CONFIG, Order, OrderConfirmationContent() (+4 more)

### Community 10 - "Shop Products & Data"
Cohesion: 0.19
Nodes (10): featuredProductIds, featuredProducts, categories, getLowestUnitPrice(), getProductById(), getProductsByCategory(), PricingTier, products (+2 more)

### Community 11 - "Planning Docs: Pricing, Jobcards & Roles"
Cohesion: 0.14
Nodes (16): HP Latex Multi-Product Rows (digital_details_json.rows), Installation Panel Three-Line Layout (install_tools_json), Outsource Companies Tracking (outsource_details_json), Quote Number & PO Number Header Fields, Artwork Department Charge (hours x rate, default R250), Artwork Milestones (Proof Sent / Approved / Received), Authoritative Setup-Route Pattern (idempotent CREATE TABLE GET routes), Auto Invoice Line Sync (_auto marker upsert) (+8 more)

### Community 12 - "About & Contact Pages"
Cohesion: 0.13
Nodes (4): metadata, metadata, ContactFormProps, ServiceHeroProps

### Community 13 - "Reel Render Pipeline"
Cohesion: 0.21
Nodes (12): HERE, MUSIC_DIR, pickMusic(), USED_LOG, admin, download(), HERE, main() (+4 more)

### Community 14 - "Homepage & Hero Components"
Cohesion: 0.15
Nodes (6): jsonLd, metadata, AboutSection(), hexData, slides, gridImages

### Community 15 - "News & Quote Public Pages"
Cohesion: 0.15
Nodes (3): metadata, metadata, Header()

### Community 16 - "Projects Portfolio Admin"
Cohesion: 0.21
Nodes (6): CATEGORY_SUGGESTIONS, EMPTY, ProjectFormState, downscaleImage(), uploadLargeMedia(), uploadProjectMedia()

### Community 17 - "Email Template Generator"
Cohesion: 0.15
Nodes (4): brand, __dirname, emails, outDir

### Community 18 - "Community 18"
Cohesion: 0.22
Nodes (12): dirs, fs, getAllFiles(), heicConvert, libDir, outputBase, path, processImage() (+4 more)

### Community 19 - "Community 19"
Cohesion: 0.15
Nodes (12): dependencies, dotenv, @supabase/supabase-js, @vercel/postgres, description, dotenv, @supabase/supabase-js, @vercel/postgres (+4 more)

### Community 21 - "Community 21"
Cohesion: 0.22
Nodes (7): files, fs, galleryDir, path, publicDir, shuffledFiles, targets

### Community 22 - "Community 22"
Cohesion: 0.28
Nodes (8): fs, heicConvert, inputDir, manifestPath, outputDir, path, processImages(), sharp

### Community 23 - "Community 23"
Cohesion: 0.33
Nodes (7): public.print_job_files, public.print_jobs, public.profiles, public.proof_comments, public.proofs, public.update_updated_at(), set_updated_at

### Community 24 - "Community 24"
Cohesion: 0.46
Nodes (5): ProductCardProps, CartContext, CartContextType, CartItem, Product

### Community 26 - "Community 26"
Cohesion: 0.38
Nodes (5): CartPage(), CheckoutPage(), ShopPage(), ProductCard(), useCart()

### Community 27 - "Community 27"
Cohesion: 0.33
Nodes (4): INSTALL_DEFAULTS, Material, Pricing, VinylMaterial

### Community 28 - "Community 28"
Cohesion: 0.33
Nodes (6): Brand Color Palette (Cinematic Black / Aloe Green / Vibrant Emerald), Cinematic UI Design System, Glassmorphism, Typography: Outfit headings, Manrope body, Next.js create-next-app scaffold README, Cinematic UI Redesign Roadmap

### Community 29 - "Community 29"
Cohesion: 0.67
Nodes (3): buildEmailHTML(), POST(), UploadNotification

### Community 33 - "Community 33"
Cohesion: 0.50
Nodes (3): filePath, path, XLSX

### Community 35 - "Community 35"
Cohesion: 0.50
Nodes (3): files, fs, glob

### Community 37 - "Community 37"
Cohesion: 0.67
Nodes (3): run(), testEmail(), transporter

### Community 38 - "Community 38"
Cohesion: 0.50
Nodes (3): buildCommand, crons, outputDirectory

### Community 55 - "Community 55"
Cohesion: 0.67
Nodes (3): Music Rotation Policy (exclude last 9 tracks, .used.json history), Reel Render Station (Render-Reels.bat pipeline), Supabase Media Hosting via Signed URLs

## Ambiguous Edges - Review These
- `Cinematic UI Redesign Roadmap` → `Next.js create-next-app scaffold README`  [AMBIGUOUS]
  SITE.md · relation: conceptually_related_to

## Knowledge Gaps
- **239 isolated node(s):** `{ sql }`, `metadata`, `Order`, `Order`, `STATUS_CONFIG` (+234 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **36 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Cinematic UI Redesign Roadmap` and `Next.js create-next-app scaffold README`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `dependencies` connect `Global Layout & Shared Components` to `Package & Build Tooling`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `CartProvider()` connect `Global Layout & Shared Components` to `Community 24`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **What connects `{ sql }`, `metadata`, `Order` to the rest of the system?**
  _239 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Jobcards & Portal Admin API` be split into smaller, more focused modules?**
  _Cohesion score 0.060083594566353184 - nodes in this community are weakly interconnected._
- **Should `Orders, Auth & Contact API` be split into smaller, more focused modules?**
  _Cohesion score 0.07330618289522399 - nodes in this community are weakly interconnected._
- **Should `Artwork Admin Portal` be split into smaller, more focused modules?**
  _Cohesion score 0.05224963715529753 - nodes in this community are weakly interconnected._