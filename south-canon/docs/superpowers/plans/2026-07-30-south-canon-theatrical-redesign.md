# South Canon Theatrical Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the site's two competing visual identities with one theatrical design system — dark "house" surfaces for theatrical moments, ivory "script" surfaces for reading and data — across the whole public site and admin, with a once-per-session curtain overture on arrival.

**Architecture:** A restyle against a settled data model. Tokens and motion cues are defined once in `app/globals.css` and `app/motion.css`, then consumed by components. Motion is CSS-first (scroll-driven animations, View Transitions, `linear()` spring easing) with one ~40-line Web Animations API helper for the overture. Only two new client components exist (the overture and the mobile filter sheet); every catalogue and play page stays a server component. Two data-layer bugs whose symptom is a UI control that lies are fixed as part of the catalogue work.

**Tech Stack:** Next.js 16.2.12 / React 19.2.4 / Tailwind v4 (`@theme` block, not a config file) / TypeScript / Supabase / Vitest (unit) / Playwright (e2e). **No new runtime dependencies.**

**Spec:** `docs/superpowers/specs/2026-07-30-south-canon-theatrical-redesign-design.md`

**Worktree:** before Task 1, create the isolated workspace via the `superpowers:using-git-worktrees` skill — branch `feat/south-canon-redesign` off `feat/south-canon`. All work happens there.

**Already verified against the codebase, so no task needs to re-check it:**
- `tests/e2e/global-setup.ts` visits `/preview` and `playwright.config.ts` applies the resulting `storageState` to every project. The `SITE_GATED` flag in `lib/gate.ts` is `true`, but **the e2e suite is already unlocked** — no test in this plan needs to touch the gate, and `SITE_GATED` must stay `true` (flipping it is the client's launch switch, not ours).
- `app/admin/layout.tsx` exists — the admin chrome and sign-out control belong there.
- `lib/supabase/server.ts` exports `createServerClient` (anon, `persistSession: false`) and `createServiceClient` (service role). **Neither is cookie-aware**, so neither can sign a user out. The cookie-aware pattern is the one inside `requireAdmin()` in `lib/supabase/admin.ts`, which imports `createServerClient` from `@supabase/ssr` — note the name collides with the local export, so import it aliased.

## Global Constraints

- **No new runtime dependencies.** `package.json` dependencies stay exactly: `@supabase/ssr`, `@supabase/supabase-js`, `next`, `react`, `react-dom`. No animation library, no icon library, no utility library.
- **`border-radius: 0` everywhere, no exceptions** — including form inputs, buttons, badges and all admin controls. `AvailabilityBadge` currently uses `rounded-full`; that is removed in Task 1.
- **Two font families only:** Bodoni Moda (display) and Inter (UI/body). Fraunces is deleted. No mono font.
- **Bodoni Moda is never used below `1.25rem`** and never for UI labels or table content — its hairline serifs disappear on dark backgrounds.
- **Only `transform`, `opacity` and `filter` are animated.** Never `width`, `height`, `top`, `left`, `margin` or `box-shadow`.
- **Every animation must have a `prefers-reduced-motion: reduce` branch.** The site must be fully usable and visually complete with motion disabled.
- **Scroll-driven animation is progressively enhanced** behind `@supports (animation-timeline: scroll())`. Unsupported browsers get the static end state, never a broken one.
- **Server components stay server components.** Only `components/ui/Overture.tsx` and `components/catalogue/FilterSheet.tsx` gain `'use client'`. Do not add it to any page under `app/plays/`, `app/playwrights/`, or `app/page.tsx`.
- **No fabricated legal copy.** `/privacy` and `/terms` render a real "being finalised" page with contact details. Never invent policy text.
- **Stock photography is never described as documentary.** Existing alt text ("Illustrative artwork for X") is the required pattern — do not change it to imply a real production photograph.
- **Colour pairs are fixed by the spec's contrast table.** Do not substitute colours. `canon-red` (4.98:1 on onyx) is never used for long-form body copy on dark — only 0.65rem letterspaced labels, rules and hover states.
- **The existing test suites must pass unmodified** unless a task explicitly says otherwise: `tests/unit/*.test.ts` (6 files) and `tests/e2e/*.spec.ts` (4 spec files). Note that unit tests hit the live Supabase database and require `.env.local`.
- **Commit after every task.** Never batch commits across tasks.

## File Structure

**Created:**

| Path | Responsibility |
|---|---|
| `app/motion.css` | All five motion cues, reduced-motion branches, `@supports` guards. The only place `@keyframes` are defined. |
| `components/ui/Rule.tsx` | The canon-red hairline. The site's recurring punctuation. |
| `components/ui/Overture.tsx` | Client. The curtain title card + session gating + dismissal. |
| `components/ui/overture-lift.ts` | The ~40-line Web Animations API spring helper. No React. |
| `components/catalogue/PlayRow.tsx` | The repertoire-board row. Replaces `PlayCard` on all three surfaces. |
| `components/catalogue/FilterSheet.tsx` | Client. Mobile bottom-sheet wrapper around the existing filter controls. |
| `app/privacy/page.tsx`, `app/terms/page.tsx` | Legal holding pages. |

**Modified:** `app/globals.css` (tokens), `app/layout.tsx` (fonts), `app/page.tsx` (five scenes), `app/plays/page.tsx`, `app/plays/[slug]/page.tsx`, `app/playwrights/page.tsx`, `app/playwrights/[slug]/page.tsx`, `app/about/page.tsx`, `app/contact/page.tsx`, `app/coming-soon/page.tsx`, `lib/plays.ts` (two filter fixes), `components/ui/AvailabilityBadge.tsx`, `components/layout/Header.tsx`, `components/layout/Footer.tsx`, all of `components/play/*`, all of `components/admin/*`, `app/admin/**`.

**Deleted:** `components/catalogue/PlayCard.tsx` (Task 5, after all three consumers migrate).

---

# Phase 1 — Foundations

Nothing user-visible ships broken in this phase: the old tokens stay in place until Phase 4, so existing components keep rendering while the new system is built alongside.

## Task 1: Colour tokens and the geometry law

**Files:**
- Modify: `app/globals.css`
- Modify: `components/ui/AvailabilityBadge.tsx`
- Test: `tests/unit/availability.test.ts` (extend)

**Interfaces:**
- Produces: Tailwind utility classes `bg-onyx`, `bg-onyx-deep`, `bg-onyx-lift`, `bg-ivory`, `bg-ivory-shade`, `text-canon-red`, `bg-canon-red`, `text-canon-red-deep`, and the six availability colours `available` / `available-dark` / `restricted` / `restricted-dark` / `unavailable` / `unavailable-dark`. Every later task consumes these.
- Produces: `AvailabilityBadge({ status, note, surface })` where `surface` is `'light' | 'dark'`, defaulting to `'light'`.

- [ ] **Step 1: Write the failing test**

Append to `tests/unit/availability.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { BADGE_CLASSES } from '@/components/ui/AvailabilityBadge'

describe('AvailabilityBadge classes', () => {
  it('has a variant for every status on both surfaces', () => {
    for (const status of ['available', 'restricted', 'unavailable'] as const) {
      expect(BADGE_CLASSES.light[status]).toBeTruthy()
      expect(BADGE_CLASSES.dark[status]).toBeTruthy()
    }
  })

  it('never uses a rounded corner', () => {
    const all = [
      ...Object.values(BADGE_CLASSES.light),
      ...Object.values(BADGE_CLASSES.dark),
    ].join(' ')
    expect(all).not.toMatch(/rounded/)
  })

  it('uses the dark-surface colour variants on dark', () => {
    expect(BADGE_CLASSES.dark.available).toContain('available-dark')
    expect(BADGE_CLASSES.dark.restricted).toContain('restricted-dark')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/unit/availability.test.ts`
Expected: FAIL — `BADGE_CLASSES` is not exported from `@/components/ui/AvailabilityBadge`.

- [ ] **Step 3: Add the tokens to `app/globals.css`**

Replace the whole file with:

```css
@import "tailwindcss";

@theme {
  /* --- Legacy M1 editorial tokens. Retired in Phase 4 once no component
     references them. Do not use in new work. --- */
  --color-ink: #14110F;
  --color-paper: #FAF7F2;
  --color-accent: #A6431C;
  --color-muted: #6B635C;
  --color-rule: #E3DCD2;

  /* --- The House: dark theatrical surfaces --- */
  --color-onyx: #121212;
  --color-onyx-deep: #0B0A0A;
  --color-onyx-lift: #1A1918;

  /* --- The Script: lit reading surfaces --- */
  --color-ivory: #F5F5F0;
  --color-ivory-shade: #EAE7DF;

  /* --- Accent --- */
  --color-canon-red: #D45F59;
  --color-canon-red-deep: #A6431C;

  /* --- Availability. The -dark variants exist because the light values fall
     below usable contrast on onyx. Ratios verified in the design spec. --- */
  --color-available: #2F6B4F;
  --color-available-dark: #5FA37E;
  --color-restricted: #B07A15;
  --color-restricted-dark: #D9A441;
  --color-unavailable: #6B635C;
  --color-unavailable-dark: #8B837C;

  --font-display: var(--font-bodoni);
  --font-sans: var(--font-inter);
}

html { -webkit-font-smoothing: antialiased; }
body { background: var(--color-onyx); color: var(--color-ivory); }

/* The geometry law: sharp corners everywhere, no exceptions. Reset rather than
   discipline, so a stray `rounded-*` class cannot reintroduce a radius. */
*, *::before, *::after { border-radius: 0 !important; }
```

- [ ] **Step 4: Rewrite `components/ui/AvailabilityBadge.tsx`**

```tsx
import type { AvailabilityStatus } from '@/lib/types'

const LABELS: Record<AvailabilityStatus, string> = {
  available: 'Available to licence',
  restricted: 'Restricted',
  unavailable: 'Not currently available',
}

/** Exported for test. Keyed by surface, because the light-surface greens and
 *  ambers fall below WCAG AA on onyx. */
export const BADGE_CLASSES: Record<'light' | 'dark', Record<AvailabilityStatus, string>> = {
  light: {
    available: 'text-available border-available/40 bg-available/5',
    restricted: 'text-restricted border-restricted/40 bg-restricted/5',
    unavailable: 'text-unavailable border-unavailable/40 bg-unavailable/5',
  },
  dark: {
    available: 'text-available-dark border-available-dark/40 bg-available-dark/10',
    restricted: 'text-restricted-dark border-restricted-dark/40 bg-restricted-dark/10',
    unavailable: 'text-unavailable-dark border-unavailable-dark/40 bg-unavailable-dark/10',
  },
}

/** Status is always carried by the label text, never by colour alone. */
export function AvailabilityBadge({
  status,
  note,
  surface = 'light',
}: {
  status: AvailabilityStatus
  note?: string | null
  surface?: 'light' | 'dark'
}) {
  return (
    <span className="inline-flex flex-col gap-1">
      <span
        className={`inline-flex w-fit items-center border px-3 py-1 text-[0.65rem] font-medium tracking-[0.3em] uppercase ${BADGE_CLASSES[surface][status]}`}
      >
        {LABELS[status]}
      </span>
      {note ? (
        <span className={surface === 'dark' ? 'text-sm text-ivory/60' : 'text-sm text-muted'}>
          {note}
        </span>
      ) : null}
    </span>
  )
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run tests/unit/availability.test.ts`
Expected: PASS, all tests green.

- [ ] **Step 6: Verify the build still compiles**

Run: `npm run build`
Expected: Compiles successfully. The site will look wrong at this point (dark body, light components) — that is expected and resolves through Phase 2–4.

- [ ] **Step 7: Commit**

```bash
git add app/globals.css components/ui/AvailabilityBadge.tsx tests/unit/availability.test.ts
git commit -m "feat(south-canon): add the theatrical colour tokens and geometry law"
```

---

## Task 2: Fonts — Bodoni Moda in, Fraunces out

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/coming-soon/page.tsx:1-10` (drop the local font, use the shared one)

**Interfaces:**
- Consumes: `--font-display` / `--font-sans` from Task 1's `@theme` block.
- Produces: the `font-display` and `font-sans` Tailwind utilities, available to every later task. `font-display` is Bodoni Moda from this point on.

- [ ] **Step 1: Rewrite `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Bodoni_Moda, Inter } from 'next/font/google'
import './globals.css'
import './motion.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-bodoni',
  display: 'swap',
})
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL('https://southcanon.com'),
  title: { default: 'South Canon', template: '%s · South Canon' },
  description:
    'Theatrical licensing for the global South. Licence plays by Africa’s leading writers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA" className={`${bodoni.variable} ${inter.variable}`}>
      <body className="font-sans flex min-h-screen flex-col bg-onyx text-ivory">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

