<!-- converted from Everest-Motoring-Platform-Features.docx -->

Everest Motoring
Platform Feature & Capability Document
Prepared 21 April 2026  •  everestmotoring.co.za


# Executive Summary
Everest Motoring combines a polished public-facing dealership website with a deep admin backend, email automation, AI-generated video and news content, and integrated affiliate and client portals. Every feature is purpose-built for the South African motor-retail market and optimised for lead capture, customer retention, and search visibility.
This document covers: (1) public-facing frontend features, (2) admin and operational backend, (3) AI and automation systems, (4) integrations, (5) recent work delivered, and (6) what is in progress or planned next.
# 1. Public-Facing Website
Pages visible to the public, prospective buyers, affiliates, and returning clients.
## HOME PAGE
Hero + Featured Vehicles
Landing page with cinematic hero banner, primary call-to-action, and a dynamic featured-vehicles rail pulled from live inventory.
Advantage: High-impact first impression; directs visitors straight to stock that is prioritised for sale.
Inline Search Widget
Home-page search bar with make / model / price / body-type filters that deep-links into the inventory grid.
Advantage: Removes one click from the buying journey — visitors can start browsing without leaving the home page.
## INVENTORY
Inventory Grid with Dynamic Filters
Filterable, sortable listing of all in-stock vehicles. Filters include make, model, year, price range, fuel type, transmission, and body style.
Advantage: Lets buyers self-serve and narrow to their exact requirement — lowers enquiry friction and surfaces the right car faster.
Vehicle Detail Pages
Full vehicle profile: gallery, specs, features list, finance estimator link, AI-generated walk-around video, and a lead form pre-wired to the specific vehicle.
Advantage: Every vehicle has a richer presentation than standard Autotrader/Cars.co.za listings, building trust and conversion.
Live AI Walk-Around Videos
Short AI-generated video clips showcase each vehicle in motion.
Advantage: Differentiates Everest’s stock visually; videos are proven to outperform static imagery in engagement.
Per-Vehicle SEO Fields
Every vehicle carries auto-generated SEO meta title, description, and structured data, plus an IndexNow ping when stock changes.
Advantage: Faster indexing by Google / Bing and better SERP snippets — directly measurable in organic traffic.
## Customer Actions
Value My Car (Trade-In)
Public trade-in valuation form: vehicle details, condition, photos. Submissions feed into the admin Trade-Ins queue.
Advantage: Captures trade-ins proactively — a known high-margin acquisition channel for dealer stock.


Finance / Pre-Approval (Future feature)
Finance information page with pre-approval form (soft check) and links to partner banks.
Advantage: Qualifies buyers earlier — fewer time-wasters on the showroom floor and higher close rate per lead.
Contact & Enquiry Forms
Multiple context-aware forms across the site, all feeding the same Leads pipeline.
Advantage: One CRM inbox for every enquiry source; no leads fall through the cracks.
## Latest News / Content
News Section
Public news / blog with listing and individual article pages; posts are AI-generated monthly and editorially approved.
Advantage: Keeps the site fresh and relevant for SEO; positions Everest as an authority voice in the local motor market.

Questions: Would you want to view and approve these Latest News Articles or should the website write and post them without any user involvement.
## About
About Section
Information on the dealership and information on the team
Advantage: Builds trust in customers by showing the company’s values and showing them the team.

Questions: Can we look and redoing the photos of the staff, we can generate a background for more professional feel. Is there any information you would want to change on the page. Are there any changes to the Meet the director part and do you want more information for each team member


## Client Area
Client Portal
View vehicle client is interested in, documents that are required and status.
When car is marked as sold the documents the client has loaded must be deleted from website and storage. (Security/Privacy reasons)
Advantage: Personalised return experience — clients see their vehicles, documents.
Questions: Are there any documents that are still required or that can be removed.

## Affiliate Area
Affiliate Registration & Approval
Affiliates apply via a dedicated form; admin approves before they can log in.
Advantage: Controlled onboarding — only vetted partners represent Everest.
Affiliate Dashboard
Affiliates see their referred leads, pipeline stages (Call Back / Financing / Completed), monthly commission totals with reset logic, and a searchable lead list.
Advantage: Transparent commission tracking drives affiliate effort; reduces admin queries.
Affiliate Links
Unique tracked referral links per affiliate.
Advantage: Every conversion is attributable — commission pay-outs are defensible and automated.





