# Everest Syndication Agent — setup & daily use

A small tool that runs on the dealer's PC and pushes vehicles from the Everest
inventory to **cars.co.za** and **AutoTrader** by filling their listing forms.
It **fills only — it never submits.** A person reviews each listing in the
browser and clicks submit.

## One-time setup

1. Install **Google Chrome** and **Node.js LTS** (https://nodejs.org).
2. Copy the `everest-stock-sync` folder onto the PC.
3. Open a terminal in that folder and run:
   ```
   npm install
   ```
   (This also downloads the browser engine it needs.)
4. Copy `.env.example` to `.env` and fill in:
   ```
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
   (from the everest-motoring project). Nothing else is required — you log in to
   the portals yourself in the next step.

## Daily use

1. Double-click **`Start-Agent.bat`** (or run `npm run agent`). It will:
   - open **Chrome** on the two dealer portals,
   - start the local **bridge**,
   - open the **dashboard** at http://localhost:8799.
2. In the Chrome window, **log in to cars.co.za and AutoTrader** and solve any
   “Just a moment…” check. (Your login is remembered between sessions, so you
   won’t always need to do this.)
3. In the dashboard, click **cars.co.za** or **AutoTrader** next to a vehicle.
   The bot fills that listing in the Chrome window (~30–90s) and stops.
4. **Review the filled listing** in Chrome and submit it yourself if it’s correct.

Notes:
- Only one vehicle runs at a time.
- If a button says it can’t reach the agent, make sure `Start-Agent` is running.
- Auto-submit (skip the manual review) can be enabled later — the only manual
  step that will always remain is logging in and clearing Cloudflare.
