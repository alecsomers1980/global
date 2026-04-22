# Bushbuckridge News Project Plan

## 1. Project Planning & Architecture
- [x] Analyze current website (`www.bushnews.co.za`)
- [x] Plan system architecture for multi-tenant / clonable sites (white-labeling)
- [x] Architect Backend & CMS (handling stories, top stories curation)

## 2. Infrastructure & Scaffolding
- [x] Initialize Next.js 15 (React 19) project (`bushbuckridge-news`)
- [x] Install dependencies (GSAP 3, Lucide React, Tailwind)
- [x] Setup Environment Variables & Aesthetic Presets structure

## 3. Database & CMS (Supabase)
- [ ] Setup Supabase project and database schema (`posts`, `categories`, `advertisements`)
- [ ] Create CMS UI / Admin Dashboard for journalists

## 4. WordPress Migration (2025+)
- [ ] Export WP Database (2025+ posts)
- [ ] Automate upload of WP media to Supabase Storage
- [ ] Ingest WP data into Supabase `posts` table

## 5. UI/UX Implementation (Cinematic Guidelines)
- [x] Build Floating Navbar
- [x] Build Hero Section (Top Stories)
- [/] Build News Feed Layout (Grid & Sidebar)
- [ ] Build Individual Article Page
- [ ] Build "Advertise With Us" (Payfast integration)

## 6. Automation & SEO
- [ ] Configure Ember Social Media webhooks
- [ ] Implement NewsArticle Schema and SEO Meta Tags
