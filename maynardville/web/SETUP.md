# Phase 1 Setup Guide – Maynardville Festival Ops Platform

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm (comes with Node.js)
- Airtable Personal Access Token with **data.records:read/write** and **schema.bases:write** scopes
- Airtable Base ID (create an empty base via Airtable UI, then copy its ID from the URL)

## Step-by-step

1. **Clone and install dependencies**

   ```bash
   cd web
   npm install
   ```

2. **Environment variables**  
   Copy `.env.example` to `.env.local` and fill in the values:

   ```env
   AIRTABLE_API_KEY=patYourPersonalAccessToken
   AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
   CURRENT_SEASON=2026   # or any season string
   QUICKET_API_KEY=      # placeholder for Phase 2 (Quicket integration)
   QUICKET_EVENT_ID=     # placeholder
   ```

3. **Create Airtable base structure**  
   The script builds the 8 required tables (Requesters, Categories, Performances, CompRequests, QuicketEvents, QuicketTickets, AuditLog, Config):

   ```bash
   node scripts/create-airtable-base.mjs
   ```

4. **Seed Requesters and Categories**  
   After the tables are created, add seed data manually or via Airtable UI:

   - **Categories**: add a few records (e.g., “Press”, “VIP”, “Staff”). Note their IDs.
   - **Requesters**: add at least one record with:
     - `token`: a unique string (you’ll use it in the URL)
     - `allowedCategoryIds`: array of Category IDs (use the IDs you just created)
     - `name`, `email`, etc.

5. **Run the dev server**

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000/request/<token>` using the token from your seed Requester record.

6. **Staff dashboard**  
   Placeholder available at `/dashboard`. Real authentication (Auth.js) will be added in Phase 2.

## What lives where (Maynardville‑owned)

- **Airtable Base** – the single source of truth for all ops data.
- **Vercel Project** – hosts the Next.js web app (can be set up in Phase 1 or later).
- **Git Repository** – source code (GitHub / GitLab etc.).
- **API Keys** – Airtable PAT, Quicket keys are stored in Vercel environment variables (or `.env.local` for development).