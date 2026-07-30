# South Canon — Theatrical Redesign

Date: 2026-07-30
Branch/worktree: `feat/south-canon-redesign` (new worktree off `feat/south-canon`)
Status: Approved, not yet implemented

## Problem

South Canon currently ships two visual identities.

The public site (`app/page.tsx`, `/plays`, `/plays/[slug]`, `/playwrights`, `/about`, `/contact`)
uses the original M1 editorial system: `ink #14110F` / `paper #FAF7F2` / `accent #A6431C`, Fraunces
+ Inter, plain Tailwind, and no motion of any kind. The `/coming-soon` holding page, added
2026-07-30, introduced a second and considerably stronger system: `onyx #121212` / `ivory #F5F5F0`
/ `canon-red #D45F59`, Bodoni Moda, and staggered CSS reveals. The brand logo assets in
`public/brand/` are named to the second system (`-ivory`, `-onyx`, `-canonred`), which confirms
which one is now the real brand.

The whole public site sits behind the `/coming-soon` gate (`middleware.ts`, `lib/gate.ts`), so
today only the newer identity is visible. The moment the gate lifts, visitors pass from a
confident dark theatrical title card into a light editorial site that looks like a different
company.

Separately, the site has no theatrical character at all beyond the holding page, and the client
has asked for a premium, modern, theatrical feel with the specific reference of
[nieteatr.pl](https://www.nieteatr.pl/) — a Polish theatre whose homepage holds a full-screen dark
title card on arrival and opens it like a curtain on first scroll.

## Relationship to the 2026-07-28 visual refresh spec

The previous spec (`2026-07-28-south-canon-visual-refresh-design.md`, implemented) concluded that
"the gap is imagery and content volume, not typography or palette", and added photography-driven
modules on the assumption that photography would carry the premium feel.

**This spec reverses that conclusion**, for a reason that emerged afterwards: every image on the
site is hotlinked Pexels stock (`scripts/seed-visual-refresh-content.js` — all `hero_image_url`
and `play_media` values are `images.pexels.com` URLs). Generic stock photography survives on a
light editorial page but reads as cheap on a dark cinematic one. The photography modules that spec
built are retained, but they are demoted from load-bearing to atmospheric.

The typography-and-palette question that spec deferred is now the central subject.

## Approach

Two metaphors, cleanly divided by surface, never mixed:

- **The House** (onyx) — the auditorium with the lights down. Carries theatrical moments:
  entrance, homepage, play and playwright heroes, footer.
- **The Script** (ivory) — the lit stage and the manuscript page. Carries everything a visitor
  must actually read or scan: synopsis, characters, rights tables, pricing, all forms, all admin.

A third concept considered and rejected: "The Marquee" (poster-led, enormous display type, high
contrast). Rejected as trend-dependent and tonally at odds with the "properly represented, writers
get paid" positioning.

On motion, the brief cites two references pulling in opposite directions: nieteatr.pl is
choreographed scroll spectacle, while Emil Kowalski's work (Sonner, Vaul) is restrained,
interaction-led spring physics that never hijacks the user. The resolution is spectacle at the
door and precision inside — one theatrical overture on arrival, Kowalski-grade restraint
everywhere after it.

## Decisions locked

| Question | Decision |
|---|---|
| Scope | Whole public site **and** admin |
| Palette reach | Dark house, lit stage — onyx for theatrical surfaces, ivory for reading/data surfaces |
| Imagery | Type is the hero; photography is optional atmosphere, never load-bearing |
| Curtain | Overture once per session, homepage only, never on deep links |
| Motion stack | CSS-first, no new runtime dependencies |

## 1. Design foundations

### Colour

The coming-soon tokens become the whole system. The `ink` / `paper` / `accent` / `muted` / `rule`
tokens are retired from `globals.css` once no component references them.

| Token | Value | Role |
|---|---|---|
| `onyx` | `#121212` | the house, lights down |
| `onyx-deep` | `#0B0A0A` | overture card, blackout |
| `onyx-lift` | `#1A1918` | raised panels on dark — slightly warm so it reads as material, not grey |
| `ivory` | `#F5F5F0` | the lit stage / script page |
| `ivory-shade` | `#EAE7DF` | rules and insets on ivory |
| `canon-red` | `#D45F59` | accent |
| `canon-red-deep` | `#A6431C` | hover/pressed — the retired `accent` value, reused |

Availability badge colours need dark-surface variants; the existing `#2F6B4F` (available) and
`#B07A15` (restricted) fall below usable contrast on onyx.

| Status | On ivory | On onyx |
|---|---|---|
| available | `#2F6B4F` | `#5FA37E` |
| restricted | `#B07A15` | `#D9A441` |
| unavailable | `#6B635C` | `#8B837C` |

All foreground/background pairs must meet WCAG AA (4.5:1 for body text, 3:1 for large text and UI
borders). This is a hard requirement, not a preference — the audience includes schools and
publicly funded theatre companies with accessibility obligations.

Ratios computed for the pairs this system actually uses, so implementation does not have to
re-derive them:

| Pair | Ratio | Verdict |
|---|---|---|
| `canon-red` on `onyx` | 4.98:1 | AA body text |
| `available` on `ivory` | 5.68:1 | AA body text |
| `available-on-dark` on `onyx` | 6.27:1 | AA body text |
| `restricted-on-dark` on `onyx` | 8.33:1 | AA body text |
| `unavailable-on-dark` on `onyx` | 5.03:1 | AA body text |

`canon-red` at 4.98:1 passes but has little headroom. It is therefore never used for long-form
body copy on onyx — only for the 0.65rem letterspaced labels, rules, and hover states it already
serves on the holding page.

### Typography

Two families, no third, no mono.

- **Display — Bodoni Moda**, weights 400/500, normal and italic. Fraunces is removed from
  `app/layout.tsx`; carrying both display serifs is the root cause of the two-identities problem.
  Italic is the theatrical voice, used for the second line of a statement — the idiom already
  established on the holding page ("Theatre from the south. / *Licensed worldwide.*").
- **UI and body — Inter**, unchanged.
- **The signature texture** — Inter 500, `0.65rem`, uppercase, `tracking-[0.3em]`–`[0.4em]`. Already
  the holding page's fingerprint. It now does all small-scale work: section labels, nav, table
  headers, badges, breadcrumbs, at-a-glance strips.

Bodoni's hairline serifs disappear below roughly 20px on dark backgrounds. It is therefore used
only at `1.25rem` and above, and never for UI labels or table content.

Fluid scale:

| Role | Size |
|---|---|
| Overture title | `clamp(2.5rem, 9vw, 7rem)` |
| h1 | `clamp(2.25rem, 6vw, 4.5rem)` |
| h2 | `clamp(1.75rem, 3.5vw, 2.75rem)` |
| h3 | `clamp(1.25rem, 2vw, 1.5rem)` |
| Body | `1.0625rem` / 1.7 |
| Long-form prose | `1.125rem` / 1.75, capped at `62ch` |

### Geometry

`border-radius: 0` everywhere, with no exceptions including form inputs and admin controls. Sharp
corners read as printed programme rather than SaaS dashboard, and it is the cheapest available
unifier across public site and admin.

The 1px canon-red hairline from the holding page becomes a shared `<Rule />` component and recurs
as the site's punctuation.

### The surface law

The single rule that keeps the system coherent:

- **Onyx** for theatrical moments — entrance, homepage scenes, play hero, playwright hero, footer.
- **Ivory** the moment a visitor must read more than ~40 words or scan structured data — synopsis,
  characters, production history, rights tables, pricing, catalogue results, every form, all admin.
- The boundary between them is **always a hard edge, never a gradient**. That edge is the stage lip.

One deliberate inversion is permitted: an `onyx-lift` inset panel inside an ivory region, used
only for licensing and rights on the play page, so the commercial content reads as the business
end.

### Duotone treatment

"Duotone" is used throughout this spec to mean one specific, reusable treatment, so it is not
reinterpreted per component: the image is desaturated to greyscale, tinted between `onyx` in the
shadows and `canon-red` in the highlights, and rendered at 55% opacity over its surface with a
subtle grain overlay. On hover (cue 4, Spotlight) it resolves toward full colour and full opacity.
Implemented with CSS `filter` plus a blend-mode overlay — no image processing, no new dependency.

This is what allows stock photography to function as texture rather than as a photograph.

## 2. Motion system

Five named cues, defined once in `app/motion.css`, so the vocabulary is fixed rather than
reinvented per component.

1. **Overture** — the once-per-session title card. Full-viewport `onyx-deep`, logo and one line.
   The first scroll, click, or keypress splits it horizontally at the centre; the halves travel to
   the top and bottom viewport edges while the homepage rises and fades in beneath. ~900ms, spring
   easing via `linear()`.
2. **House lights** — content blocks fade and rise 16px, staggered 60ms, on entering view. Pure CSS
   `animation-timeline: view()`. Generalises the existing `.reveal` idiom from
   `app/coming-soon/coming-soon.module.css`.
3. **Curtain wipe** — route transitions via the View Transitions API. A canon-red hairline sweeps,
   onyx wipes, the new page settles. ~350ms.
4. **Spotlight** — play-row hover. 2px lift, duotone image resolves toward full colour, the
   canon-red rule extends from 24px to full width. Spring, 220ms.
5. **Blackout** — homepage scene changes, where an ivory panel slides up over onyx on scroll.
   Scroll-driven, no JavaScript.

### Constraints

- Only `transform`, `opacity` and `filter` are animated. Nothing that triggers layout or paint.
- The overture is an overlay above server-rendered content and must not delay LCP.
- Scroll-driven animation is progressively enhanced behind
  `@supports (animation-timeline: scroll())`. Support is currently Chrome/Edge 115+, Firefox 132+,
  Safari 18+ (~84% global); unsupported browsers get the static end state, never a broken one.
- `prefers-reduced-motion: reduce` reduces cue 1 to instant, cues 2/3/5 to opacity-only or nothing,
  and cue 4 to a colour change. The site must be fully usable and still handsome with motion off.

### Overture behaviour

- Homepage (`/`) only. Never on `/plays`, `/plays/[slug]`, or any deep link from search.
- Gated on `sessionStorage`; a returning visitor within the session goes straight to content.
- Dismissible by scroll, click, keypress, or a visible skip control.
- While `SITE_GATED` is true the same component renders as `/coming-soon`; after launch it becomes
  the homepage overlay. One component, two lifetimes, no throwaway work.

## 3. Page designs

### Entrance (`/coming-soon`, later the homepage overture)

Today `/coming-soon` is a single non-scrolling screen, so the curtain gesture has nothing to
reveal. It gains a second beat: scrolling lifts the card to a short below-fold section covering
what South Canon is, the Slabolepszy signing as proof of substance, and contact. This makes the
gesture meaningful before launch and makes the component reusable after it.

Existing content — the Jaco contact block and WhatsApp CTA — is preserved.

### Homepage (`app/page.tsx`)

Five scenes:

1. **Onyx hero.** Eyebrow label, Bodoni statement with italic second line, canon-red rule, two
   CTAs ("Browse the catalogue", "For writers"). No hero image; a duotone still sits behind at low
   opacity with a grain overlay. This replaces the current split text/image grid.
2. **Blackout into ivory — the repertoire board.** Featured plays as board *rows*, not cards:
   title large in Bodoni, playwright, genre, duration, availability badge on one line, canon-red
   hairline between rows. Spotlight hover extends the rule.
3. **Onyx — the promise.** Three columns: transparent rights, indicative pricing before you
   enquire, writers paid in full and on time. This is the entire strategic differentiator against
   the incumbent and it currently appears nowhere on the homepage.
4. **Ivory — the writers.** Playwright portrait row, Slabolepszy first, honours in the letterspaced
   idiom.
5. **Onyx footer.**

### Catalogue (`/plays`)

A working surface, so ivory-dominant: a thin onyx header band with title and result count, ivory
from the filters down.

- `CatalogueFilters` becomes a sticky filter bar on desktop and a bottom sheet on mobile. This
  closes the first of the two mobile requirements from the original spec §6 that were never built.
- Results reuse the same board-row component as the homepage — `components/catalogue/PlayRow.tsx`,
  which replaces `components/catalogue/PlayCard.tsx` on the catalogue, the homepage, and playwright
  detail pages. It scans materially better than cards once the catalogue passes ~40 titles, and
  reuse keeps the three surfaces consistent. The poster image added by the 2026-07-28 spec is
  retained but treated as duotone atmosphere.

Two punch-list items are fixed here because they are design failures as much as code defects:

- The territory filter dropdown is fully wired in the UI but `listPlays` never reads it, so it
  silently returns unfiltered results. A control that lies is worse than no control.
- Search matches only title, logline and synopsis, not playwright name, despite the UI copy
  promising "Search by title, genre or playwright."

### Play detail (`/plays/[slug]`)

The richest page and the one needing this most — currently twelve sibling sections stacked with
`space-y-16` and no hierarchy.

- **Onyx hero:** title at display size, playwright credits, logline in italic, at-a-glance strip
  (year written, acts, duration, cast size, genre) in the letterspaced idiom, availability badge.
- **Ivory programme column**, prose capped at 62ch.
  - **Characters** set as a real cast page — role name, gender, age range, one line — in two
    columns, using the existing `CastRole` fields, not a flat list.
  - **Press quotes** in large Bodoni italic with a canon-red rule and the source in the label
    idiom. These are the strongest credibility on the site and are currently unstyled text.
  - **Production history** as a timeline with `isPremiere` marked.
  - **Media gallery** as duotone thumbnails resolving to colour on hover.
- **Licensing and rights** in an `onyx-lift` inset panel within the ivory column — `LicenceTier`
  fees and royalty percentages, and the `RightsRow` territory table.
- **Sticky enquire CTA bar on mobile.** This closes the second spec §6 mobile requirement.

### Playwright detail (`/playwrights/[slug]`)

Onyx hero with duotone portrait, name in Bodoni, honours and represented-since in the label idiom;
ivory bio; their plays as board rows.

### About / For writers (`/about`)

This page does recruitment work — it is what a writer reads before signing. Dark, statement-led,
making the administrative contrast with the incumbent explicit without naming them, closing on a
contact CTA.

### Contact (`/contact`)

Ivory form panel on onyx. Honeypot plus timing anti-bot, matching the project standard; no CAPTCHA.

### Legal (`/privacy`, `/terms`)

Both currently 404 from every footer link. This work builds the page shells and typographic
treatment only. **Copy must be supplied by the client — no placeholder or fabricated legal text.**

Until real copy arrives, each route renders a real page stating that the policy is being finalised
and giving the licensing contact details, rather than a 404 or invented legal text. A fabricated
privacy policy is worse than an absent one: it is a POPIA representation the client never made.

### Admin

Ivory-dominant with onyx chrome (sidebar and topbar). Same tokens and type system so it is visibly
the same company, but motion is limited to focus and hover states — animation in a data-entry form
is a cost, not a feature.

Covers `app/admin/login`, `/admin/plays`, `/admin/plays/[id]`, `/admin/playwrights`,
`/admin/playwrights/[id]`, `/admin/reset`, and the `PlayForm`, `PlaywrightForm`, `RepeaterField`
and `DeleteButton` components. Admin sign-out, currently missing entirely, is added.

## 4. Technical approach

- **Worktree** `feat/south-canon-redesign` off `feat/south-canon`, matching the M1 pattern.
- **No new runtime dependencies.** The project currently ships only Next, React and Supabase, and
  that discipline holds. Motion is CSS-first: scroll-driven animations, `linear()` spring easing,
  `@starting-style`, and the View Transitions API. The one exception is a small hand-rolled Web
  Animations API helper (~40 lines) for the overture lift and card spring, in place of a library.
- **Tokens** land in the `@theme` block of `app/globals.css`. Motion cues live in `app/motion.css`.
- **Fonts:** `app/layout.tsx` drops Fraunces, adds Bodoni Moda as `--font-display`, keeps Inter.
  `app/coming-soon/page.tsx` currently loads Bodoni locally; it moves to the shared layout font.
- **Server components stay server components.** Only the overture and the mobile filter sheet
  become client components; the catalogue and play pages must keep rendering on the server.

### Verification

- `npm run build` and `npm run lint` clean.
- Playwright e2e: overture shows on first homepage visit and not on the second within a session;
  overture absent on deep links; reduced-motion path renders content immediately; territory filter
  actually filters; playwright-name search returns results; mobile filter sheet opens and applies;
  mobile sticky enquire bar appears on play pages.
- Contrast audit of every foreground/background pair against WCAG AA.
- Manual pass at 375px, 768px and 1440px on both light and dark surfaces.

## Sequencing

This is a large surface — whole public site plus admin — but it is a restyle against a settled
data model, not new product surface, so it stays one spec. It implements in four phases, each of
which leaves the site in a working state:

1. **Foundations.** Tokens, fonts, `<Rule />`, `motion.css`, the five cues, `PlayRow`. Nothing
   user-visible ships broken because old components keep working against retained tokens.
2. **Entrance and homepage.** Overture component (serving both `/coming-soon` and `/`), the five
   homepage scenes. This is the part the client will judge the work on, so it lands early enough to
   get a reaction before the long tail is built.
3. **Catalogue, play, playwright.** Including the two lying-control fixes and both mobile §6 gaps.
4. **About, contact, legal shells, admin.** Retire the `ink`/`paper`/`accent` tokens once the last
   consumer is gone.

## Out of scope

Flagged deliberately rather than silently absorbed:

- **The RLS-versus-service-role security question** from the M1 punch list. Migration 0007's
  policies are dead code because all admin reads and writes use the service-role client. This is a
  real decision that needs making, but it is not a design decision.
- **Transactional writes** across the 6+ tables the play form touches (would need a Postgres RPC).
- **The rights-holder/writer portal**, which remains the project's actual moat and must not drift
  into "phase 2" — it needs its own spec.
- **Real production photography.** The design is built so this improves the site when it arrives
  rather than being required for it to look finished.
- **Any push or deploy decision.** Nothing here touches a remote.
