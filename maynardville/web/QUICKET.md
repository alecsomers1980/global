# Quicket Integration

## Environment Variables

All values must be provisioned on a Maynardville‑owned Quicket account.

| Variable | Purpose |
|---|---|
| `QUICKET_API_KEY` | Quicket API key |
| `QUICKET_USER_TOKEN` | Quicket user token |
| `QUICKET_EVENT_ID` | Quicket event identifier |
| `CRON_SECRET` | Shared secret used by the Vercel cron job to call the sync endpoint |
| `QUICKET_WEBHOOK_SECRET` | Shared secret appended as `?token=` to the webhook URL |
| `APP_BASE_URL` | Production base URL of the application (e.g. `https://your-dashboard.vercel.app`) |

## Performances Sync

- A Vercel cron job (`vercel.json`) triggers `GET /api/quicket/sync` daily at 03:00 UTC.
- The endpoint is protected by the `CRON_SECRET` (passed as a Bearer token) **or** by an Admin staff session.
- The handler calls `syncPerformancesFromQuicket(eventId, season)`, which upserts performances from Quicket’s event schedules into your database.
- **Manual fields** (Capacity, Active, Performance Type) are **never** overwritten by the sync.
- Admins can also trigger a manual sync by visiting the endpoint while logged in.

## Webhook

1. In the Quicket dashboard navigate to **Event → Settings → Integrations → Webhooks**.
2. Add a webhook for the event **“Checkout completed”**.
3. Set the listening URL to:
   ```
   https://<APP_BASE_URL>/api/quicket/webhook?token=<QUICKET_WEBHOOK_SECRET>
   ```
4. Save the configuration.

When a purchase is completed Quicket sends a POST request to that endpoint. The handler:

- Validates the `token` query parameter against `QUICKET_WEBHOOK_SECRET`.
- Parses the JSON payload.
- Calls `recordWebhookSale(payload)`, which appends rows to the Quicket Sales table.
- **Always returns HTTP 200** to prevent retry storms, even on processing errors (errors are logged).

> **Note:** Quicket webhooks are not cryptographically signed; the shared `?token=` is the only guard. Ensure the secret is kept safe and the URL is transmitted over HTTPS.

## Known Limitations

- **Sold‑counts** can only be derived by accumulating webhook sales; the Quicket event object currently exposes only a `soldOut` boolean, not exact counts.
- Per‑performance matching uses the Quicket event ID and date. A full guest‑list reconciliation is a **Phase‑1 follow‑up** once Quicket confirms the guest‑list endpoint and its rate limits.