# 2. Admin & Operational Backend
Private admin console for the Everest team to run the business day-to-day.
## Inventory Management
Add / Edit Vehicles
Full CRUD interface for stock: photos, specs, features, price, status. Are
Advantage: No reliance on third-party stock systems — full control of what appears on the public site within seconds.
Mark as Sold (with Post-Sale Flow)
One-click sold flow that captures buyer name, email, phone, notes, and a customer-collecting-car photo. Stores a sale record, updates vehicle status, and schedules follow-ups. Car will stay visible in inventory for a month and then can be found after that by searching/filter (Status)
Advantage: Turns the sale event into the start of the retention cycle, not the end. Every sale automatically triggers review + video + email workflow.
Social-Share Flags per Vehicle
Columns track which platforms a vehicle has already been shared to, preventing duplicate posts.
Advantage: Enables coordinated multi-channel posting without double-posting.
## Lead & CRM
Leads Board
Central leads list: source, vehicle, client contact, stage, notes, created date. Sortable and searchable.
Advantage: One view of the sales pipeline — nothing lives in private inboxes.
Lead Assignment
Admins can assign leads to specific team members or affiliates.
Advantage: Clear ownership — every lead has an accountable person, improving follow-up speed.

Trade-In Queue
Public trade-in submissions land here for valuation and response.
Advantage: Consolidates trade-in intake; response SLA is trackable.
## Content Management
News Editor
Admin UI to create, edit, and publish news posts, including AI-drafted monthly pieces.
Advantage: Low effort to keep content fresh; AI drafts mean new posts cost minutes, not hours.
## Affiliates Admin
Affiliate Approval + Management
Approve / revoke affiliates, view their referred leads, track commission liability.
Advantage: Hands-on control of the affiliate programme; compliance and payout visibility in one place.
# 3. AI & Automation Systems
## Vehicle Video Pipeline
AI Walk-Around Generation
Each vehicle automatically generates a 5-scene AI walk-around video from its photos. Pipeline supports retry, RHD enforcement, and multi-model fallback.
Advantage: Every car gets an eye-catching video clip at zero per-vehicle production cost.
Video Hosting (Cloudflare Stream)
Generated videos host on Cloudflare Stream for fast delivery and adaptive bitrate.
Advantage: Global CDN playback; MP4 fallbacks ready for email and social.



## Post-Sale Handover Video (New)
Seedance 2 Handover Clip
From the delivery photo, generate an 8-second 16:9 cinematic clip with audio.
Advantage: Gives every buyer a personalised, shareable “I just bought my car” moment — proven to drive word-of-mouth referrals and social engagement.
Auto-Embedded in Review Email
When the handover video completes before the scheduled email sends, the email is automatically rescheduled with the video thumbnail embedded.
Advantage: The review request email goes from “please review us” to “here’s a cinematic reminder of your big moment — please review us.” Dramatically higher open / engagement.
## AI Content
Monthly News Generator (Cron)
Scheduled job drafts industry-relevant news posts monthly, routed through admin for approval before publishing.
Advantage: Always-on SEO content engine; no manual blogging burden.
SEO Generator
Auto-generates SEO title, description, and structured data for each vehicle from its specs.
Advantage: Consistent, rich metadata on every listing without manual data entry.
Script Generator
AI script generator for video voice-overs and marketing copy.
Advantage: Faster creative turnaround; consistent brand voice.



