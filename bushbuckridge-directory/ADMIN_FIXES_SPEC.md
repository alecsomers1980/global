# Admin Fixes — Build Spec (for DeepSeek)

Architect: Claude. Implementer: DeepSeek (`ds`). Stack: Next.js (App Router, server actions) + PocketBase.

**Tier vocabulary is `basic` / `pro-lead` / `pro-business`** everywhere (DB + payments + public pages). Do NOT introduce `standard/enhanced/premium`.

> ✅ **Part A (PocketBase schema/rules) is ALREADY DONE by Claude.** Do not script DB changes.
> Already applied: `events` gained `time, venue, cost, contact_info, description, is_featured` + rules opened to `""`; `subscriptions` got `deleteRule=""` and a new `suspended` status value; `businesses.deleteRule=""`. Verified that corrected create payloads succeed.

Implement only the app-code tasks below. Match existing file style (Tailwind class soup, `'use server'`, `requireAdmin()`, `revalidatePath`). Keep changes surgical.

---

## Task 1 — Fix Add Business (Issue 3)
Cause: UI sent `package_tier` = `standard` which PocketBase rejects.

- `src/app/admin/(protected)/businesses/BusinessCreateSheet.tsx`
  - Tier `<SelectItem>`s → values `basic` / `pro-lead` / `pro-business`, labels `Basic` / `Pro Lead` / `Pro Business`.
  - Initial form state `package_tier: 'basic'` (was `'standard'`).
- `src/app/admin/(protected)/businesses/actions.ts` → `createBusiness`: default `package_tier: data.package_tier || 'basic'`.
- `src/app/admin/(protected)/businesses/BusinessActionsMenu.tsx` → the "Package Tier" submenu array `['standard','enhanced','premium']` → `['basic','pro-lead','pro-business']`. Keep `capitalize` but render readable labels (replace `-` with space).

## Task 2 — Fix Add Event (Issue 5)
Cause: `slug` required but never sent (DB fields/rules now fixed in Part A).

- `src/app/admin/(protected)/events/actions.ts` → `createEvent`: generate a slug and include it. Add a small helper:
  ```ts
  function slugify(s: string) {
    return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  }
  ```
  In `createEvent`, build payload with `slug: slugify(data.title) + '-' + Math.random().toString(36).slice(2, 7)` to guarantee uniqueness. Leave `updateEvent`/`deleteEvent` as-is.
- No form changes needed — the new DB fields now persist the existing form values.

## Task 3 — Fix Revenue crash (Issue 4)
Cause: `format(new Date(p.paid_at || p.created), …)` throws on records where both are empty (`payments` has no `created` field).

- `src/app/admin/(protected)/revenue/page.tsx`
  - In the transactions list (around line 176): only format when a usable date exists, else render `'—'`:
    ```tsx
    {(p.paid_at || p.created) ? format(new Date(p.paid_at || p.created), 'dd MMM yyyy, HH:mm') : '—'}
    ```
  - In the `thisMonthPayments` / `lastMonthPayments` filters: guard against invalid dates — skip a payment when `!(p.paid_at || p.created)` or when `isNaN(d.getTime())`, so the reduce never sees Invalid Date.

## Task 4 — Subscriptions CRUD (Issue 1)
Currently read-only. Mirror the businesses pattern.

- NEW `src/app/admin/(protected)/subscriptions/actions.ts` (`'use server'`):
  - `updateSubscriptionStatus(id, status)` — status one of `active|suspended|cancelled|expired|pending`.
  - `updateSubscription(id, data)` — editable: `tier` (`basic|pro-lead|pro-business`), `status`, `expires_at` (date string or ''), `amount_cents` (number).
  - `deleteSubscription(id)`.
  - All: `await requireAdmin()`, `createClient()`, wrap in try/catch that rethrows `e.message`, `revalidatePath('/admin/subscriptions')`. Copy shape from `businesses/actions.ts`.
- NEW `src/app/admin/(protected)/subscriptions/SubscriptionActionsMenu.tsx` (client) — dropdown like `BusinessActionsMenu.tsx`:
  - Suspend (sets `suspended`) / Activate (sets `active`) toggle based on current status.
  - Edit (opens the edit sheet/dialog).
  - Delete (with `confirm()`).
  - Use `sonner` toast + a local `isLoading` like `BusinessActionsMenu`.
- NEW `src/app/admin/(protected)/subscriptions/SubscriptionEditSheet.tsx` (client) — fields: tier (Select), status (Select), expires_at (date input), amount_cents (number, show in Rands ÷100 for display but store cents). On save call `updateSubscription`.
- EDIT `src/app/admin/(protected)/subscriptions/page.tsx`:
  - Add an "Actions" column (right-aligned) rendering `<SubscriptionActionsMenu subscription={sub} />`. Update the empty-state `colSpan` from 5 → 6.

## Task 5 — Centered 80%-width modals (Issue 2)
All four add/edit forms use `Sheet` (right slide-out). Convert to a centered dialog at 80vw.

- NEW `src/components/ui/dialog.tsx` — shadcn-style Dialog built on the existing umbrella import (NO new dependency):
  ```tsx
  "use client"
  import * as React from "react"
  import { XIcon } from "lucide-react"
  import { Dialog as DialogPrimitive } from "radix-ui"
  import { cn } from "@/lib/utils"
  ```
  Export `Dialog, DialogTrigger, DialogPortal, DialogClose, DialogOverlay, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription`. Mirror the structure of `src/components/ui/sheet.tsx` but `DialogContent` must be **centered** and **80vw**:
  - Overlay: fixed inset-0 bg-black/50 with fade animations.
  - Content className base: `fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[80vw] max-h-[85vh] overflow-y-auto rounded-2xl bg-background p-6 shadow-lg` + zoom/fade animations + a top-right close button (`XIcon`).
- Convert these four from `Sheet*` → `Dialog*` (rename imports + components; move the `SheetHeader/Title/Description` to `DialogHeader/Title/Description`; keep all form fields and logic identical):
  - `src/app/admin/(protected)/businesses/BusinessCreateSheet.tsx`
  - `src/app/admin/(protected)/events/EventEditSheet.tsx`
  - `src/app/admin/(protected)/jobs/JobEditSheet.tsx`
  - `src/app/admin/(protected)/opportunities/OpportunityEditSheet.tsx`
  - For the inner two-column grids, consider `md:grid-cols-2` so 80vw looks good on desktop. Don't otherwise restyle.

---

## Acceptance checks
1. Add Business with each tier → saves, appears in list with correct tier badge.
2. Add Event with venue/cost/time/featured → saves; values show in the events table and edit sheet.
3. Revenue page loads without server error; transactions with no date show `—`.
4. Subscriptions: suspend/activate, edit (tier/status/expiry/amount), delete all work and persist.
5. All four add/edit modals open centered at ~80% screen width, scrollable.

Run `npm run build` (or `next build`) and fix any type errors before finishing.
