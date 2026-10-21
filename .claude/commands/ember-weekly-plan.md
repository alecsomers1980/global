# /ember-weekly-plan — Monday "what to do next" for the Ember website and Ember OS

Alec's standing ask (2026-10-21): "send me every week what we should do next to improve the website or what is still needed for Ember OS to run our company as automated, efficient as possible."

Runs Mondays 08:30 from `scripts/weekly-ember-plan.ps1` (Task Scheduler `EmberWeeklyPlan`). `$ARGUMENTS` is this week's Monday (`YYYY-MM-DD`); if empty, use the Monday of the current week. Call it WEEK below.

Your output lands in three places:
- `scripts/logs/ember-weekly-plan-WEEK.json`, which the launcher posts to Ember OS (www.emb3r.co.za/admin/weekly).
- Your final message, which is emailed to Alec as-is.
- A run trace in the vault.

**This run is read-only.** Never edit code, commit, push, merge, deploy, or write to any database. The launcher makes the one write (posting the JSON).

## 1. Load last week

Read the newest `scripts/logs/ember-weekly-plan-*.json` older than WEEK, if there is one. Each of its items is checked in step 3: done, still open, or no longer relevant.

## 2. Gather the facts

Every item you report needs evidence from this step: a PR number, a file path on `origin/main`, a live check, or a memory/vault line. Memory is `C:\Users\info\.claude\projects\c--Users-info-OneDrive-Documents-Antigravity\memory\`; the vault is `C:\Users\info\OneDrive\Documents\Obsidian\Ember Automation\`.

**Repo** `alecsomers1980/ember-automations` (website and Ember OS live in the same app). Clone: `C:\tmp\ember-automations`.
- Run `git -C C:/tmp/ember-automations fetch -q`, then read from `origin/main` only (`git show origin/main:<path>`, `git ls-tree -r --name-only origin/main`). The checked-out branch is whatever the last session left there.
- Merged this past week: `git -C C:/tmp/ember-automations log --since=7.days --merges --oneline origin/main`.
- Open PRs, Dependabot included: `gh pr list --repo alecsomers1980/ember-automations --state open`.

**Website** (www.emb3r.co.za, the `(marketing)` route group):
- **Launch gate.** Check `SITE_GATED` in `src/lib/gate.ts`. While it is `true` the site is not public, so launch blockers rank first. Alec decided on 2026-10-21 that the gate stays on until the client portal is built: the copy promises a "client portal" (grep `portal` in `src/content/marketing.ts` and `src/components/marketing/`) and no portal route exists under `src/app/`. Once a portal route exists, "remove the gate" becomes the top item: set `SITE_GATED = false`, delete `src/app/coming-soon/` and the `/preview` handling in `src/middleware.ts`.
- **Live checks:** `curl -s -o /dev/null -w "%{http_code}"` on `https://www.emb3r.co.za/`, `/robots.txt`, `/sitemap.xml`. While gated, every marketing page returns 200 with the coming-soon page; that is expected.
- **Open decisions:** the ⚠ lines in memory `project_ember_marketing_site.md` and vault `business/ember-website/project-ember-website.md`.
- **The 20-category checklist** in memory `feedback_website_improvement_checklist.md`, applied to Ember's own site. Check each item against `origin/main` before calling it missing. Examples: JSON-LD (`src/lib/jsonld.ts`), `public/llms.txt`, a first-touch "where did you hear about us" question on the lead form (`src/lib/leads.ts`), DMARC (`nslookup -type=TXT _dmarc.emb3r.co.za`). Skip items that don't apply to Ember, and don't list them.

