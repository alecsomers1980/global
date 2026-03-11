# Everest Motoring: System Features & Scalability Plan

This document outlines the current capabilities of the Everest Motoring platform, the planned roadmap to dominate the second-hand car market, and the estimated monthly running costs based on a baseline of 20 new vehicle uploads per month.

---

## 🟢 Phase 1: Current System Capabilities (Live)
These features are currently built into the Everest Motoring platform.

1.  **AI Video & Media Engine**
    *   Automatically turns 3 basic photos (front, dash, rear) into full cinematic AI walkaround videos (using Veo/Sora pipelines).
    *   Generates a professional AI voiceover script based on the car’s specifications.
2.  **Automated Copywriting & SEO**
    *   AI reads the car's specs, condition, and features to automatically write high-converting sales descriptions and SEO metadata.
3.  **Inventory Management & Admin Hub**
    *   Backend CRUD system (`/admin/inventory`) for adding, editing, managing, and featuring vehicle stock.
4.  **Customer Conversion Portals**
    *   Built-in tools for buyers to Book a Test Drive, Calculate Finance (`/finance`), and Value Their Trade-In (`/value-my-car`).
5.  **Affiliate & Referral Tracking**
    *   A portal (`/affiliate`) where partners can generate tracked links and drive sales for a commission.
6.  **Lead Management Dashboard**
    *   Centralized hub for managing incoming purchase leads, trade-in requests, and tracking affiliate payouts.

---

## 🚀 Phase 2: Future Expansion Ideas
These features are planned to be built out to completely automate the dealership's marketing and sales funnel, elevating them above the competition.

1.  **"Zero-Touch" Social Media Publishing**
    *   The generated AI cinematic videos are automatically reformatted to vertical 9:16 and instantly scheduled/published to TikTok, Instagram Reels, YouTube Shorts, and Facebook.
2.  **WhatsApp "AI Salesperson" (Pull Mechanism)**
    *   Integration with WhatsApp Business API. When a lead clicks "Chat about this car", an AI bot instantly responds 24/7 with specs, finance options, and the cinematic video, securing the lead before a human even steps in.
3.  **"Stock Watch" / Automated Matchmaking**
    *   Buyers set up alerts (e.g., "White Fortuner under R700k"). As soon as the dealer uploads a matching car, the system automatically emails/WhatsApps those specific buyers a private link before the car goes public.
4.  **Instant Finance Pre-Approval Module**
    *   Integration with a light credit checking API. Buyers enter ID details to get an instant soft-check pre-approval, ensuring salespeople only speak to qualified, greenlit buyers.
5.  **Automated Trade-In Lifecycle CRM**
    *   30-36 months after a customer buys a car, the CRM automatically sends an SMS/Email: *"Hi [Name], your 2023 Polo has strong resale value right now! Want to upgrade?"*, generating recurring inventory and sales.
6.  **Live Market Pricing AI**
    *   When listing a car, the dashboard scrapes local market data to show the dealer the average asking price and days-on-market for that specific make/model, suggesting the optimal price for a fast sale at maximum profit.
7.  **🏆 Post-Sale Celebration Video (Social Proof Engine)**
    *   When a car is marked "Sold", the system prompts the dealer to snap a photo of the happy customer with their new car. The AI engine instantly creates a celebratory social media video (*"Congratulations to [Name] on their new [Car]!"*) to drive massive local social proof.

---

## 💰 Estimated Monthly Costs (Based on 20 Cars / Month)
The below breakdown estimates the API and hosting costs to run the AI features for **20 new car additions per month**.

### 1. Hosting & Database
*   **Vercel (Frontend Hosting):** Pro Plan = **$20.00 / mo** *(Handles all web traffic, image optimization, edge functions).*
*   **Supabase (Database & Storage):** Pro Plan = **$25.00 / mo** *(Handles Postgres DB, user authentication, and high-volume image/video storage).*
*   **Mux (Video Streaming - Optional but recommended):** ~$5.00 / mo *(For ultra-fast video loading on the frontend).*

### 2. AI Generation Costs (Variable)
Generating the cinematic videos and AI descriptions requires calling external APIs (like OpenAI for text/scripts and Luma Dream Machine / Runway / Sora for video generation).

**Per Car Breakdown (Estimate):**
*   **AI Copywriting / Script (OpenAI GPT-4o):** ~$0.05 per car.
*   **AI Voiceover (ElevenLabs):** ~$0.20 per car.
*   **AI Video Generation (3 Scenes via Video AI APIs):** ~$1.50 - $3.00 per car *(depending on the specific engine used, e.g., Veo, Sora, Gen-3).*

**Total AI Cost per Car:** ~$2.00 - $3.25
**Monthly AI Cost (20 cars):** ~$40.00 - $65.00

### 3. Future API Integrations (Optional add-ons for later)
*   **WhatsApp Business API (Meta):** ~$15.00/mo (depending on conversation volume).
*   **Make.com / Zapier (Social Media linking):** ~$10.50/mo.

---

### 📊 Monthly Summary
To run the highly automated, AI-driven Everest Motoring showroom adding 20 cars a month:

*   **Fixed Infrastructure:** ~$45.00
*   **Variable AI Costs (20 cars):** ~$50.00
*   **Estimated Total Running Cost:** **~$95.00 / month** (Approx. R1,750 ZAR per month).

*This represents an incredibly low overhead compared to hiring a full-time copywriter, videographer, and social media manager.*
