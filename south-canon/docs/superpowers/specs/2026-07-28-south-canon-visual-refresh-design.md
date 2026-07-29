# South Canon — Visual Refresh & Example Catalogue Content

Date: 2026-07-28
Branch/worktree: `feat/south-canon-m1` (continues directly on the M1 build, no new worktree)
Status: Implemented 2026-07-28

## Problem

M1 shipped the full public catalogue, admin CRUD, and rights/licensing logic, but the site
currently reads as visually bleak: `hero_image_url` is null on the only seeded play, no play has
any `play_media` rows, and every component that supports imagery (`PlayHero`, `MediaGallery`,
`PlaywrightCard`) renders blank because nothing has ever populated them. The catalogue also only
has one play, so there's nothing to browse.

Reference sites reviewed: theatricalrights.com (the closest functional analog — an actual
licensing catalogue, not a venue), theatre-128.webflow.io, and the ThemeForest "Theatre WP" theme.
All three lean entirely on photography-driven modules (hero key art, poster grids, cast/author
headshot cards) to carry the "arty premium" feel. South Canon's existing ink/paper/Fraunces
editorial identity (locked into the original M1 design spec) is sound and matches the
brief's "editorial, literary" tone — the gap is imagery and content volume, not typography or
palette.

## Scope

1. Add photography to the components that already support it but have never had data.
2. Give the catalogue list (`PlayCard`) and the playwright index real visual presence.
3. Grow the catalogue from 1 play to 7, using Paul Slabolepszy's real additional titles.
4. Establish content-honesty rules for placeholder/demo data so nothing on the site
   misrepresents a real signed writer's actual work.

Out of scope: admin CRUD, auth, data model changes, the M1 deferred punch list (RLS,
territory filter wiring, mobile treatment, transactional writes, admin test coverage — all
still tracked separately), and any push/deploy decision.

## Component changes

### Homepage hero (`app/page.tsx`)
Currently a text-only `Container` block. Change to a split layout — text left, one play's
`heroImageUrl` right — reusing the exact grid pattern already built in `components/play/PlayHero.tsx`
(`grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center`), rather than inventing a new hero
component. The flagship play shown is *Saturday Night at the Palace* (the one real production
history South Canon actually has a story to tell about).

### `PlayCard` (`components/catalogue/PlayCard.tsx`)
Used on `/plays`, the homepage "From the catalogue" section, and playwright detail pages. Add a
poster-style image to the left of the existing row: `aspect-[3/4]`, `object-cover`, roughly
180–220px wide, rendered only when `play.heroImageUrl` exists (existing plays without one keep
today's text-only row — no broken-image states). `PlaySummary.heroImageUrl` already exists on the
type; this is a presentational change only, `lib/plays.ts`'s query already selects `hero_image_url`.
Stays a list, not a grid — `CatalogueFilters` and the surrounding page structure are untouched.

### `/playwrights` index (`app/playwrights/page.tsx`)
Currently a bare `<ul>` of names and countries — no imagery, despite `Playwright.portraitUrl`
already existing on the type and `PlaywrightCard.tsx` already knowing how to render a portrait
(it's only ever used on the play-detail credits list today). Replace the plain list with the
existing `PlaywrightCard` component per playwright, giving the index the same portrait treatment
TRW's "Author Spotlight" and Theatre-128's "Faces Behind the Characters" modules use. No new
component; reuses what M1 already built.

### PlayHero, MediaGallery, PlaywrightCard (detail), Play Media
No code changes — these already render correctly. They're blank purely for lack of data.

## Content plan — 6 additional real Slabolepszy titles

Sourced from Wikipedia and ESAT (Encyclopedia of South African Theatre), not invented:

| Title | Year | Verified fact used |
|---|---|---|
| Over the Hill | 1985 | DALRO Best Play award |
| Smallholding | 1989 | Vita Best Play award |
| Mooi Street Moves | 1992 | Amstel Playwright of the Year Award |
| The Return of Elvis du Pisanie | 1992 | Swept Vita, Fleur du Cap & DALRO Best Play |
| Pale Natives | 1993 | — |
| Heel Against the Head | 1995 | Vita & Star Tonight Best Comedy |

Combined with the existing *Saturday Night at the Palace* (1982), this brings the catalogue to 7
titles, matching the original brief's "launch with 7–8 titles" decision.

### Content-honesty rules (binding for this work)

- **Titles, years, and awards are real and sourced** — verifiable via Wikipedia/ESAT.
- **Loglines and synopses will be genre/theme-accurate but not plot-specific.** E.g. *Over the
  Hill* is publicly documented as being about rugby-club reunion culture — a logline can say
  that. It will not invent scenes, twists, or dialogue, since South Canon doesn't have licensed
  synopsis text for these plays yet.
- **No fabricated cast lists, press quotes, or production history.** Inventing character names or
  reviewer quotes for a real writer's real copyrighted work misrepresents it, which is a
  different and worse problem than generic placeholder copy. `Characters`, `PressQuotes`, and
  `ProductionHistory` already render `null` on an empty array (confirmed in code), so these
  sections simply won't appear for the 6 new plays rather than showing invented content.
- **One `rights_availability` row per new play** (South Africa: available) so the catalogue
  doesn't show 6 "unavailable" badges — reasonable for demo/example entries that aren't real live
  licensing offers, since this build isn't deployed or public.
- **Paul Slabolepszy's `portraitUrl` stays unset.** He's a real, named, signed client — standing
  in a stock photo of an unrelated person as "his" portrait would misrepresent him specifically.
  This is different from generic mood photography on a play page, which doesn't claim to depict
  a specific real person.

## Imagery & video sourcing

- **Stock photography** (Pexels/Unsplash), not AI-generated — decided after finding no
  image-generation API is configured for South Canon (the only available key, `KIE_API_KEY`,
  belongs to the unrelated everest-motoring project and won't be reused here without separate
  sign-off). Free stock photography is also the exact technique the Theatre-128 reference site
  itself uses for its own demo imagery.
- **Not captioned as documentary production photography.** `PlayHero`'s current alt text
  (`Production photograph from ${play.title}`) implies the image is an actual photo from a real
  staging. For stock imagery standing in as placeholder key art, captions/alt text will be
  generic (e.g. descriptive of the image, not asserting it depicts a specific real production) —
  this is a copy-level fix alongside the content work, not a structural component change.
- **One embedded video**, on one play's `MediaGallery`, to prove the video module. Will be a
  real, freely-embeddable YouTube video, identified and verified during implementation (not
  guessed at spec time) — honestly related to the play it's attached to rather than a generic
  stand-in presented as if authentic.

## Data flow

All content changes are seed data via the existing admin write path or a one-off script against
the Supabase pooler connection (same pattern used for M1's migrations) — no schema changes, since
every field involved (`hero_image_url`, `play_media`, `rights_availability`, `portrait_url`) already
exists from M1's migrations.

## Testing / verification

- Visual check in the dev server for each changed page (`/`, `/plays`, `/playwrights`,
  `/playwrights/[slug]`, `/plays/[slug]`) — confirm images render, no broken-image states for the
  one play that may still lack imagery, no layout breakage on mobile widths.
- `next build` must still pass (this is what caught the real Suspense bug in M1 — static
  generation issues don't show up in dev mode).
- No new automated tests required — this is a content/presentation pass, not new application
  logic. Existing Playwright e2e suite must still pass unmodified.
