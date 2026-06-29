# everest-stock-sync

Browser-automation **spike** for syndicating Everest Motoring inventory to
classified portals that offer no API.

> Status: **Step 1 — cars.co.za login + live-stock scrape (read-only).**
> This proves we can log in and read current stock, and reveals the anti-bot
> reality before we invest in create/update/delist.

## Setup

```bash
cd everest-stock-sync
npm install            # also installs the Chromium browser
cp .env.example .env   # then fill in the values
```

Fill in `.env`:

- `CARSCOZA_USERNAME` / `CARSCOZA_PASSWORD` — your dealer login.
- `CARSCOZA_LOGIN_URL` — the dealer-portal login page URL.
- `CARSCOZA_STOCK_URL` — leave **blank** the first time; the spike dumps the
  post-login page so you can grab the real stock-list URL.

## Run — attended mode (recommended)

cars.co.za is behind **Cloudflare**, which blocks a headless bot. Attended mode
sidesteps this: a human logs in (passing Cloudflare) in a real Chrome, then the
automation **attaches to that same session** and continues.

```bash
npm run chrome      # 1. launches Chrome (debug port + dedicated profile)
                    #    -> log in to the portal, solve any Cloudflare check
npm run attended    # 2. attaches to that Chrome and continues (read-only scrape)
```

The dedicated profile (`.chrome-profile/`) persists your login + Cloudflare
cookies, so you often won't need to log in every time.

On any problem (not logged in, Cloudflare re-challenge, selectors broke) it fires
a **desktop popup** + optional webhook, and dumps evidence — it never closes your
browser.

## Run — standalone spike (Cloudflare-limited)

```bash
npm run spike          # honours HEADLESS in .env
npm run spike:headed   # force a visible browser window
```

Tries to log in fully headless. Useful for diagnostics, but Cloudflare will
usually challenge it — that's why attended mode exists.

## What it does

1. Opens the login page and logs in with **human-like typing** and random pauses.
2. Reuses the session across runs (stored in `.auth/`), like a real user.
3. Reads the current stock list (once `CARSCOZA_STOCK_URL` is set).
4. On **any** failure: saves a screenshot + full page HTML to `evidence/`, and
   fires an alert (console, or a webhook if `ALERT_WEBHOOK_URL` is set).

It does **not** create, edit, or delete anything — read-only by design.

## When something breaks

Open the latest files in `evidence/`. The `.png` shows the screen it choked on;
the `.html` lets us read the real selectors. All site-specific selectors live in
[`src/config/carscoza.ts`](src/config/carscoza.ts) — update them there.

## Next steps (not built yet)

- Wire inventory source (Supabase in `everest-motoring`) as the source of truth.
- Diff engine: create / update / delist by stock number.
- Dead-man's-switch + anomaly alerts (e.g. "0 listings seen" = probable break).
- Schedule (VPS/cron) once the spike confirms feasibility.