## Email Automation (Resend + React Email)
Post-Sale Review Email (4-Day Delay)
Scheduled automatically when a sale is recorded. Includes vehicle, delivery photo, handover video, and Google review link.
Advantage: Captures the customer at peak satisfaction for a Google review — compounding reputation lift over time.
1-Month Follow-Up
Sent 30 days after delivery.
Advantage: Keeps Everest top-of-mind during the early ownership window.
3-Year Trade-In Reminder
Sent around the 3-year mark to nudge trade-up conversations.
Advantage: Repeat-buyer funnel with zero ongoing effort — revenue-generating automation.
Birthday & Welcome Emails
Personalised birthday greeting and onboarding welcome.
Advantage: Low-cost goodwill that meaningfully improves retention scores.
Newsletter Broadcasts
Branded newsletter template for mass sends to the client base.
Advantage: Re-engage the database on new stock, promotions, and industry news.
Affiliate Media Kit Email
Automated Media-kit of vehicle and unique affiliate link delivery when affiliates are approved and new vehicles are loaded
Advantage: Hands-off affiliate management.


# 4. Integrations & Infrastructure
Google Analytics 4
Traffic and conversion tracking.
Advantage: Data-driven decisions on marketing spend and page performance.
IndexNow
Search-engine notification service pinged when inventory changes.
Advantage: New stock appears in Bing / Yandex within minutes instead of days.
Autotrader & Cars Feeds
Autotrader and Cars.co.za don’t want us to connect directly with them, I am however looking for an AI Agent that can log into those websites and do those entries like a human can do.
# 5. In Progress & Planned
Social Auto-Posting of Handover Videos
Push finished Seedance clips to Instagram, TikTok, and Facebook.
Advantage: Turn every sale into organic social proof — reach clients the buyer knows without paid spend.
WhatsApp Distribution
Automated affiliate media distribution via WhatsApp Business API alongside email.
Advantage: Faster affiliate response times on mobile-first channels.
Live Market Pricing
Real-time market-value signals on each vehicle listing.
Advantage: Builds buyer confidence and justifies asking price.
Instant Finance Pre-Approval (Soft Check)
In-page soft credit check for instant pre-qualification.
Advantage: Converts curious visitors into qualified buyers in one session.
# 6. SEO
To optimize Everest Motoring for modern AI search engines (like Gemini, ChatGPT, and Perplexity), we have implemented several high-level "Generative Engine Optimization" (GEO) strategies.
Here is an overview of the technical and structural work done to help AIs understand and prioritize your content:
1. JSON-LD Structured Data (The "AI Language")
Every vehicle page on your site includes a hidden block of JSON-LD Schema. AIs prefer this structured data over raw text because it gives them direct, unambiguous information about your cars.
What it tells AIs: It precisely identifies the Car type, make, model, price, mileage, and fuel_type in a format that AI search engines can ingest without "guessing."
2. Semantic HTML & Scannability
AIs are trained to read content hierarchy. We use semantic Next.js components and HTML5 tags (<main>, <section>, <h1>, <h3>) to organize the page for them.
The Result: When an AI "crawls" a vehicle page, it immediately knows what the "Specifications" are vs. the "Premium Features," allowing it to answer user questions like "Does Everest Motoring have any diesel SUVs under R500k?" more accurately.
3. Dynamic Metadata (Metadata API)
Using the Next.js Metadata API, we generate unique Page Titles and Meta Descriptions for every car and news post based on their actual database content.
The Result: This provides the "snippet" that AIs use when they summarize your site in a search response.
4. High-Frequency Sitemap & Robots
Your site has an automated sitemap.js file that updates dynamically whenever you add a new car to the database.
The Result: This acts as a "menu" for AI crawlers, ensuring they index your newest arrivals immediately, so their knowledge of your inventory doesn't fall behind.
5. Boosting E-E-A-T (Trust & Authority)
AI algorithms are becoming extremely strict about E-E-A-T (Experience, Expertise, Authoritativeness, and Trustworthiness).
Recent Improvements: By adding the professional Privacy Policy, Terms of Use, and Company Registration details (POPIA/ECTA compliance), we have signalled to search engines that Everest Motoring is a legitimate, compliant, and trustworthy South African business. This is a massive factor in how AIs rank your site compared to others.
6. Semantic URLs
Instead of messy IDs, your site uses clean URLs like /inventory/2022-toyota-hilux-5f12a3.
The Result: This helps the AI understand the context of the page before it even finishes loading the content.
In summary: We have moved the site from "just text and images" to a "structured data source" that AI models can easily parse, trust, and recommend to users.