Note: `./motion.css` is imported here but not created until Task 4. Create an empty `app/motion.css` now so the build does not break:

```bash
echo "/* Motion cues — populated in Task 4. */" > app/motion.css
```

- [ ] **Step 2: Update `app/coming-soon/page.tsx` to use the shared font**

Replace lines 1–10 (the imports and the local `Bodoni_Moda` call) with:

```tsx
import type { Metadata } from 'next'
import styles from './coming-soon.module.css'
```

Then, throughout the file, replace every occurrence of `${bodoni.className} ` with `font-display ` — there are two, on the `<h1>` (line 37) and the "Jaco" `<p>` (line 58).

- [ ] **Step 3: Verify Fraunces is gone**

Run: `grep -rn "Fraunces\|fraunces" app/ components/ lib/`
Expected: no output. If `--font-fraunces` still appears in `app/globals.css`, remove that line.

- [ ] **Step 4: Verify the build**

Run: `npm run build && npm run lint`
Expected: Both clean. No unused-variable error for `bodoni` in `coming-soon/page.tsx`.

- [ ] **Step 5: Verify the coming-soon page still renders**

Run: `npx playwright test tests/e2e/coming-soon.spec.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx app/coming-soon/page.tsx app/motion.css app/globals.css
git commit -m "feat(south-canon): switch the display face to Bodoni Moda, drop Fraunces"
```

---

## Task 3: The `<Rule />` component

**Files:**
- Create: `components/ui/Rule.tsx`
- Test: `tests/unit/rule.test.ts`

**Interfaces:**
- Produces: `Rule({ width, className, surface })` — `width` is `'short' | 'full'` (default `'short'`, which is the 6rem hairline from the holding page); `surface` is `'red' | 'shade'` (default `'red'`).

- [ ] **Step 1: Write the failing test**

Create `tests/unit/rule.test.tsx` (the `.tsx` extension matters — the test renders JSX):

```ts
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Rule } from '@/components/ui/Rule'

describe('Rule', () => {
  it('defaults to a short canon-red hairline', () => {
    const html = renderToStaticMarkup(<Rule />)
    expect(html).toContain('bg-canon-red')
    expect(html).toContain('w-24')
    expect(html).toContain('h-px')
  })

  it('renders full width when asked', () => {
    const html = renderToStaticMarkup(<Rule width="full" />)
    expect(html).toContain('w-full')
    expect(html).not.toContain('w-24')
  })

  it('renders the shade variant on ivory surfaces', () => {
    const html = renderToStaticMarkup(<Rule surface="shade" />)
    expect(html).toContain('bg-ivory-shade')
  })

  it('is hidden from assistive technology', () => {
    expect(renderToStaticMarkup(<Rule />)).toContain('aria-hidden')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/unit/rule.test.tsx`
Expected: FAIL — cannot resolve `@/components/ui/Rule`.

- [ ] **Step 3: Create `components/ui/Rule.tsx`**

```tsx
/**
 * The site's punctuation — the canon-red hairline established on the holding page.
 * Decorative only, so it is always hidden from assistive technology.
 */
export function Rule({
  width = 'short',
  surface = 'red',
  className = '',
}: {
  width?: 'short' | 'full'
  surface?: 'red' | 'shade'
  className?: string
}) {
  const w = width === 'full' ? 'w-full' : 'w-24'
  const bg = surface === 'shade' ? 'bg-ivory-shade' : 'bg-canon-red'
  return <div aria-hidden="true" className={`h-px ${w} ${bg} ${className}`} />
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/unit/rule.test.tsx`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add components/ui/Rule.tsx tests/unit/rule.test.tsx
git commit -m "feat(south-canon): add the Rule hairline component"
```

---

## Task 4: The motion system

**Files:**
- Modify: `app/motion.css` (created empty in Task 2)

**Interfaces:**
- Produces: classes `.cue-house-lights`, `.cue-house-lights-stagger`, `.cue-spotlight`, `.cue-blackout`, `.cue-overture`, `.cue-overture-top`, `.cue-overture-bottom`, and the custom property `--ease-spring`. Consumed by Tasks 6, 8, 9, 12, 14, 17.

- [ ] **Step 1: Write the full contents of `app/motion.css`**

```css
/*
 * South Canon motion system — five named cues, defined once.
 * Spec: docs/superpowers/specs/2026-07-30-south-canon-theatrical-redesign-design.md §2
 *
 * Rules that hold everywhere in this file:
 *   - only transform, opacity and filter are animated
 *   - every cue has a prefers-reduced-motion branch
 *   - scroll-driven cues sit behind @supports and degrade to their end state
 */

:root {
  /* A spring, approximated as a linear() easing so it runs off the main thread.
     Slight overshoot at 0.75 — enough to feel physical, not enough to look bouncy. */
  --ease-spring: linear(
    0, 0.006, 0.025, 0.101, 0.223, 0.372, 0.526, 0.667, 0.783, 0.869,
    0.928, 0.965, 0.985, 0.996, 1.001, 1.002, 1.001, 1
  );
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
}

/* ---------------------------------------------------------------------------
 * Cue 2 — House lights. Content resolves out of darkness as it enters view.
 * The generalisation of the holding page's .reveal idiom.
 * ------------------------------------------------------------------------- */

@keyframes house-lights {
  from { opacity: 0; transform: translateY(16px); filter: blur(6px); }
  to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
}

.cue-house-lights {
  /* Fallback for browsers without scroll-driven animation: play once on load. */
  animation: house-lights 620ms var(--ease-out) both;
}

@supports (animation-timeline: view()) {
  .cue-house-lights {
    animation: house-lights linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 45%;
  }
}

/* Stagger children 60ms apart, up to eight. Beyond eight the cascade reads as
   slow rather than choreographed, so later children simply share the last delay. */
.cue-house-lights-stagger > * { animation-delay: 480ms; }
.cue-house-lights-stagger > *:nth-child(1) { animation-delay: 0ms; }
.cue-house-lights-stagger > *:nth-child(2) { animation-delay: 60ms; }
.cue-house-lights-stagger > *:nth-child(3) { animation-delay: 120ms; }
.cue-house-lights-stagger > *:nth-child(4) { animation-delay: 180ms; }
.cue-house-lights-stagger > *:nth-child(5) { animation-delay: 240ms; }
.cue-house-lights-stagger > *:nth-child(6) { animation-delay: 300ms; }
.cue-house-lights-stagger > *:nth-child(7) { animation-delay: 360ms; }
.cue-house-lights-stagger > *:nth-child(8) { animation-delay: 420ms; }

/* ---------------------------------------------------------------------------
 * Cue 4 — Spotlight. Row and card hover.
 * Gated on hover:hover so a tap on touch does not leave a stuck hover state.
 * ------------------------------------------------------------------------- */

.cue-spotlight {
  transition: transform 220ms var(--ease-spring);
}

.cue-spotlight .cue-spotlight-rule {
  transform: scaleX(0.08);
  transform-origin: left;
  transition: transform 220ms var(--ease-spring);
}

.cue-spotlight .cue-spotlight-image {
  filter: grayscale(1) contrast(1.05);
  opacity: 0.55;
  transition: filter 220ms var(--ease-out), opacity 220ms var(--ease-out);
}

@media (hover: hover) and (pointer: fine) {
  .cue-spotlight:hover { transform: translateY(-2px); }
  .cue-spotlight:hover .cue-spotlight-rule { transform: scaleX(1); }
  .cue-spotlight:hover .cue-spotlight-image { filter: grayscale(0) contrast(1); opacity: 1; }
}

/* Keyboard users get the same reveal as mouse users. */
.cue-spotlight:focus-visible .cue-spotlight-rule { transform: scaleX(1); }
.cue-spotlight:focus-visible .cue-spotlight-image { filter: grayscale(0) contrast(1); opacity: 1; }

/* ---------------------------------------------------------------------------
 * Cue 5 — Blackout. An ivory panel rises over onyx as the section scrolls in.
 * Pure scroll-driven; no JavaScript, no fallback needed beyond the end state.
 * ------------------------------------------------------------------------- */

@keyframes blackout-rise {
  from { transform: translateY(6%); opacity: 0.55; }
  to   { transform: translateY(0);  opacity: 1; }
}

@supports (animation-timeline: view()) {
  .cue-blackout {
    animation: blackout-rise linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 60%;
  }
}

/* ---------------------------------------------------------------------------
 * Cue 1 — Overture. The curtain. Driven by components/ui/Overture.tsx, which
 * adds .is-lifting to trigger these. The card is an overlay above already-
 * rendered content, so it never delays LCP.
 * ------------------------------------------------------------------------- */

.cue-overture {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  background: transparent;
  pointer-events: auto;
}

.cue-overture-top,
.cue-overture-bottom {
  position: absolute;
  left: 0;
  right: 0;
  height: 50.5%; /* half a percent of overlap so no hairline gap shows at the seam */
  background: var(--color-onyx-deep);
  transition: transform 900ms var(--ease-spring);
  will-change: transform;
}

.cue-overture-top { top: 0; }
.cue-overture-bottom { bottom: 0; }

.cue-overture.is-lifting .cue-overture-top { transform: translateY(-100%); }
.cue-overture.is-lifting .cue-overture-bottom { transform: translateY(100%); }

.cue-overture-content {
  position: relative;
  z-index: 1;
  transition: opacity 320ms var(--ease-out), transform 320ms var(--ease-out);
}

.cue-overture.is-lifting .cue-overture-content {
  opacity: 0;
  transform: translateY(-12px);
}

/* ---------------------------------------------------------------------------
 * Cue 3 — Curtain wipe between routes, via the View Transitions API.
 * ------------------------------------------------------------------------- */

@keyframes wipe-out { to { opacity: 0; transform: translateY(-8px); } }
@keyframes wipe-in  { from { opacity: 0; transform: translateY(8px); } }

::view-transition-old(root) { animation: wipe-out 160ms var(--ease-out) both; }
::view-transition-new(root) { animation: wipe-in 350ms var(--ease-spring) both; }

/* ---------------------------------------------------------------------------
 * Duotone — stock photography as texture, not as photograph.
 * Spec §1. Paired with .cue-spotlight-image above, which resolves it on hover.
 * ------------------------------------------------------------------------- */

.duotone {
  filter: grayscale(1) contrast(1.05);
  opacity: 0.55;
}

.duotone-wrap { position: relative; isolation: isolate; }

.duotone-wrap::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  mix-blend-mode: color;
  background: linear-gradient(180deg, var(--color-onyx) 0%, var(--color-canon-red) 100%);
  opacity: 0.5;
}

/* ---------------------------------------------------------------------------
 * Reduced motion. Movement, blur and the curtain all go; opacity stays where it
 * aids comprehension. Nothing here may hide content.
 * ------------------------------------------------------------------------- */

@media (prefers-reduced-motion: reduce) {
  .cue-house-lights,
  .cue-house-lights-stagger > * {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
  }

  .cue-blackout { animation: none !important; opacity: 1 !important; transform: none !important; }

  .cue-spotlight,
  .cue-spotlight .cue-spotlight-rule,
  .cue-spotlight .cue-spotlight-image { transition: none !important; }

  .cue-spotlight .cue-spotlight-rule { transform: scaleX(1); }

  .cue-overture-top,
  .cue-overture-bottom,
  .cue-overture-content { transition: none !important; }

  ::view-transition-old(root),
  ::view-transition-new(root) { animation: none !important; }
}
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: Compiles successfully.