**Ember OS** (`/admin`, `/c`, `/mcp`, `/api/cron` in the same repo):
- **Notes:** memory `project_ember_os_spine.md`, `project_ember_revenue_picture.md`, `project_ember_invoicing.md`, `project_ember_cost_register.md`, `project_popia_security_check.md`. Look for "Not on Ember OS yet", missing env keys, test clients still `active`, and anything marked ⚠.
- **Live data, read-only:** Supabase REST GET using `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from `C:\Users\info\OneDrive\Documents\Antigravity\ember-automations\.env.local`. Never print the key.
  - `clients?select=slug,status`: compare against the monthly payers in memory.
  - `outbox?select=id&decision=eq.pending`: drafts waiting for Alec's approval.
  - `requests?select=id,status&status=in.(submitted,triaged,needs_info)`: requests not yet moving.
- **Capability map.** "Ember runs itself" means everything below exists. Before calling a row missing, check the repo for it (a route or lib file is the proof). When a row ships, update this table in the same session.

| Capability | Proof on origin/main |
|---|---|
| Client record, request pipeline, approval outbox | `src/lib/spine/`, `src/app/admin/queue/` |
| Claude connector (MCP) | `src/app/mcp/`, `src/lib/mcp/` |
| Monthly client reports with suggestions | `src/lib/reports/`, `src/app/api/cron/monthly-report/` |
| Quotes and estimates | `src/app/admin/quotes/`, `src/app/admin/estimates/` |
| Site reports and ideas for every client site (quotes part 3) | not built as of 2026-10-21 |
| Client portal (also the website's launch blocker) | not built as of 2026-10-21 |
| Paid/overdue status from Zoho invoicing | not built as of 2026-10-21 (`project_ember_invoicing.md`) |
| Health checks on every client site: uptime, SSL, Supabase keep-alive, backups | not built as of 2026-10-21 (client assets have a `status` column, nothing fills it) |
| Client email turned into requests | not built as of 2026-10-21 |
| Client WhatsApp turned into requests | not built as of 2026-10-21 |
| Every paying client on Ember OS | compare `clients` with the payers in memory |
| Signed POPIA/security document per client | `project_popia_security_check.md` |

## 3. Pick and rank

- Pick up to 5 website items and up to 5 Ember OS items. List fewer if fewer are real; never pad.
- Rank in this order:
  1. launch blockers
  2. anything losing money or enquiries right now (a broken form, a missing key, a cron that fails)
  3. whatever saves Alec the most hours a week
  4. everything else
- `next_step` is one concrete action someone can start today: a PR to merge, SQL to run, a decision to make, a build to start. "Improve SEO" is not a next step.
- `owner` is `alec` when the step needs his decision, money, a login, a merge, or a Vercel env change (Claude can't merge PRs or set Vercel env vars). It is `claude` when a Claude session can do the work.
- `why` states the evidence in one or two sentences. No evidence, no item.
- Last week's items:
  - Still open: keep the same title and its `first_seen`.
  - Done: leave it out of `items` and name it in the summary.
  - New items get `first_seen` = WEEK.
- Don't re-suggest what Alec has decided against. Check memory for "Alec chose", "Alec decided" and "Alec picked" lines, e.g. credits stay off the site, and the gate stays until the portal exists.
- Dependabot PRs: group them into one item ("merge the N dependency PRs"), not one item each.

## 4. Write the JSON

Write `scripts/logs/ember-weekly-plan-WEEK.json` as UTF-8:

```json
{
  "week_of": "WEEK",
  "summary": "2-3 short sentences: what moved last week, what matters most this week.",
  "items": [
    { "area": "website", "title": "…", "why": "…", "next_step": "…", "owner": "alec", "size": "S", "first_seen": "WEEK" }
  ]
}
```

`area` is `website` or `ember-os`. `size` is Ember's ruler: S = under half a day, M = a day or two, L = a week or more. Write plain English in short sentences, with no long dashes. `scripts/post-weekly-plan.mjs` rejects a file with a missing or wrong field.

## 5. Trace

Use the **write-run-logs** skill to write `logs/traces/ember-weekly-plan-WEEK.md` in the vault, with the counts from step 6.

## 6. Final message (this is the email)

Plain text; the email shows the raw log, so no markdown tables or headings:

```
Ember weekly plan, week of <day Mon year>

<summary>

WEBSITE
1. <title> (You or Claude, size S/M/L)
   Why: <why>
   Next: <next_step>

EMBER OS
1. …

Open in Ember OS: https://www.emb3r.co.za/admin/weekly
Receipt: <N> items (<W> website, <O> Ember OS), <C> carried from last week, <D> done since last week, <F> fact checks that failed.
```

## Gotchas

- **A run that hits the Claude usage limit writes nothing (2026-10-21).** The first run worked for 25 minutes, then printed only "You've hit your session limit · resets 1pm" and wrote no JSON. The launcher then fails the post step and emails the log with exit 1, which is the right outcome. To rerun after the reset: `schtasks /Run /TN EmberWeeklyPlan`, which files the plan under the same Monday. The Monday 08:30 slot shares the usage window with /learning-digest (daily 08:30) and /passive-income-digest (Mondays 09:00).
- **Vercel env names: run `vercel env ls production` from the monorepo folder `Antigravity/ember-automations`, not the C:/tmp clone (2026-10-21).** The clone isn't linked to the Vercel project and errors. The listing shows names and ages only, never values, so it settles "is the key set" claims in memory.
- **Memory ⚠ lines go stale between sessions (2026-10-21).** The first run found two that were already fixed (ANTHROPIC_API_KEY set in Vercel, test clients deleted). Check each ⚠ against the live source before it becomes an item, and count the ones that fail in the receipt.
