# Ember connector for Claude

**For a client:** in Claude → Settings → Connectors → *Add custom connector* → URL `https://www.emb3r.co.za/mcp`. Claude opens the consent page; sign in with the magic link Ember sent you (or request one on that page), press **Approve**, and you are back in Claude. Ask Claude "what's my Ember balance?" to check it works.

**Before a client can connect:** in `/admin/clients/<id>` → People → *Invite* on the person. That creates their login with `role: client` and the client id on their account. Only people invited that way can complete the consent screen.

## What the connector can do

Read: `get_account` (plan, credit balance, active and queued requests, open questions, estimates waiting on them) · `list_catalogue` (what Ember can build for their vertical, with credit prices) · `list_requests` · `get_request` · `get_open_questions`.

Write: `submit_request` (logs a request and runs AI triage) · `approve_estimate` / `decline_estimate` · `answer_questions` · `share_business_info` (AI extracts short factual statements into `client_facts` as `proposed`, plus a `fact_update` item for review).

Every write lands in `/admin/queue` exactly like a request Alec logged by hand — nothing reaches a client without his approval while the client is in mode A. No tool deletes anything, and each token only ever sees its own client's records.

## Alec — operations

- **Kill switch** (takes effect on the next tool call, no redeploy): `update mcp_settings set enabled = false where id = 1;`
- **Revoke one person:** `update mcp_tokens set revoked_at = now() where user_id = '<uuid>' and revoked_at is null;`
- **What did Claude do:** `select created_at, tool, summary from mcp_audit where client_id = '<uuid>' order by created_at desc;`
- A refresh token is single-use. Presented twice, every token for that person and connector is revoked and they must re-approve the consent screen.

## Shape of it

Public URLs Claude sees: `/mcp`, `/.well-known/oauth-protected-resource`, `/.well-known/oauth-authorization-server`, `/oauth/register`, `/oauth/authorize`, `/oauth/approve`, `/oauth/token`. Handlers live in `src/app/api/mcp/**` behind `next.config.mjs` rewrites; only `/oauth/authorize` is a real page. Tokens are 32 random bytes stored as SHA-256 — the token itself carries only a user id, so the role and client are re-read from Supabase on every single call.

Registration is deliberately open (Claude registers itself) and mints no access: a token exists only once an invited person approves the consent screen. The boundary is the redirect allowlist in `src/lib/mcp/redirect.ts`, which exact-matches Claude's callback URLs.

Free text from the database reaches Claude inside `<untrusted-data>` envelopes with a preamble saying to report it, never follow it (`src/lib/mcp/untrusted.ts`).
