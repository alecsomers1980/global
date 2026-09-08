# Mountain Creek Lodge — Admin Area Professional Polish

## Problem

The admin area (`/admin`) mirrors the public site's boutique-lodge branding
(dark background, serif headings, terracotta accent, pill-shaped tabs), but
the result reads as improvised rather than professional: navigation is a
horizontal tab bar with no per-section page header, the Packages section is
~250 lines inlined directly in `app/admin/page.js` instead of being its own
component like the other four sections, and small styling details (button
colors/padding, card treatment) have drifted slightly between the five
sections since they were built independently.

Separately, on the public `/accommodation` page, the "Bedrooms" count shown
per room (`app/accommodation/page.js:301-305`) is not real data — it's
guessed as `Math.ceil(sleeps / 2)`. This can visibly disagree with the
room's own feature list (e.g. "5 Bedrooms" badge next to a "4 EN-SUITE
BEDROOMS" feature tag on the Main House).

## Scope

**In scope:**
- Admin shell: sidebar navigation, consistent per-section page header.
- Shared UI primitives (`PageHeader`, `Card`, `Button`, `FieldLabel`,
  `TextInput`) used consistently across all 5 admin sections and the
  login/forgot/reset screens.
- Extracting the Packages tab out of `app/admin/page.js` into its own
  `src/components/admin/PackagesManager.js`, matching the existing pattern
  of `AccommodationManager.js` / `GalleryManager.js` / `RedLitchiManager.js`
  / `AccountManager.js`.
- Restyling all 5 managers and the login/forgot/reset screens to use the
  shared primitives. No functional behavior changes anywhere — same fields,
  same CRUD flows, same upload/drag-reorder behavior.
- Adding a real, editable `bedrooms` field to Accommodation units (DB
  column + admin form + public accommodation page), replacing the guessed
  bedroom count.

**Out of scope:**
- Any visual/structural change to the public-facing site, except the one
  `bedrooms` data-accuracy fix on `/accommodation`.
- Any new admin functionality beyond the `bedrooms` field.
- Changing the overall brand direction (dark background, serif headings,
  terracotta accent stay — see "kept, tightened up" decision below).

## Design

### Style direction

Keep the existing boutique-lodge visual language (dark `#0f1117` background,
`#1a1d27` cards, terracotta `#C07750` accent, serif section headings). This
is a consistency/structure pass, not a rebrand — "professional" here means
uniform and deliberate, not neutral/corporate.

### Shell & navigation