- [ ] **Step 3: Verify no layout-triggering property is animated**

Run: `grep -nE "transition:[^;]*(width|height|top|left|right|bottom|margin|padding)|@keyframes" app/motion.css`
Expected: only `@keyframes` lines appear. If any `transition` line names a layout property, fix it before committing.

- [ ] **Step 4: Commit**

```bash
git add app/motion.css
git commit -m "feat(south-canon): define the five-cue motion system"
```

---

## Task 5: `PlayRow` — the repertoire-board row

**Files:**
- Create: `components/catalogue/PlayRow.tsx`
- Modify: `app/page.tsx`, `app/plays/page.tsx`, `app/playwrights/[slug]/page.tsx` (swap the import)
- Delete: `components/catalogue/PlayCard.tsx`
- Test: `tests/unit/play-row.test.tsx`

**Interfaces:**
- Consumes: `PlaySummary` from `lib/types.ts:17-27` — fields `title`, `slug`, `logline`, `genres`, `durationMin`, `heroImageUrl`, `castSummary`, `credits`. `Rule` from Task 3. The `.cue-spotlight` classes from Task 4.
- Produces: `PlayRow({ play, surface })` where `surface` is `'light' | 'dark'`, defaulting to `'light'`. Consumed by Tasks 8, 12, 17.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/play-row.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { PlayRow } from '@/components/catalogue/PlayRow'
import type { PlaySummary } from '@/lib/types'

const play: PlaySummary = {
  id: '1',
  title: 'Saturday Night at the Palace',
  slug: 'saturday-night-at-the-palace',
  logline: 'A late-night encounter at a roadhouse.',
  genres: ['Drama'],
  durationMin: 90,
  heroImageUrl: 'https://images.pexels.com/photos/1/pexels-photo-1.jpeg',
  castSummary: '3 roles',
  credits: [{ name: 'Paul Slabolepszy', slug: 'paul-slabolepszy', role: 'author' }],
}