Replace the horizontal pill-tab bar in `app/admin/page.js` with a fixed
left sidebar:
- Top: "Mountain Creek Lodge" wordmark + "Admin" label (reusing the current
  `LoginScreen` header's typography).
- Middle: vertical nav list, one item per section (Packages, Accommodation,
  Gallery, Red Litchi, Account), active item highlighted with the terracotta
  accent (same visual weight as today's active tab, just vertical).
  Persist the active section by URL query param (`/admin?tab=accommodation`)
  rather than component state only, so a reload or direct link keeps you on
  the right section.
- Bottom: Sign Out.

Main content area gets a consistent top bar above the active section's
content, rendered via the shared `PageHeader` primitive: section title on
the left, primary action button (e.g. "+ New Package") and "View Site ↗" on
the right. This replaces each section's own ad-hoc header row.

Login, Forgot Password, and Reset screens (`app/admin/page.js`'s
`LoginScreen`, `app/admin/forgot/page.js`, `app/admin/reset/page.js`) keep
their current centered-card layout (no sidebar pre-login) but restyle their
buttons/inputs with the same shared primitives as the dashboard, so they
read as the same product.

### Shared UI primitives

New folder: `src/components/admin/ui/`.

- **`PageHeader.js`** — `{ title, action, showViewSite }` → renders the
  section title (`text-white text-2xl font-serif`, matching the current
  "Admin Portal" heading weight) plus an optional primary action button and
  optional "View Site ↗" link, in the row layout every section currently
  reimplements individually.
- **`Card.js`** — wraps children in the existing
  `bg-[#1a1d27] rounded-xl border border-white/5 p-8` treatment (matches
  what's already used in `AccommodationManager`'s form/list wrappers).
- **`Button.js`** — `{ variant: "primary" | "secondary" | "danger", ...props }`.
  `primary` = filled terracotta (`bg-[#C07750] hover:bg-[#a8654a] text-white`),
  `secondary` = ghost text button (`text-white/40 hover:text-white/70`),
  `danger` = red ghost/filled depending on current usage
  (`text-red-400/60 hover:text-red-400` for inline row actions,
  `bg-red-500 hover:bg-red-600 text-white` for confirmation-modal delete —
  both variants already exist in the codebase today, just inconsistently
  named/applied; `Button` exposes both as `danger` and `dangerFilled`).
- **`FieldLabel.js`** — the `text-white/50 text-xs uppercase tracking-widest
  mb-2` label wrapper used on every form field today.
- **`TextInput.js`** — the `bg-[#0f1117] border border-white/10 text-white
  px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750]
  transition-colors` input treatment, as a thin wrapper so it can't drift
  per-file. Plain `<textarea>`/`<select>` keep their own JSX (different
  enough elements) but reuse the same class string via a shared constant
  exported from the same file.

These are extractions of patterns that already exist almost everywhere in
the codebase — not new visual concepts. The goal is a single source of
truth so the five sections can't quietly drift again.

### Packages extraction

Move `PackageForm` and the packages list/create/edit/delete logic
(currently `app/admin/page.js` lines ~149-427 and the `packages`-related
state/handlers in `AdminPage`) into `src/components/admin/PackagesManager.js`,
self-contained exactly like `AccommodationManager.js` (owns its own
`getPackages`/`addPackage`/`updatePackage`/`deletePackage` calls and
list/form/delete-modal view state). `app/admin/page.js` shrinks to: session
check, `LoginScreen`, sidebar, top bar, and rendering whichever of the 5
manager components matches the active tab — the same shape it already uses
for Accommodation/Gallery/Red Litchi/Account.

### Per-section restyling

Each manager (`AccommodationManager`, `GalleryManager`, `RedLitchiManager`,
`AccountManager`, new `PackagesManager`) swaps its list-header row for
`PageHeader`, its card wrappers for `Card`, its buttons for `Button`
variants, and its form labels/inputs for `FieldLabel`/`TextInput`. No field,
no data flow, no upload/drag-reorder/CRUD logic changes — this is a
find-and-replace of markup/classes for equivalent shared components.

### Bedrooms field

- Migration: add `bedrooms integer` to `accommodation_units`, backfilled for
  existing rows with `ceil(sleeps / 2.0)` (the same formula the site
  currently guesses with, so no visible change until an admin edits a room).
- `src/lib/accommodation.js`: add `bedrooms` to `fromRow`/`toRow`.
- `AccommodationManager.js`: new "Bedrooms" number input next to "Sleeps"
  in the room form (same `min="1" required` pattern as Sleeps).
- `app/accommodation/page.js`: replace the `Math.ceil(unit.sleeps / 2)` /
  "Studio" ternary (lines 301-305) with `unit.bedrooms` directly, keeping
  the "Studio" label only when `unit.bedrooms === 0` (a true studio has no
  separate bedroom).

### Testing

No automated test runner exists in this project (confirmed in the earlier
upload-fix work). Verification is manual, driving the running app:
1. Every one of the 5 admin sections: list view renders, create/edit form
   opens and saves, delete confirms and removes, matches the new shared
   visual style.
2. Login, Forgot Password, Reset Password screens still authenticate/reset
   correctly with the restyled buttons/inputs.
3. Sidebar navigation switches sections correctly and highlights the active
   one; reloading the page on a given tab keeps you there.
4. Accommodation form: new Bedrooms field saves and reloads correctly; the
   public `/accommodation` page shows the real bedroom count for at least
   one edited room and the backfilled guess for an unedited one.
5. No console errors on any of the above.