describe('PlayRow', () => {
  it('links to the play and shows its title and writer', () => {
    const html = renderToStaticMarkup(<PlayRow play={play} />)
    expect(html).toContain('/plays/saturday-night-at-the-palace')
    expect(html).toContain('Saturday Night at the Palace')
    expect(html).toContain('Paul Slabolepszy')
  })

  it('carries the spotlight cue and its rule', () => {
    const html = renderToStaticMarkup(<PlayRow play={play} />)
    expect(html).toContain('cue-spotlight')
    expect(html).toContain('cue-spotlight-rule')
  })

  it('treats the image as duotone atmosphere, never as a production photo', () => {
    const html = renderToStaticMarkup(<PlayRow play={play} />)
    expect(html).toContain('duotone')
    expect(html).toContain('Illustrative artwork for')
  })

  it('renders without an image when the play has none', () => {
    const html = renderToStaticMarkup(<PlayRow play={{ ...play, heroImageUrl: null }} />)
    expect(html).not.toContain('<img')
    expect(html).toContain('Saturday Night at the Palace')
  })

  it('omits metadata the play does not have', () => {
    const bare: PlaySummary = { ...play, logline: null, durationMin: null, genres: [], credits: [] }
    const html = renderToStaticMarkup(<PlayRow play={bare} />)
    expect(html).not.toContain('min')
    expect(html).not.toContain('Paul Slabolepszy')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/unit/play-row.test.tsx`
Expected: FAIL — cannot resolve `@/components/catalogue/PlayRow`.

- [ ] **Step 3: Create `components/catalogue/PlayRow.tsx`**

```tsx
import Link from 'next/link'
import { Rule } from '@/components/ui/Rule'
import type { PlaySummary } from '@/lib/types'

/**
 * The repertoire board row — the catalogue's primary unit, used on the homepage,
 * /plays and playwright detail pages. A row rather than a card because the board
 * has to stay scannable well past forty titles.
 */
export function PlayRow({
  play,
  surface = 'light',
}: {
  play: PlaySummary
  surface?: 'light' | 'dark'
}) {
  const dark = surface === 'dark'
  const meta = dark ? 'text-ivory/50' : 'text-unavailable'
  const body = dark ? 'text-ivory/70' : 'text-onyx/70'
  const edge = dark ? 'border-ivory/10' : 'border-ivory-shade'

  return (
    <Link
      href={`/plays/${play.slug}`}
      className={`cue-spotlight group block border-b ${edge} py-8`}
    >
      <article className="grid gap-5 md:grid-cols-[1fr_auto] md:items-start">
        <div className="flex gap-6">
          {play.heroImageUrl && (
            <div className="duotone-wrap aspect-[3/4] w-20 shrink-0 overflow-hidden md:w-28">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={play.heroImageUrl}
                alt={`Illustrative artwork for ${play.title}`}
                className="cue-spotlight-image duotone h-full w-full object-cover"
              />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="font-display text-3xl leading-[1.1] md:text-4xl">{play.title}</h2>
            {play.credits.length > 0 && (
              <p className={`mt-2 text-[0.65rem] font-medium tracking-[0.3em] uppercase ${meta}`}>
                {play.credits.map((c) => c.name).join(' · ')}
              </p>
            )}
            <div className="mt-4">
              <Rule className="cue-spotlight-rule" />
            </div>
            {play.logline && (
              <p className={`mt-4 max-w-2xl text-base leading-relaxed ${body}`}>{play.logline}</p>
            )}
          </div>
        </div>

        <dl
          className={`flex gap-6 text-[0.65rem] font-medium tracking-[0.3em] uppercase ${meta} md:flex-col md:gap-2 md:text-right`}
        >
          {play.genres.length > 0 && (
            <div>
              <dt className="sr-only">Genre</dt>
              <dd>{play.genres.join(', ')}</dd>
            </div>
          )}
          {play.castSummary && (
            <div>
              <dt className="sr-only">Cast</dt>
              <dd>{play.castSummary}</dd>
            </div>
          )}
          {play.durationMin && (
            <div>
              <dt className="sr-only">Duration</dt>
              <dd>{play.durationMin} min</dd>
            </div>
          )}
        </dl>
      </article>
    </Link>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/unit/play-row.test.tsx`
Expected: PASS, 5 tests.

- [ ] **Step 5: Migrate the three consumers**

In `app/page.tsx`, `app/plays/page.tsx` and `app/playwrights/[slug]/page.tsx`, replace:

```tsx
import { PlayCard } from '@/components/catalogue/PlayCard'
```

with:

```tsx
import { PlayRow } from '@/components/catalogue/PlayRow'
```

and replace every `<PlayCard key={...} play={...} />` with `<PlayRow key={...} play={...} />`.

- [ ] **Step 6: Verify no reference to `PlayCard` remains, then delete it**

Run: `grep -rn "PlayCard" app/ components/ tests/`
Expected: no output.

```bash
git rm components/catalogue/PlayCard.tsx
```

- [ ] **Step 7: Verify the build and the existing suites**

Run: `npm run build && npm run lint && npx vitest run`
Expected: all clean.

Run: `npx playwright test tests/e2e/catalogue.spec.ts`
Expected: PASS — the three catalogue tests assert on heading text and the empty-state string, both of which `PlayRow` preserves.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(south-canon): replace PlayCard with the PlayRow repertoire board row"
```

---

# Phase 2 — Entrance and homepage

This is the phase the client will judge the work on, so it lands before the long tail.

## Task 6: The overture — spring helper and session gating

**Files:**
- Create: `components/ui/overture-lift.ts`
- Create: `components/ui/Overture.tsx`
- Test: `tests/unit/overture.test.ts`

**Interfaces:**
- Consumes: the `.cue-overture*` classes from Task 4.
- Produces: `shouldShowOverture(storage: Pick<Storage, 'getItem' | 'setItem'>): boolean` and `markOvertureSeen(storage)` from `overture-lift.ts`; the `Overture` component from `Overture.tsx`. Consumed by Tasks 7 and 8.
- Produces: the sessionStorage key `sc-overture-seen`.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/overture.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { shouldShowOverture, markOvertureSeen, OVERTURE_KEY } from '@/components/ui/overture-lift'

function fakeStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial))
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
  }
}

describe('overture session gating', () => {
  it('shows on a fresh session', () => {
    expect(shouldShowOverture(fakeStorage())).toBe(true)
  })

  it('does not show once marked seen', () => {
    const s = fakeStorage()
    markOvertureSeen(s)
    expect(shouldShowOverture(s)).toBe(false)
  })

  it('does not show when the flag is already present', () => {
    expect(shouldShowOverture(fakeStorage({ [OVERTURE_KEY]: '1' }))).toBe(false)
  })

  it('fails closed when storage throws (private browsing)', () => {
    const throwing = {
      getItem: () => {
        throw new Error('SecurityError')
      },
      setItem: () => {
        throw new Error('SecurityError')
      },
    }
    // Storage being unavailable must never crash the page, and must never trap
    // the visitor behind a curtain that cannot record having been seen.
    expect(shouldShowOverture(throwing)).toBe(false)
    expect(() => markOvertureSeen(throwing)).not.toThrow()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/unit/overture.test.ts`
Expected: FAIL — cannot resolve `@/components/ui/overture-lift`.

- [ ] **Step 3: Create `components/ui/overture-lift.ts`**

```ts
export const OVERTURE_KEY = 'sc-overture-seen'

type MinimalStorage = Pick<Storage, 'getItem' | 'setItem'>

/**
 * The overture plays once per session. Storage can throw in private browsing and
 * in embedded webviews, so both helpers fail closed: no storage means no curtain,
 * which is the safe direction — a visitor who cannot be recorded as having seen it
 * must not meet it on every navigation.
 */
export function shouldShowOverture(storage: MinimalStorage): boolean {
  try {
    return storage.getItem(OVERTURE_KEY) === null
  } catch {
    return false
  }
}

export function markOvertureSeen(storage: MinimalStorage): void {
  try {
    storage.setItem(OVERTURE_KEY, '1')
  } catch {
    /* storage unavailable — the curtain simply will not replay this session */
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/unit/overture.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Create `components/ui/Overture.tsx`**

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { Rule } from '@/components/ui/Rule'
import { markOvertureSeen, shouldShowOverture } from './overture-lift'

/**
 * Cue 1 — the curtain. A full-viewport title card that holds the screen on first
 * arrival and splits at the centre on the first deliberate input.
 *
 * It is an overlay above already-rendered content, never a gate in front of it:
 * the homepage is server-rendered underneath, so this cannot delay LCP and a
 * crawler never sees it at all.
 */
export function Overture() {
  // Starts false so server and first client render agree; the effect decides.
  const [visible, setVisible] = useState(false)
  const [lifting, setLifting] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (shouldShowOverture(window.sessionStorage)) setVisible(true)
    else markOvertureSeen(window.sessionStorage)
  }, [])

  useEffect(() => {
    if (!visible) return

    // The curtain owns the viewport while it is up, so the page beneath must not
    // scroll behind it.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let removeTimer: ReturnType<typeof setTimeout>
    const lift = () => {
      markOvertureSeen(window.sessionStorage)
      setLifting(true)
      // Matches the 900ms transition in motion.css; instant under reduced motion.
      removeTimer = setTimeout(() => setVisible(false), reduced ? 0 : 900)
    }

    const onKey = (e: KeyboardEvent) => {
      // Tab must stay a navigation key so the skip control is reachable.
      if (e.key !== 'Tab') lift()
    }

    window.addEventListener('wheel', lift, { once: true, passive: true })
    window.addEventListener('touchmove', lift, { once: true, passive: true })
    window.addEventListener('pointerdown', lift, { once: true })
    window.addEventListener('keydown', onKey, { once: true })

    return () => {
      document.body.style.overflow = previousOverflow
      clearTimeout(removeTimer)
      window.removeEventListener('wheel', lift)
      window.removeEventListener('touchmove', lift)
      window.removeEventListener('pointerdown', lift)
      window.removeEventListener('keydown', onKey)
    }
  }, [visible])

  if (!visible) return null

  return (
    <div
      ref={ref}
      data-testid="overture"
      className={`cue-overture ${lifting ? 'is-lifting' : ''}`}
      role="presentation"
    >
      <div className="cue-overture-top" />
      <div className="cue-overture-bottom" />

      <div className="cue-overture-content flex flex-col items-center px-6 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/southcanon-logo-ivory.png"
          alt="South Canon"
          className="h-5 w-auto sm:h-7"
        />
        <h1
          className="font-display mt-10 max-w-3xl leading-[1.1] font-normal text-ivory"
          style={{ fontSize: 'clamp(2.5rem, 9vw, 7rem)' }}
        >
          Theatre from the south.
          <br />
          <em className="italic">Licensed worldwide.</em>
        </h1>
        <Rule className="mt-10" />
        <button
          type="button"
          onClick={() => undefined /* the window pointerdown listener performs the lift */}
          className="mt-12 text-[0.65rem] font-medium tracking-[0.3em] text-ivory/40 uppercase"
        >
          Enter
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Verify the build and lint**

Run: `npm run build && npm run lint`
Expected: both clean.

- [ ] **Step 7: Commit**

```bash
git add components/ui/overture-lift.ts components/ui/Overture.tsx tests/unit/overture.test.ts
git commit -m "feat(south-canon): add the overture curtain with once-per-session gating"
```

---

## Task 7: Give `/coming-soon` its second beat

**Files:**
- Modify: `app/coming-soon/page.tsx`
- Test: `tests/e2e/coming-soon.spec.ts` (extend)

**Interfaces:**
- Consumes: `Rule` (Task 3), the `.cue-house-lights` classes (Task 4).
- Preserves: the existing Jaco contact block and WhatsApp CTA exactly as they are — the client is actively using that number.

- [ ] **Step 1: Write the failing test**

Append to `tests/e2e/coming-soon.spec.ts`:

```ts
test('the holding page has something below the fold to reveal', async ({ page }) => {
  await page.goto('/coming-soon')
  await expect(page.getByRole('heading', { name: /What South Canon is/i })).toBeAttached()
  await expect(page.getByText(/Paul Slabolepszy/i)).toBeAttached()
})

test('the WhatsApp CTA survives the redesign', async ({ page }) => {
  await page.goto('/coming-soon')
  await expect(page.getByRole('link', { name: /WhatsApp Jaco/i })).toBeVisible()
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/e2e/coming-soon.spec.ts`
Expected: the first new test FAILS (no such heading); the WhatsApp test passes already.

- [ ] **Step 3: Add the second beat**

In `app/coming-soon/page.tsx`, change the outer `<div>`'s classes (line 21) from `min-h-[100svh]` to `min-h-[100svh]` on an inner wrapper, and append a second section after the existing `<footer>`. Concretely, wrap the current contents in a `<section className="flex min-h-[100svh] flex-col items-center justify-center">` and add after it:

```tsx
<section className="cue-house-lights-stagger mx-auto w-full max-w-3xl px-6 pb-24 text-left">
  <h2 className="cue-house-lights font-display text-3xl leading-tight sm:text-4xl">
    What South Canon is
  </h2>
  <div className="cue-house-lights mt-6">
    <Rule />
  </div>
  <div className="cue-house-lights mt-8 space-y-4 text-base leading-relaxed text-ivory/60 sm:text-lg">
    <p>
      A theatrical licensing agency for Africa and the global South. We represent playwrights,
      license their work for performance worldwide, and account for every production &mdash; where
      it played, what it earned, and when the writer was paid.
    </p>
    <p>
      Licensing has failed writers here for a long time, and it has rarely failed them on
      taste. It has failed them on administration: slow permissions, opaque royalties, and no
      way to find out what your own work earned. That is the part we are rebuilding.
    </p>
  </div>

  <h3 className="cue-house-lights mt-14 text-[0.65rem] font-medium tracking-[0.3em] text-ivory/40 uppercase">
    Represented
  </h3>
  <p className="cue-house-lights font-display mt-5 text-2xl sm:text-3xl">Paul Slabolepszy</p>
  <p className="cue-house-lights mt-3 text-base leading-relaxed text-ivory/60">
    Thirty-nine plays, including <em className="italic">Saturday Night at the Palace</em>. The
    catalogue opens with a selection of his work; further writers are in discussion.
  </p>
</section>
```

Add `import { Rule } from '@/components/ui/Rule'` to the imports.

Note: the multi-paragraph body copy uses `space-y-4` — visible spacing between paragraphs is a standing requirement on this account.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx playwright test tests/e2e/coming-soon.spec.ts`
Expected: PASS, all tests including the two originals.

- [ ] **Step 5: Verify build and lint**

Run: `npm run build && npm run lint`
Expected: both clean.

- [ ] **Step 6: Commit**

```bash
git add app/coming-soon/page.tsx tests/e2e/coming-soon.spec.ts
git commit -m "feat(south-canon): give the holding page a second beat for the curtain to reveal"
```

---

## Task 8: Homepage scenes 1 and 2 — onyx hero and the repertoire board

**Files:**
- Modify: `app/page.tsx`
- Test: `tests/e2e/homepage.spec.ts` (create)

**Interfaces:**
- Consumes: `Overture` (Task 6), `PlayRow` (Task 5), `Rule` (Task 3), `listPlays` (`lib/plays.ts:44`), the `.cue-*` classes (Task 4).
- Note: `app/page.tsx` must stay a **server** component. `Overture` is a client component imported into it — that is the only client boundary on this page.

- [ ] **Step 1: Write the failing test**

Create `tests/e2e/homepage.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('the overture shows on first arrival and not on the second', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('overture')).toBeVisible()

  // Dismiss it, then navigate again within the same session.
  await page.mouse.wheel(0, 200)
  await expect(page.getByTestId('overture')).toBeHidden({ timeout: 3000 })

  await page.goto('/')
  await expect(page.getByTestId('overture')).toHaveCount(0)
})

test('the overture never appears on a deep link', async ({ page }) => {
  await page.goto('/plays')
  await expect(page.getByTestId('overture')).toHaveCount(0)
})

test('homepage content is server-rendered beneath the curtain', async ({ page }) => {
  // JavaScript disabled: the curtain cannot mount, and the content must still be there.
  const response = await page.request.get('/')
  const html = await response.text()
  expect(html).toContain('Browse the catalogue')
  expect(html).not.toContain('data-testid="overture"')
})

test('the repertoire board lists plays', async ({ page }) => {
  await page.goto('/')
  await page.mouse.wheel(0, 200)
  await expect(page.getByRole('heading', { name: 'From the repertoire' })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Saturday Night at the Palace' }),
  ).toBeVisible()
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/e2e/homepage.spec.ts`
Expected: FAIL — no overture, no "From the repertoire" heading.

The gate is already handled: `global-setup.ts` sets the preview cookie and `playwright.config.ts` applies it to every project, so these tests reach the real homepage rather than the holding page. Do not change `SITE_GATED`.

- [ ] **Step 3: Write scenes 1 and 2 in `app/page.tsx`**

Replace the file's contents with:

```tsx
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Overture } from '@/components/ui/Overture'
import { Rule } from '@/components/ui/Rule'
import { PlayRow } from '@/components/catalogue/PlayRow'
import { listPlays } from '@/lib/plays'

export const revalidate = 300

export default async function HomePage() {
  const allPlays = await listPlays({ genres: [] })
  const plays = allPlays.slice(0, 4)

  return (
    <>
      <Overture />

      {/* Scene 1 — the house, lights down. Type is the hero; no photograph. */}
      <section className="relative flex min-h-[88svh] items-center overflow-hidden bg-onyx">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(80ch 60ch at 50% -10%, rgba(212,95,89,0.14), transparent 70%),' +
              'radial-gradient(60ch 50ch at 50% 0%, rgba(245,245,240,0.07), transparent 65%)',
          }}
        />
        <Container className="cue-house-lights-stagger py-24 md:py-32">
          <p className="cue-house-lights text-[0.65rem] font-medium tracking-[0.4em] text-canon-red uppercase">
            Theatrical licensing for the global South
          </p>
          <h1
            className="cue-house-lights font-display mt-8 max-w-5xl leading-[1.05] font-normal"
            style={{ fontSize: 'clamp(2.25rem, 6vw, 4.5rem)' }}
          >
            The work of Africa&rsquo;s greatest playwrights,
            <br />
            <em className="italic">properly represented.</em>
          </h1>
          <div className="cue-house-lights mt-10">
            <Rule />
          </div>
          <p className="cue-house-lights mt-10 max-w-2xl text-lg leading-relaxed text-ivory/60">
            South Canon licenses plays for performance worldwide &mdash; and makes sure the writers
            who made them are paid, on time, with a full account of where their work is playing.
          </p>
          <div className="cue-house-lights mt-12 flex flex-wrap gap-4">
            <Link
              href="/plays"
              className="border border-canon-red bg-canon-red px-8 py-4 text-[0.65rem] font-medium tracking-[0.25em] text-onyx uppercase transition-colors hover:bg-transparent hover:text-canon-red"
            >
              Browse the catalogue
            </Link>
            <Link
              href="/about"
              className="border border-ivory/25 px-8 py-4 text-[0.65rem] font-medium tracking-[0.25em] text-ivory uppercase transition-colors hover:border-ivory"
            >
              For writers
            </Link>
          </div>
        </Container>
      </section>

      {/* Scene 2 — blackout into ivory. The repertoire board. */}
      {plays.length > 0 && (
        <section className="cue-blackout bg-ivory text-onyx">
          <Container className="py-24 md:py-28">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 className="font-display text-3xl md:text-4xl">From the repertoire</h2>
              <Link
                href="/plays"
                className="text-[0.65rem] font-medium tracking-[0.3em] text-canon-red-deep uppercase"
              >
                See the full catalogue
              </Link>
            </div>
            <div className="mt-4">
              <Rule surface="shade" width="full" />
            </div>
            <div className="mt-2">
              {plays.map((p) => (
                <PlayRow key={p.id} play={p} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  )
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx playwright test tests/e2e/homepage.spec.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Verify the existing suites still pass**

Run: `npx vitest run && npx playwright test`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx tests/e2e/homepage.spec.ts
git commit -m "feat(south-canon): rebuild the homepage hero and repertoire board"
```

---

## Task 9: Homepage scenes 3–5 — the promise, the writers, the footer

**Files:**
- Modify: `app/page.tsx` (append two sections)
- Modify: `components/layout/Footer.tsx`
- Modify: `components/layout/Header.tsx`
- Test: `tests/e2e/homepage.spec.ts` (extend)

**Interfaces:**
- Consumes: `listPlaywrights` from `lib/playwrights.ts`, `Rule`, `Container`.
- Produces: the restyled `Header` and `Footer`, consumed by every page from here on.

- [ ] **Step 1: Write the failing test**

Append to `tests/e2e/homepage.spec.ts`:

```ts
test('the homepage states the differentiator', async ({ page }) => {
  await page.goto('/')
  await page.mouse.wheel(0, 200)
  await expect(page.getByRole('heading', { name: /Why writers sign with us/i })).toBeVisible()
  await expect(page.getByText(/Paid in full, on time/i)).toBeVisible()
})

test('the homepage introduces the writers', async ({ page }) => {
  await page.goto('/')
  await page.mouse.wheel(0, 200)
  await expect(page.getByRole('heading', { name: /The writers/i })).toBeVisible()
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/e2e/homepage.spec.ts`
Expected: the two new tests FAIL.

- [ ] **Step 3: Append scenes 3 and 4 to `app/page.tsx`**

Add `import { listPlaywrights } from '@/lib/playwrights'` and fetch alongside the plays:

```tsx
const [allPlays, playwrights] = await Promise.all([listPlays({ genres: [] }), listPlaywrights()])
```

Then append after the scene-2 `</section>`:

```tsx
{/* Scene 3 — back to the house. The differentiator, stated plainly. */}
<section className="bg-onyx">
  <Container className="py-24 md:py-28">
    <h2 className="font-display text-3xl md:text-4xl">Why writers sign with us</h2>
    <div className="mt-4">
      <Rule />
    </div>
    <div className="cue-house-lights-stagger mt-14 grid gap-12 md:grid-cols-3">
      {[
        {
          label: 'Transparent rights',
          body: 'Every territory, every restriction, published on the play’s own page. You know what is available before you write to us, not after.',
        },
        {
          label: 'Pricing before you ask',
          body: 'Indicative fees and royalty rates are on the site. No quotation process to discover whether a production is affordable at all.',
        },
        {
          label: 'Paid in full, on time',
          body: 'Writers see every production of their work, what it earned and when it was paid. That account is the point of the whole agency.',
        },
      ].map((col) => (
        <div key={col.label} className="cue-house-lights">
          <h3 className="text-[0.65rem] font-medium tracking-[0.3em] text-canon-red uppercase">
            {col.label}
          </h3>
          <div className="mt-5">
            <Rule />
          </div>
          <p className="mt-5 text-base leading-relaxed text-ivory/60">{col.body}</p>
        </div>
      ))}
    </div>
  </Container>
</section>

{/* Scene 4 — ivory. The writers. */}
{playwrights.length > 0 && (
  <section className="cue-blackout bg-ivory text-onyx">
    <Container className="py-24 md:py-28">
      <h2 className="font-display text-3xl md:text-4xl">The writers</h2>
      <div className="mt-4">
        <Rule surface="shade" width="full" />
      </div>
      <div className="cue-house-lights-stagger mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {playwrights.map((w) => (
          <Link key={w.id} href={`/playwrights/${w.slug}`} className="cue-spotlight cue-house-lights block">
            {w.portraitUrl && (
              <div className="duotone-wrap mb-5 aspect-[4/5] w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={w.portraitUrl}
                  alt={`Portrait of ${w.name}`}
                  className="cue-spotlight-image duotone h-full w-full object-cover"
                />
              </div>
            )}
            <h3 className="font-display text-2xl">{w.name}</h3>
            {w.country && (
              <p className="mt-2 text-[0.65rem] font-medium tracking-[0.3em] text-unavailable uppercase">
                {w.country}
              </p>
            )}
            <div className="mt-4">
              <Rule className="cue-spotlight-rule" />
            </div>
            {w.honours.length > 0 && (
              <p className="mt-4 text-sm leading-relaxed text-onyx/70">{w.honours.join(' · ')}</p>
            )}
          </Link>
        ))}
      </div>
    </Container>
  </section>
)}
```

- [ ] **Step 4: Restyle `components/layout/Footer.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Container } from '@/components/ui/Container'

export function Footer() {
  const pathname = usePathname()
  if (pathname === '/coming-soon') return null

  return (
    <footer className="border-t border-ivory/10 bg-onyx py-14 text-ivory">
      <Container className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-display text-2xl">South Canon</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ivory/50">
            Theatrical licensing for Africa and the global South.
          </p>
        </div>
        <nav className="flex flex-wrap gap-8 text-[0.65rem] font-medium tracking-[0.3em] uppercase">
          <Link href="/plays" className="text-ivory/60 hover:text-canon-red">Catalogue</Link>
          <Link href="/playwrights" className="text-ivory/60 hover:text-canon-red">Playwrights</Link>
          <Link href="/about" className="text-ivory/60 hover:text-canon-red">About</Link>
          <Link href="/contact" className="text-ivory/60 hover:text-canon-red">Contact</Link>
          <Link href="/privacy" className="text-ivory/60 hover:text-canon-red">Privacy</Link>
          <Link href="/terms" className="text-ivory/60 hover:text-canon-red">Terms</Link>
        </nav>
      </Container>
      <Container className="mt-12">
        <p className="text-[0.65rem] tracking-[0.2em] text-ivory/30 uppercase">
          &copy; {new Date().getFullYear()} South Canon &middot; South Africa
        </p>
      </Container>
    </footer>
  )
}
```

- [ ] **Step 5: Restyle `components/layout/Header.tsx`**

Keep the component's logic exactly as it is (including the `/coming-soon` early return). Change only the markup classes:

```tsx
  return (
    <header className="border-b border-ivory/10 bg-onyx">
      <Container className="flex items-center justify-between py-6">
        <Link href="/" className="font-display text-xl tracking-[0.18em] text-ivory uppercase">
          South Canon
        </Link>
        <nav className="flex gap-8 text-[0.65rem] font-medium tracking-[0.3em] uppercase">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-ivory/60 hover:text-canon-red">
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
    </header>
  )
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx playwright test tests/e2e/homepage.spec.ts`
Expected: PASS, 6 tests.

- [ ] **Step 7: Verify the full suites**

Run: `npm run build && npm run lint && npx vitest run && npx playwright test`
Expected: all green.

- [ ] **Step 8: Commit**

```bash
git add app/page.tsx components/layout/Footer.tsx components/layout/Header.tsx tests/e2e/homepage.spec.ts
git commit -m "feat(south-canon): add the promise and writers scenes, restyle header and footer"
```

---

# Phase 3 — Catalogue, play and playwright

Two of these tasks fix controls that currently lie to the user. Those are defects, and they are fixed with tests first.

## Task 10: Make search match playwright names

**Files:**
- Modify: `lib/plays.ts:44-66` (`listPlays`)
- Test: `tests/unit/plays.test.ts` (extend)

**Interfaces:**
- Consumes: `CatalogueFilters.q` (`lib/filters.ts:4`).
- Produces: no signature change to `listPlays(filters: CatalogueFilters): Promise<PlaySummary[]>`.

**Background:** `search_text` is a Postgres generated column (`supabase/migrations/0004_search.sql`) built from `title`, `logline` and `synopsis_short` only. A generated column cannot subquery the join table, so playwright names cannot be added to it without a trigger and a migration. The catalogue is 7 plays today and tens at maturity, and `listPlays` already post-filters in JS for `castMax` and `playwright`. So `q` moves to the same JS post-filter pass. **If the catalogue ever passes a few hundred titles this must move to a trigger-maintained column** — leave the comment in place saying so.

- [ ] **Step 1: Write the failing test**

Append to `tests/unit/plays.test.ts`:

```ts
describe('listPlays search', () => {
  it('matches on title', async () => {
    const plays = await listPlays({ genres: [], q: 'Saturday' })
    expect(plays.some((p) => p.slug === 'saturday-night-at-the-palace')).toBe(true)
  })

  it('matches on playwright name, as the UI copy promises', async () => {
    const plays = await listPlays({ genres: [], q: 'Slabolepszy' })
    expect(plays.length).toBeGreaterThan(0)
    expect(plays.every((p) => p.credits.some((c) => /Slabolepszy/i.test(c.name)))).toBe(true)
  })

  it('is case-insensitive', async () => {
    const lower = await listPlays({ genres: [], q: 'slabolepszy' })
    const upper = await listPlays({ genres: [], q: 'SLABOLEPSZY' })
    expect(lower.length).toBe(upper.length)
    expect(lower.length).toBeGreaterThan(0)
  })

  it('returns nothing for a term that matches neither', async () => {
    expect(await listPlays({ genres: [], q: 'zzzznomatch' })).toEqual([])
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/unit/plays.test.ts`
Expected: the playwright-name and case-insensitivity tests FAIL — `ilike('search_text', ...)` cannot see playwright names.

- [ ] **Step 3: Move `q` to the post-filter pass**

In `lib/plays.ts`, delete this line from `listPlays`:

```ts
  if (filters.q) query = query.ilike('search_text', `%${filters.q}%`)
```

and add, immediately after the existing `filters.playwright` block near the end of the function:

```ts
  // Search runs in JS, not SQL, because `search_text` is a generated column
  // (0004_search.sql) covering only title/logline/synopsis — it cannot reach the
  // playwright join, and the UI promises "Search by title, genre or playwright".
  // Fine at catalogue scale (tens of titles). If this ever passes a few hundred,
  // replace it with a trigger-maintained search column that includes writer names.
  if (filters.q) {
    const needle = filters.q.toLowerCase()
    plays = plays.filter(
      (p) =>
        p.title.toLowerCase().includes(needle) ||
        (p.logline ?? '').toLowerCase().includes(needle) ||
        p.credits.some((c) => c.name.toLowerCase().includes(needle)),
    )
  }
  return plays
```

Remove the now-duplicated trailing `return plays`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tests/unit/plays.test.ts`
Expected: PASS, all tests.

- [ ] **Step 5: Verify the catalogue e2e still passes**

Run: `npx playwright test tests/e2e/catalogue.spec.ts`
Expected: PASS — `'search narrows the list'` uses `q=zzzznomatch`, still correctly empty.

- [ ] **Step 6: Commit**

```bash
git add lib/plays.ts tests/unit/plays.test.ts
git commit -m "fix(south-canon): make catalogue search match playwright names as the UI promises"
```

---

## Task 11: Make the territory filter actually filter

**Files:**
- Modify: `lib/plays.ts` (`SUMMARY_SELECT` and `listPlays`)
- Test: `tests/unit/plays.test.ts` (extend)

**Interfaces:**
- Consumes: `CatalogueFilters.territory` (`lib/filters.ts:9`), already parsed and validated against `TERRITORIES` by `parseFilters`.
- Produces: no signature change.

**Semantics — decide once, and make the UI label match:** the filter means *"available to licence in this territory"*. A play matches only if it has a `rights_availability` row for that territory with `status = 'available'`. A play with no row for the territory does **not** match — absence of a recorded right is not a right. The catalogue control is relabelled "Available in" in Task 12 so the control's promise matches this behaviour.

- [ ] **Step 1: Write the failing test**

Append to `tests/unit/plays.test.ts`:

```ts
import { TERRITORIES } from '@/lib/types'

describe('listPlays territory filter', () => {
  it('returns plays with an available right in the territory', async () => {
    const plays = await listPlays({ genres: [], territory: 'South Africa' })
    expect(plays.some((p) => p.slug === 'saturday-night-at-the-palace')).toBe(true)
  })

  it('actually narrows the list rather than silently ignoring the filter', async () => {
    const all = await listPlays({ genres: [] })
    const perTerritory = await Promise.all(
      TERRITORIES.map((t) => listPlays({ genres: [], territory: t })),
    )
    // At least one territory must return fewer plays than the unfiltered list,
    // otherwise the filter is a no-op again.
    expect(perTerritory.some((list) => list.length < all.length)).toBe(true)
  })

  it('excludes plays with no recorded right in the territory', async () => {
    const plays = await listPlays({ genres: [], territory: 'North America' })
    const all = await listPlays({ genres: [] })
    expect(plays.length).toBeLessThan(all.length)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/unit/plays.test.ts`
Expected: the two narrowing tests FAIL — `listPlays` never reads `filters.territory`, so every list is the full list.

- [ ] **Step 3: Select the rights rows and filter on them**

In `lib/plays.ts`, extend `SUMMARY_SELECT` (line 7) to pull the rights rows:

```ts
const SUMMARY_SELECT = `
  id, title, slug, logline, genres, duration_min, hero_image_url,
  play_roles ( id, name, gender, age_range, description, is_ensemble, sort ),
  play_playwrights ( role, sort, playwrights ( name, slug ) ),
  rights_availability ( territory, status )
`
```

Then, inside `listPlays`, add to the raw-row filtering block (alongside the existing `castMax` filter, before `rows.map(toSummary)`):

```ts
  // "Available in <territory>" means a recorded, available right — absence of a
  // row is not a right, so unlisted territories do not match.
  if (filters.territory) {
    rows = rows.filter((r: any) =>
      (r.rights_availability ?? []).some(
        (right: any) => right.territory === filters.territory && right.status === 'available',
      ),
    )
  }
```

`toSummary` ignores the extra key, so `PlaySummary` is unchanged.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tests/unit/plays.test.ts`
Expected: PASS, all tests.

- [ ] **Step 5: Verify nothing else regressed**

Run: `npx vitest run && npx playwright test`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add lib/plays.ts tests/unit/plays.test.ts
git commit -m "fix(south-canon): wire the territory filter that was silently ignored"
```

---

## Task 12: Catalogue page — onyx band, ivory board, sticky desktop filters

**Files:**
- Modify: `app/plays/page.tsx`
- Modify: `components/catalogue/CatalogueFilters.tsx`
- Test: `tests/e2e/catalogue.spec.ts` (extend)

**Interfaces:**
- Consumes: `PlayRow` (Task 5), `Rule`, `Container`, the fixed `listPlays` (Tasks 10–11).
- Produces: `CatalogueFilters` keeps its existing props (`filters`, `genres`, `playwrights`) — Task 13 wraps it, so do not change its signature.

- [ ] **Step 1: Write the failing test**

Append to `tests/e2e/catalogue.spec.ts`:

```ts
test('the territory control is labelled to match what it does', async ({ page }) => {
  await page.goto('/plays')
  await expect(page.getByLabel(/Available in/i)).toBeVisible()
})

test('filtering by territory narrows the visible list', async ({ page }) => {
  await page.goto('/plays')
  const all = await page.getByRole('heading', { level: 2 }).count()
  await page.goto('/plays?territory=North+America')
  const narrowed = await page.getByRole('heading', { level: 2 }).count()
  expect(narrowed).toBeLessThan(all)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/e2e/catalogue.spec.ts`
Expected: the label test FAILS.

- [ ] **Step 3: Rewrite `app/plays/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { Rule } from '@/components/ui/Rule'
import { CatalogueFilters } from '@/components/catalogue/CatalogueFilters'
import { PlayRow } from '@/components/catalogue/PlayRow'
import { parseFilters } from '@/lib/filters'
import { listGenres, listPlays } from '@/lib/plays'
import { listPlaywrights } from '@/lib/playwrights'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Catalogue',
  description:
    'Browse plays available for licensing from South Canon. Search by title, genre or playwright.',
}

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const filters = parseFilters(await searchParams)
  const [plays, genres, playwrights] = await Promise.all([
    listPlays(filters),
    listGenres(),
    listPlaywrights(),
  ])

  return (
    <>
      {/* A thin band of the house, then straight to the working surface. */}
      <section className="bg-onyx">
        <Container className="py-16 md:py-20">
          <p className="text-[0.65rem] font-medium tracking-[0.4em] text-canon-red uppercase">
            {plays.length} {plays.length === 1 ? 'play' : 'plays'} represented
          </p>
          <h1
            className="font-display mt-6 leading-[1.05] font-normal"
            style={{ fontSize: 'clamp(2.25rem, 6vw, 4.5rem)' }}
          >
            Catalogue
          </h1>
          <div className="mt-8">
            <Rule />
          </div>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ivory/60">
            Plays represented by South Canon. Search by title, genre or playwright, and filter by
            the territory you intend to perform in.
          </p>
        </Container>
      </section>

      <section className="min-h-screen bg-ivory text-onyx">
        <Container className="py-12 md:py-16">
          <div className="md:grid md:grid-cols-[18rem_1fr] md:gap-14">
            <aside className="md:sticky md:top-8 md:self-start">
              <CatalogueFilters filters={filters} genres={genres} playwrights={playwrights} />
            </aside>

            <div>
              {plays.length === 0 ? (
                <p className="py-16 text-onyx/60">No plays match those filters yet.</p>
              ) : (
                <>
                  <Rule surface="shade" width="full" />
                  {plays.map((play) => (
                    <PlayRow key={play.id} play={play} />
                  ))}
                </>
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
```

- [ ] **Step 4: Relabel the territory control**

In `components/catalogue/CatalogueFilters.tsx`, find the territory `<select>` and its label. Change the label text to `Available in`, and make sure the `<label>` is associated with the select by `htmlFor`/`id` so `getByLabel` finds it. Restyle every control for the ivory surface: `border border-ivory-shade bg-ivory px-3 py-2 text-onyx` on inputs and selects, and `text-[0.65rem] font-medium tracking-[0.3em] uppercase text-unavailable` on labels. Do not change any control's `name` attribute — `parseFilters` depends on them.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx playwright test tests/e2e/catalogue.spec.ts`
Expected: PASS, all 5 tests.

- [ ] **Step 6: Commit**

```bash
git add app/plays/page.tsx components/catalogue/CatalogueFilters.tsx tests/e2e/catalogue.spec.ts
git commit -m "feat(south-canon): restyle the catalogue and label the territory filter honestly"
```

---

## Task 13: Mobile filter sheet

**Files:**
- Create: `components/catalogue/FilterSheet.tsx`
- Modify: `app/plays/page.tsx` (wrap the aside)
- Test: `tests/e2e/catalogue-mobile.spec.ts` (create)

**Interfaces:**
- Consumes: nothing from `CatalogueFilters` beyond rendering it as `children`.
- Produces: `FilterSheet({ children, activeCount })` — a client component that renders `children` inline at `md` and above, and behind a bottom-sheet trigger below `md`.

This closes the first of the two mobile requirements from the original spec §6 that were never built.

- [ ] **Step 1: Write the failing test**

Create `tests/e2e/catalogue-mobile.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test.use({ viewport: { width: 375, height: 812 } })

test('filters are behind a sheet on mobile', async ({ page }) => {
  await page.goto('/plays')
  const trigger = page.getByRole('button', { name: /Filter/i })
  await expect(trigger).toBeVisible()

  await trigger.click()
  await expect(page.getByRole('dialog', { name: /Filter the catalogue/i })).toBeVisible()
})

test('the sheet closes and keeps the applied filter', async ({ page }) => {
  await page.goto('/plays?genre=Drama')
  await page.getByRole('button', { name: /Filter/i }).click()
  await page.getByRole('button', { name: /Close/i }).click()
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page).toHaveURL(/genre=Drama/)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/e2e/catalogue-mobile.spec.ts`
Expected: FAIL — no Filter button.

- [ ] **Step 3: Create `components/catalogue/FilterSheet.tsx`**

```tsx
'use client'

import { useEffect, useState } from 'react'

/**
 * Below md the filters live in a bottom sheet; at md and above they render inline
 * in the sticky sidebar exactly as before. The controls themselves are unchanged —
 * this only decides where they appear.
 */
export function FilterSheet({
  children,
  activeCount,
}: {
  children: React.ReactNode
  activeCount: number
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      {/* Desktop: inline, unchanged. */}
      <div className="hidden md:block">{children}</div>

      {/* Mobile: trigger + sheet. */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full border border-ivory-shade px-5 py-4 text-[0.65rem] font-medium tracking-[0.3em] text-onyx uppercase"
        >
          Filter{activeCount > 0 ? ` (${activeCount})` : ''}
        </button>

        {open && (
          <div className="fixed inset-0 z-50">
            <button
              type="button"
              aria-label="Close filters"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-onyx-deep/70"
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Filter the catalogue"
              className="absolute inset-x-0 bottom-0 max-h-[85svh] overflow-y-auto bg-ivory p-6 text-onyx"
            >
              <div className="flex items-center justify-between">
                <p className="text-[0.65rem] font-medium tracking-[0.3em] text-unavailable uppercase">
                  Filter the catalogue
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-[0.65rem] font-medium tracking-[0.3em] text-canon-red-deep uppercase"
                >
                  Close
                </button>
              </div>
              <div className="mt-6">{children}</div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
```

- [ ] **Step 4: Wrap the filters in `app/plays/page.tsx`**

Add the import, compute the active count, and wrap:

```tsx
import { FilterSheet } from '@/components/catalogue/FilterSheet'

// inside the component, after `filters` is parsed:
const activeCount =
  filters.genres.length +
  (filters.q ? 1 : 0) +
  (filters.playwright ? 1 : 0) +
  (filters.castMax ? 1 : 0) +
  (filters.durationMax ? 1 : 0) +
  (filters.territory ? 1 : 0)
```

```tsx
<aside className="md:sticky md:top-8 md:self-start">
  <FilterSheet activeCount={activeCount}>
    <CatalogueFilters filters={filters} genres={genres} playwrights={playwrights} />
  </FilterSheet>
</aside>
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx playwright test tests/e2e/catalogue-mobile.spec.ts`
Expected: PASS, 2 tests.

- [ ] **Step 6: Verify desktop is unaffected**

Run: `npx playwright test tests/e2e/catalogue.spec.ts`
Expected: PASS, all 5 tests.

- [ ] **Step 7: Commit**

```bash
git add components/catalogue/FilterSheet.tsx app/plays/page.tsx tests/e2e/catalogue-mobile.spec.ts
git commit -m "feat(south-canon): put catalogue filters in a bottom sheet on mobile"
```

---

## Task 14: Play detail — onyx hero and the ivory programme column

**Files:**
- Modify: `app/plays/[slug]/page.tsx`
- Modify: `components/play/PlayHero.tsx`
- Modify: `components/play/AtAGlance.tsx`
- Modify: `components/play/Synopsis.tsx`
- Test: `tests/e2e/play-detail.spec.ts` (extend)

**Interfaces:**
- Consumes: `PlayDetail` (`lib/types.ts:96-113`), `AvailabilityBadge` with `surface="dark"` (Task 1), `Rule`, `Container`.
- Produces: the page's two-surface structure, which Tasks 15 and 16 fill in.

- [ ] **Step 1: Write the failing test**

Append to `tests/e2e/play-detail.spec.ts`:

```ts
test('the play hero sits on the dark surface and the programme on the light one', async ({
  page,
}) => {
  await page.goto('/plays/saturday-night-at-the-palace')
  const hero = page.getByTestId('play-hero')
  const programme = page.getByTestId('play-programme')
  await expect(hero).toBeVisible()
  await expect(programme).toBeVisible()

  const heroBg = await hero.evaluate((el) => getComputedStyle(el).backgroundColor)
  const progBg = await programme.evaluate((el) => getComputedStyle(el).backgroundColor)
  expect(heroBg).not.toBe(progBg)
})

test('prose is capped so long synopses stay readable', async ({ page }) => {
  await page.goto('/plays/saturday-night-at-the-palace')
  const width = await page
    .getByTestId('play-prose')
    .evaluate((el) => el.getBoundingClientRect().width)
  expect(width).toBeLessThan(760)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/e2e/play-detail.spec.ts`
Expected: FAIL — no such test ids.

- [ ] **Step 3: Restructure `app/plays/[slug]/page.tsx`**

Replace the returned JSX (keeping all the data fetching above it exactly as it is) with:

```tsx
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(playSchema(play)) }}
      />

      <section data-testid="play-hero" className="bg-onyx">
        <Container className="py-16 md:py-24">
          <PlayHero play={play} />
        </Container>
      </section>

      <section data-testid="play-programme" className="bg-ivory text-onyx">
        <Container className="py-16 md:py-24">
          <div className="space-y-20">
            <AtAGlance play={play} />
            <div data-testid="play-prose" className="max-w-[62ch]">
              <Synopsis play={play} />
            </div>
            <Characters roles={play.roles} />
            {(play.setting || play.timePeriod) && (
              <section>
                <h2 className="font-display text-3xl">Setting</h2>
                <div className="mt-4">
                  <Rule surface="shade" width="full" />
                </div>
                {play.setting && <p className="mt-6 max-w-[62ch]">{play.setting}</p>}
                {play.timePeriod && <p className="mt-2 text-onyx/60">{play.timePeriod}</p>}
              </section>
            )}
            <ProductionHistory productions={play.productions} />
            <PressQuotes press={play.press} />
            <MediaGallery media={play.media} />
            <LicensingPanel tiers={tiers} />
            <RightsTable rights={play.rights} />
            {primary && <PlaywrightCard playwright={primary} />}
            <RelatedPlays plays={related} />
          </div>
        </Container>
      </section>
    </>
  )
```

Add `import { Rule } from '@/components/ui/Rule'`.

- [ ] **Step 4: Restyle `components/play/PlayHero.tsx` for the dark surface**

Set the title with `font-display` at `clamp(2.25rem, 6vw, 4.5rem)`, credits and the at-a-glance strip in the `text-[0.65rem] font-medium tracking-[0.3em] uppercase text-ivory/50` idiom, the logline in `italic text-ivory/70`, a `<Rule />` between title block and logline, and `<AvailabilityBadge surface="dark" />` wherever a badge appears. Any image uses `duotone-wrap` + `duotone`. Remove any `text-muted`, `text-accent`, `border-rule` class — those are the retired tokens.

- [ ] **Step 5: Restyle `AtAGlance` and `Synopsis` for the ivory surface**

`AtAGlance`: a definition list with `dt` in the label idiom (`text-[0.65rem] tracking-[0.3em] uppercase text-unavailable`) and `dd` in `font-display text-xl`. `Synopsis`: prose at `text-[1.125rem] leading-[1.75]`, paragraphs separated with `space-y-4` (visible paragraph spacing is a standing requirement on this account), headings `font-display text-3xl` followed by `<Rule surface="shade" width="full" />`.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx playwright test tests/e2e/play-detail.spec.ts`
Expected: PASS, including the pre-existing `'omits blocks that have no data'` and `'shows availability by territory'` tests.

- [ ] **Step 7: Commit**

```bash
git add app/plays/\[slug\]/page.tsx components/play/PlayHero.tsx components/play/AtAGlance.tsx components/play/Synopsis.tsx tests/e2e/play-detail.spec.ts
git commit -m "feat(south-canon): give the play page a dark hero and an ivory programme column"
```

---

## Task 15: Play detail — cast page, press quotes, production timeline, gallery

**Files:**
- Modify: `components/play/Characters.tsx`
- Modify: `components/play/PressQuotes.tsx`
- Modify: `components/play/ProductionHistory.tsx`
- Modify: `components/play/MediaGallery.tsx`
- Test: `tests/e2e/play-detail.spec.ts` (extend)

**Interfaces:**
- Consumes: `CastRole` (`lib/types.ts:31-39`), `PressQuote` (`lib/types.ts:48-53`), `Production` (`lib/types.ts:55-66`), `PlayMedia` (`lib/types.ts:41-46`).
- Produces: no signature changes — all four keep their existing props.

- [ ] **Step 1: Write the failing test**

Append to `tests/e2e/play-detail.spec.ts`:

```ts
test('the cast reads as a cast page, in two columns on desktop', async ({ page }) => {
  await page.goto('/plays/saturday-night-at-the-palace')
  const list = page.getByTestId('cast-list')
  await expect(list).toBeVisible()
  const columns = await list.evaluate((el) => getComputedStyle(el).gridTemplateColumns)
  expect(columns.split(' ').length).toBe(2)
})

test('a premiere is marked in the production history', async ({ page }) => {
  await page.goto('/plays/saturday-night-at-the-palace')
  const history = page.getByTestId('production-history')
  if (await history.isVisible()) {
    await expect(history.getByText(/Premiere/i).first()).toBeVisible()
  }
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/e2e/play-detail.spec.ts`
Expected: the cast test FAILS — no `cast-list` test id.

- [ ] **Step 3: Rewrite `components/play/Characters.tsx`**

```tsx
import { Rule } from '@/components/ui/Rule'
import type { CastRole } from '@/lib/types'

const GENDER_LABEL: Record<CastRole['gender'], string> = {
  male: 'M',
  female: 'F',
  any: 'Any',
}

/** Set as a printed cast page, not a bullet list. */
export function Characters({ roles }: { roles: CastRole[] }) {
  if (roles.length === 0) return null

  return (
    <section>
      <h2 className="font-display text-3xl">Characters</h2>
      <div className="mt-4">
        <Rule surface="shade" width="full" />
      </div>
      <dl data-testid="cast-list" className="mt-8 grid gap-x-12 gap-y-7 md:grid-cols-2">
        {roles.map((role) => (
          <div key={role.id} className="border-b border-ivory-shade pb-5">
            <dt className="font-display text-xl">
              {role.name}
              {role.isEnsemble && (
                <span className="ml-3 text-[0.65rem] font-medium tracking-[0.3em] text-unavailable uppercase">
                  Ensemble
                </span>
              )}
            </dt>
            <dd className="mt-2 text-[0.65rem] font-medium tracking-[0.3em] text-unavailable uppercase">
              {[GENDER_LABEL[role.gender], role.ageRange].filter(Boolean).join(' · ')}
            </dd>
            {role.description && (
              <dd className="mt-3 text-base leading-relaxed text-onyx/70">{role.description}</dd>
            )}
          </div>
        ))}
      </dl>
    </section>
  )
}
```

- [ ] **Step 4: Rewrite `components/play/PressQuotes.tsx`**

```tsx
import { Rule } from '@/components/ui/Rule'
import type { PressQuote } from '@/lib/types'

/** The strongest free credibility on the site — set like pull quotes, not body copy. */
export function PressQuotes({ press }: { press: PressQuote[] }) {
  if (press.length === 0) return null

  return (
    <section>
      <h2 className="font-display text-3xl">Press</h2>
      <div className="mt-4">
        <Rule surface="shade" width="full" />
      </div>
      <div className="mt-10 space-y-12">
        {press.map((q) => (
          <figure key={q.id} className="max-w-[62ch]">
            <blockquote className="font-display text-2xl leading-[1.4] italic md:text-3xl">
              &ldquo;{q.quote}&rdquo;
            </blockquote>
            <div className="mt-5">
              <Rule />
            </div>
            <figcaption className="mt-4 text-[0.65rem] font-medium tracking-[0.3em] text-unavailable uppercase">
              {q.source}
              {q.publishedAt ? ` · ${new Date(q.publishedAt).getFullYear()}` : ''}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Restyle `ProductionHistory` as a timeline**

Add `data-testid="production-history"` to the section. Render each production as a row with a left rule, the company in `font-display text-xl`, venue/city/country and dates in the label idiom, and — when `isPremiere` is true — a `Premiere` marker in `text-canon-red-deep` using the label idiom. Keep the existing sort (premiere first, then most recent), which `getPlayBySlug` already applies.

- [ ] **Step 6: Restyle `MediaGallery` with duotone thumbnails**

Wrap each thumbnail in `duotone-wrap` with the image carrying `cue-spotlight-image duotone`, and put `cue-spotlight` on the enclosing link or figure so hover resolves it to full colour. Keep the existing alt-text pattern — never describe stock imagery as a real production photograph.

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npx playwright test tests/e2e/play-detail.spec.ts`
Expected: PASS, all tests.

- [ ] **Step 8: Commit**

```bash
git add components/play/ tests/e2e/play-detail.spec.ts
git commit -m "feat(south-canon): set the cast page, press quotes, timeline and gallery"
```

---

## Task 16: Play detail — licensing inset panel and mobile sticky CTA

**Files:**
- Modify: `components/play/LicensingPanel.tsx`
- Modify: `components/play/RightsTable.tsx`
- Modify: `app/plays/[slug]/page.tsx` (add the sticky bar)
- Test: `tests/e2e/play-detail-mobile.spec.ts` (create)

**Interfaces:**
- Consumes: `LicenceTier` (`lib/types.ts:78-85`), `RightsRow` (`lib/types.ts:87-95`), `AvailabilityBadge`, `TERRITORIES`.
- Produces: the sticky enquire bar, closing the second of the two spec §6 mobile requirements.

- [ ] **Step 1: Write the failing test**

Create `tests/e2e/play-detail-mobile.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test.use({ viewport: { width: 375, height: 812 } })

test('a sticky enquire bar is pinned on mobile', async ({ page }) => {
  await page.goto('/plays/saturday-night-at-the-palace')
  const bar = page.getByTestId('enquire-bar')
  await expect(bar).toBeVisible()

  const position = await bar.evaluate((el) => getComputedStyle(el).position)
  expect(position).toBe('fixed')

  await page.mouse.wheel(0, 2000)
  await expect(bar).toBeVisible()
})

test('the enquire bar is not pinned on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/plays/saturday-night-at-the-palace')
  await expect(page.getByTestId('enquire-bar')).toBeHidden()
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/e2e/play-detail-mobile.spec.ts`
Expected: FAIL — no `enquire-bar`.

- [ ] **Step 3: Make `LicensingPanel` and `RightsTable` an onyx inset**

Wrap both in the one permitted surface inversion — an `onyx-lift` panel inside the ivory column. In `LicensingPanel.tsx`, wrap the section in:

```tsx
<div className="bg-onyx-lift p-8 text-ivory md:p-12">
```

with the heading `font-display text-3xl`, `<Rule />` beneath it, tier labels in the label idiom, and fees/royalties in `font-display text-2xl`. In `RightsTable.tsx`, use the same wrapper, table headers in `text-[0.65rem] tracking-[0.3em] uppercase text-ivory/40`, row borders `border-ivory/10`, and `<AvailabilityBadge surface="dark" />` for every status cell.

- [ ] **Step 4: Add the sticky bar to `app/plays/[slug]/page.tsx`**

Append inside the outer fragment, after the programme `</section>`:

```tsx
<div
  data-testid="enquire-bar"
  className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-ivory/10 bg-onyx-deep px-5 py-4 md:hidden"
>
  <div className="min-w-0">
    <p className="truncate font-display text-lg text-ivory">{play.title}</p>
    <p className="text-[0.65rem] font-medium tracking-[0.3em] text-ivory/40 uppercase">
      Licensing enquiry
    </p>
  </div>
  <Link
    href={`/contact?play=${play.slug}`}
    className="shrink-0 border border-canon-red bg-canon-red px-5 py-3 text-[0.65rem] font-medium tracking-[0.25em] text-onyx uppercase"
  >
    Enquire
  </Link>
</div>
```

Add `import Link from 'next/link'`. Add `pb-28 md:pb-0` to the programme section's `Container` so the bar never covers the last row of content.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx playwright test tests/e2e/play-detail-mobile.spec.ts tests/e2e/play-detail.spec.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/play/LicensingPanel.tsx components/play/RightsTable.tsx app/plays/\[slug\]/page.tsx tests/e2e/play-detail-mobile.spec.ts
git commit -m "feat(south-canon): inset the licensing panel and pin an enquire bar on mobile"
```

---

## Task 17: Playwright index and detail

**Files:**
- Modify: `app/playwrights/page.tsx`
- Modify: `app/playwrights/[slug]/page.tsx`
- Modify: `components/play/PlaywrightCard.tsx`
- Test: `tests/e2e/pages.spec.ts` (extend)

**Interfaces:**
- Consumes: `Playwright` / `PlaywrightDetail` (`lib/types.ts:6-15`, `:115`), `PlayRow` (Task 5), `Rule`, `Container`.

- [ ] **Step 1: Write the failing test**

Append to `tests/e2e/pages.spec.ts`:

```ts
test('a playwright page leads with a dark hero and lists their plays', async ({ page }) => {
  await page.goto('/playwrights/paul-slabolepszy')
  await expect(page.getByTestId('playwright-hero')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Paul Slabolepszy' })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Saturday Night at the Palace' }),
  ).toBeVisible()
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/e2e/pages.spec.ts`
Expected: FAIL — no `playwright-hero`.

- [ ] **Step 3: Rewrite `app/playwrights/[slug]/page.tsx`**

Keep the existing data fetching and `notFound()` handling. Replace the JSX with an onyx hero section carrying `data-testid="playwright-hero"` — duotone portrait in a `duotone-wrap` (only when `portraitUrl` exists; Paul Slabolepszy's is deliberately `NULL` and must stay so), name in `font-display` at `clamp(2.25rem, 6vw, 4.5rem)`, country and represented-since in the label idiom, honours as a list in the label idiom separated by `·`, and a `<Rule />`. Then an ivory section with the bio at `text-[1.125rem] leading-[1.75] max-w-[62ch]` using `space-y-4` between paragraphs, followed by their plays rendered with `<PlayRow />` under a `From the catalogue` heading and a full-width shade rule.

- [ ] **Step 4: Rewrite `app/playwrights/page.tsx`**

An onyx band with the heading and count, then an ivory section with the same portrait-card grid used in homepage scene 4 (`cue-spotlight` + `duotone`), linking each to `/playwrights/[slug]`.

- [ ] **Step 5: Restyle `components/play/PlaywrightCard.tsx`**

This renders inside the ivory programme column on play pages. Portrait in `duotone-wrap`, name `font-display text-2xl`, honours in the label idiom, a `<Rule surface="shade" width="full" />` above it, and a link to the playwright page in `text-canon-red-deep` using the label idiom.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx playwright test tests/e2e/pages.spec.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/playwrights/ components/play/PlaywrightCard.tsx tests/e2e/pages.spec.ts
git commit -m "feat(south-canon): rebuild the playwright index and detail pages"
```

---

# Phase 4 — About, contact, legal, admin, cleanup

## Task 18: About and contact

**Files:**
- Modify: `app/about/page.tsx`
- Modify: `app/contact/page.tsx`
- Test: `tests/e2e/pages.spec.ts` (extend)

**Interfaces:**
- Consumes: `Rule`, `Container`. The contact form's existing submit action and field `name` attributes must not change.

- [ ] **Step 1: Write the failing test**

Append to `tests/e2e/pages.spec.ts`:

```ts
test('the contact form keeps its anti-bot fields', async ({ page }) => {
  await page.goto('/contact')
  // Honeypot must exist and be hidden from real users.
  const honeypot = page.locator('input[name="website"], input[name="company_website"]').first()
  await expect(honeypot).toBeHidden()
})

test('about makes the case to writers', async ({ page }) => {
  await page.goto('/about')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})
```

- [ ] **Step 2: Run the test to verify it fails or passes**

Run: `npx playwright test tests/e2e/pages.spec.ts`
Expected: If the honeypot test fails, the contact form is missing the standing anti-bot requirement — add a hidden honeypot input plus a timestamp field checked server-side, matching the pattern used in the `lublaw` project's `ContactForm`. Do not add a CAPTCHA.

- [ ] **Step 3: Restyle `app/about/page.tsx`**

Onyx throughout — this page is argument, not reference. Statement heading at `clamp(2.25rem, 6vw, 4.5rem)` in `font-display` with an italic second clause, `<Rule />`, body at `text-lg leading-relaxed text-ivory/60` with `space-y-4` between paragraphs, section labels in the label idiom, closing with a link to `/contact` styled as the canon-red button from homepage scene 1. State the administrative contrast — slow permissions, opaque royalties, writers not knowing what they earned — without naming DALRO.

- [ ] **Step 4: Restyle `app/contact/page.tsx`**

An onyx band with the heading, then an ivory form panel: labels in the label idiom, inputs `border border-ivory-shade bg-ivory px-4 py-3 text-onyx`, submit button in canon-red. Preserve every existing field `name`, the honeypot, and the timing field.

- [ ] **Step 5: Run the tests and the build**

Run: `npx playwright test tests/e2e/pages.spec.ts && npm run build && npm run lint`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add app/about/page.tsx app/contact/page.tsx tests/e2e/pages.spec.ts
git commit -m "feat(south-canon): restyle about and contact"
```

---

## Task 19: Legal holding pages

**Files:**
- Create: `app/privacy/page.tsx`
- Create: `app/terms/page.tsx`
- Test: `tests/e2e/pages.spec.ts` (extend)

**Interfaces:**
- Consumes: `Rule`, `Container`.

**Constraint:** no invented policy text. A fabricated privacy policy is a POPIA representation the client never made — worse than an absent one.

- [ ] **Step 1: Write the failing test**

Append to `tests/e2e/pages.spec.ts`:

```ts
for (const path of ['/privacy', '/terms']) {
  test(`${path} does not 404 from the footer`, async ({ page }) => {
    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByText(/being finalised/i)).toBeVisible()
  })
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/e2e/pages.spec.ts`
Expected: FAIL with 404.

- [ ] **Step 3: Create `app/privacy/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { Rule } from '@/components/ui/Rule'

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'How South Canon handles personal information.',
}

export default function PrivacyPage() {
  return (
    <section className="bg-onyx">
      <Container className="py-24 md:py-32">
        <p className="text-[0.65rem] font-medium tracking-[0.4em] text-canon-red uppercase">
          Legal
        </p>
        <h1
          className="font-display mt-6 leading-[1.05] font-normal"
          style={{ fontSize: 'clamp(2.25rem, 6vw, 4.5rem)' }}
        >
          Privacy
        </h1>
        <div className="mt-8">
          <Rule />
        </div>
        <div className="mt-10 max-w-[62ch] space-y-4 text-lg leading-relaxed text-ivory/60">
          <p>
            Our privacy policy is being finalised and will be published here before the catalogue
            opens to the public.
          </p>
          <p>
            In the meantime, if you would like to know what personal information we hold about you,
            how it is used, or would like it removed, write to us and we will answer directly.
          </p>
        </div>
        <a
          href="/contact"
          className="mt-12 inline-block border border-ivory/25 px-8 py-4 text-[0.65rem] font-medium tracking-[0.25em] text-ivory uppercase transition-colors hover:border-ivory"
        >
          Contact us
        </a>
      </Container>
    </section>
  )
}
```

- [ ] **Step 4: Create `app/terms/page.tsx`**

Identical structure, with `title: 'Terms'`, the `<h1>` reading `Terms`, and the body:

```tsx
<p>
  Our terms of use are being finalised and will be published here before the catalogue opens to
  the public.
</p>
<p>
  Licensing terms for any individual production are set out in the licence itself, which is
  issued and signed for each performance run. Nothing on this site constitutes a licence or an
  offer to license.
</p>
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx playwright test tests/e2e/pages.spec.ts`
Expected: PASS, both new tests.

- [ ] **Step 6: Commit**

```bash
git add app/privacy/page.tsx app/terms/page.tsx tests/e2e/pages.spec.ts
git commit -m "feat(south-canon): add legal holding pages so footer links stop 404ing"
```

---

## Task 20: Admin restyle and the missing sign-out

**Files:**
- Modify: `app/admin/login/page.tsx`, `app/admin/plays/page.tsx`, `app/admin/plays/[id]/page.tsx`, `app/admin/playwrights/page.tsx`, `app/admin/playwrights/[id]/page.tsx`, `app/admin/reset/page.tsx`
- Modify: `components/admin/PlayForm.tsx`, `components/admin/PlaywrightForm.tsx`, `components/admin/RepeaterField.tsx`, `components/admin/DeleteButton.tsx`
- Create: `app/admin/signout/route.ts`
- Test: `tests/e2e/admin.spec.ts` (create)

**Interfaces:**
- Consumes: the shared tokens. Admin uses **no motion cues** beyond focus and hover states.
- Produces: `POST /admin/signout` — clears the Supabase session and redirects to `/admin/login`.

**Constraint:** this task changes presentation and adds sign-out only. Do not touch `requireAdmin()`, the server actions, `parseRepeater`, or `replaceChildren` — those carry the Critical-bug fixes from the M1 review.

- [ ] **Step 1: Write the failing test**

Create `tests/e2e/admin.spec.ts`:

```ts
import { test, expect } from '@playwright/test'

test('the admin login page is reachable and styled', async ({ page }) => {
  await page.goto('/admin/login')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const radius = await page
    .getByRole('button', { name: /sign in/i })
    .evaluate((el) => getComputedStyle(el).borderRadius)
  expect(radius).toBe('0px')
})

test('sign-out exists', async ({ page }) => {
  const response = await page.request.post('/admin/signout')
  // Either redirects or 401s for an unauthenticated caller — but must not 404.
  expect(response.status()).not.toBe(404)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx playwright test tests/e2e/admin.spec.ts`
Expected: the sign-out test FAILS with 404.

- [ ] **Step 3: Create `app/admin/signout/route.ts`**

Sign-out must clear the auth cookies, so it needs the cookie-aware `@supabase/ssr` client — the same construction `requireAdmin()` uses. `createServerClient` from `lib/supabase/server.ts` is the anon client with `persistSession: false` and would silently do nothing. The import is aliased because the two names collide.

```ts
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient as createCookieClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createCookieClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/admin/login', request.url), { status: 303 })
}
```

- [ ] **Step 4: Add the sign-out control to `app/admin/layout.tsx`**

The admin layout already exists. Add to its chrome:

```tsx
<form action="/admin/signout" method="post">
  <button
    type="submit"
    className="text-[0.65rem] font-medium tracking-[0.3em] text-ivory/60 uppercase hover:text-canon-red"
  >
    Sign out
  </button>
</form>
```

- [ ] **Step 5: Restyle the admin surfaces**

Onyx chrome (top bar and any sidebar) with `bg-onyx text-ivory` and nav in the label idiom. Content on `bg-ivory text-onyx`. Form controls: `border border-ivory-shade bg-ivory px-4 py-3 text-onyx`, labels in the label idiom, primary buttons `bg-canon-red text-onyx`, destructive actions `border border-canon-red-deep text-canon-red-deep`. Replace every `text-muted`, `text-accent`, `border-rule`, `bg-paper`, `text-ink` with its new equivalent. Headings use `font-display` only at `text-xl` and above.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx playwright test tests/e2e/admin.spec.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/admin/ components/admin/ tests/e2e/admin.spec.ts
git commit -m "feat(south-canon): restyle admin on the shared system and add sign-out"
```

---

## Task 21: Retire the legacy tokens and verify the whole site

**Files:**
- Modify: `app/globals.css`
- Test: all

- [ ] **Step 1: Find every remaining legacy-token reference**

Run: `grep -rnE "text-muted|text-accent|border-rule|bg-paper|text-ink|bg-accent|border-accent|hover:text-accent" app/ components/`
Expected: no output. If anything remains, replace it with the new-system equivalent before continuing — this step is the gate.

- [ ] **Step 2: Delete the legacy block from `app/globals.css`**

Remove these six lines and the comment above them:

```css
  --color-ink: #14110F;
  --color-paper: #FAF7F2;
  --color-accent: #A6431C;
  --color-muted: #6B635C;
  --color-rule: #E3DCD2;
```

(`--color-accent`'s value survives as `--color-canon-red-deep`.)

- [ ] **Step 3: Verify the build and every suite**

Run: `npm run build && npm run lint && npx vitest run && npx playwright test`
Expected: all green, no missing-class warnings.

- [ ] **Step 4: Verify the geometry law holds site-wide**

Create and run this one-off check, then delete it:

```ts
import { test, expect } from '@playwright/test'

test('nothing on the site has a rounded corner', async ({ page }) => {
  for (const path of ['/', '/plays', '/plays/saturday-night-at-the-palace', '/playwrights', '/about', '/contact']) {
    await page.goto(path)
    const rounded = await page.evaluate(() =>
      [...document.querySelectorAll('*')].filter((el) => {
        const r = getComputedStyle(el).borderRadius
        return r !== '' && r !== '0px'
      }).length,
    )
    expect(rounded, `rounded elements on ${path}`).toBe(0)
  }
})
```

- [ ] **Step 5: Manual verification pass**

Run `npm run dev` and check at 375px, 768px and 1440px:
- The overture plays once, lifts on scroll, and does not return on the next navigation.
- With `prefers-reduced-motion: reduce` set in devtools, every page is complete and readable, and the overture does not trap the viewport.
- Every onyx/ivory boundary is a hard edge.
- No text sits on a surface it was not designed for (light-surface greens on onyx, Bodoni below 20px, canon-red body copy on dark).

- [ ] **Step 6: Commit**

```bash
git add app/globals.css
git commit -m "chore(south-canon): retire the legacy editorial tokens"
```

---

## Deferred — not part of this plan

Carried forward from the spec's out-of-scope section. Do not do these here:

- The RLS-versus-service-role decision (migration 0007's policies are dead code).
- Transactional writes across the six tables the play form touches.
- The rights-holder/writer portal — needs its own spec, and must not drift into "phase 2".
- Real production photography.
- Any push or deploy decision. Nothing in this plan touches a remote.
