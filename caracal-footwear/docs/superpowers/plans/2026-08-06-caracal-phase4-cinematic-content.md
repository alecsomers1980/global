# Caracal Footwear — Phase 4: Cinematic Layer & Content — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the nine-beat cinematic homepage (GSAP ScrollTrigger), the `/signature` and `/story` cinematic pages, and the seven static content/legal pages, completing every route the Phase 1 spec lists except the two that depend on data Phase 5 creates.

**Architecture:** A small set of reusable motion primitives (`Reveal`, `ColourSweep`, `SignatureShowcase`) built once in `src/components/motion/`, then composed into homepage "beat" components and the `/signature` / `/story` pages. Motion is client-only, registered once, and every animated component checks `prefers-reduced-motion` at setup time and skips straight to the end state if it's set — this is a JS-level check because GSAP timelines are not covered by the CSS `@media (prefers-reduced-motion)` block already in `globals.css`. Static content pages (`/size-guide`, `/care`, `/contact`, `/faq`, `/shipping-returns`, `/privacy`, `/terms`) get zero motion, per spec §6 ("no motion on PDP, cart or checkout" generalises to: motion is opt-in per route, not default).

**Tech Stack:** Next.js 16.3.0 App Router, React 19.2.4, TypeScript strict, Tailwind CSS 4, GSAP 3 + ScrollTrigger (new dependency), existing `lib/queries/products.ts`, `lib/resend.ts`, `lib/money.ts`.

## Global Constraints

- Design tokens ONLY, never raw hex: `bg-canvas` `bg-surface` `bg-accent` `hover:bg-accent-hi` `text-text` `text-muted` `border-text/20` (or `/10`, `/30` per existing usage) — see `src/app/globals.css`. Primary buttons on `bg-accent` use `text-canvas`, never `text-text`.
- `catch (err)` with `err instanceof Error ? err.message : 'fallback'` — never `catch (err: any)`.
- All money stays integer cents internally; `formatZAR()` from `src/lib/money.ts` is the only place cents become a Rand string.
- Every content page is a Server Component unless it needs `useState`/`useEffect`/GSAP, matching the existing PDP/range pages.
- GSAP runs on `/`, `/signature`, `/story` only. No motion anywhere else in this phase.
- No fabricated brand claims: no Caracal Lodge connection (spec §10 Q2 default — none confirmed), no invented company registration number (spec §10 Q4 default — marked outstanding), no invented shoe-size measurements presented as exact (size guide uses standard published UK-size-to-foot-length figures, explicitly labelled "approximate", with a WhatsApp-to-confirm nudge).
- **Beats 7 (Reviews) and 8 (Journal teaser) from spec §6 are deliberately NOT built in this phase.** Both need tables (`reviews`, `journal_posts`) and an approved-content pipeline that Phase 5 creates; querying tables that don't exist yet would break the build, and rendering placeholder reviews/posts would be fabricated content. Phase 5's plan adds them as the last two homepage sections before the Footer. This phase's beat order is therefore: Hero → Colour sweep → Craft pillars → Signature teaser → Range grid → Size statement → Footer (global, already rendered by the `(storefront)` layout).
- Returns-window content: the spec has no client-confirmed returns policy. This plan defaults to **7 days from delivery, unworn, original packaging**, stated on `/shipping-returns` the same way the spec defaults the R99 delivery fee — clearly a working default. Flag it to Donald alongside the spec's existing open questions; do not present it as confirmed.

---

## Task 1: GSAP dependency and motion primitives

**Files:**
- Modify: `package.json` (add `gsap`)
- Create: `src/lib/motion/gsap.ts`
- Create: `src/components/motion/Reveal.tsx`

**Interfaces:**
- Produces: `getGSAP()` — registers `ScrollTrigger` exactly once and returns `{ gsap, ScrollTrigger }`; `prefersReducedMotion(): boolean`. Both are consumed by every other motion component in this plan.
- Produces: `<Reveal>` — a client component wrapping arbitrary children with a fade-up scroll-reveal. Props: `{ children: React.ReactNode; as？: keyof JSX.IntrinsicElements; className?: string; y?: number; delay?: number }`. Defaults: `as = 'div'`, `y = 24`, `delay = 0`.

- [ ] **Step 1: Install GSAP**

```bash
cd caracal-footwear
npm install gsap
```

Expected: `gsap` appears under `dependencies` in `package.json`, `package-lock.json` updated.

- [ ] **Step 2: Write the GSAP registration helper**

`src/lib/motion/gsap.ts`:

```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;

/**
 * Registers the ScrollTrigger plugin exactly once, however many components
 * call this. Safe to call from every client component that needs GSAP --
 * do not import 'gsap/ScrollTrigger' anywhere else.
 */
export function getGSAP() {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return { gsap, ScrollTrigger };
}

/**
 * True when the user has requested reduced motion. Checked at animation
 * setup time (not via a CSS media query) because GSAP timelines aren't
 * covered by the @media (prefers-reduced-motion) block in globals.css --
 * that block only cancels CSS animations/transitions.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
```

- [ ] **Step 3: Write the `Reveal` primitive**

`src/components/motion/Reveal.tsx`:

```tsx
'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { getGSAP, prefersReducedMotion } from '@/lib/motion/gsap';

interface RevealProps {
  children: ReactNode;
  as?: 'div' | 'section' | 'article' | 'li';
  className?: string;
  /** Pixels the element travels upward as it reveals. */
  y?: number;
  /** Seconds to wait before starting, for staggered groups. */
  delay?: number;
}

export default function Reveal({
  children,
  as: Tag = 'div',
  className,
  y = 24,
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      // No animation at all -- element is already at its final state
      // because we never set an initial hidden state below.
      return;
    }

    const { gsap, ScrollTrigger } = getGSAP();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [y, delay]);

  const Component = Tag as 'div';
  return (
    <Component ref={ref} className={className}>
      {children}
    </Component>
  );
}
```

Note: when `prefersReducedMotion()` is true, the `useEffect` returns before calling `gsap.fromTo`, so the element keeps its natural DOM opacity/position (1, 0) — there's no hidden-then-revealed flash, because we never set the "from" state outside of the animation call itself.

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit; echo "exit: $?"`
Expected: `exit: 0` (check the bare exit code — never pipe this through `tail`/`grep`, see project memory on why).

- [ ] **Step 5: Manual browser verification**

Run `npm run dev`, temporarily drop `<Reveal><p>test</p></Reveal>` into any existing page, scroll it into view, confirm it fades/slides in once. Then in Chrome DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce", reload, confirm it's visible immediately with no animation. Remove the temporary test markup before committing.

- [ ] **Step 6: Commit**

```bash
git add caracal-footwear/package.json caracal-footwear/package-lock.json caracal-footwear/src/lib/motion/gsap.ts caracal-footwear/src/components/motion/Reveal.tsx
git commit -m "feat(caracal): GSAP motion primitives (registration helper + Reveal)"
```

---

## Task 2: Bespoke motion components — ColourSweep and SignatureShowcase

**Files:**
- Create: `src/components/motion/ColourSweep.tsx`
- Create: `src/components/motion/SignatureShowcase.tsx`

**Interfaces:**
- Consumes: `getGSAP()`, `prefersReducedMotion()` from Task 1. Consumes `ProductWithVariants` type from `src/lib/supabase/types.ts`.
- Produces: `<ColourSweep colours={{ name: string; hex: string }[]} />` — homepage beat 2.
- Produces: `<SignatureShowcase products={ProductWithVariants[]} variant="teaser" | "full" />` — homepage beat 4 (`variant="teaser"`, first 3 products) and the full `/signature` page (`variant="full"`, all products). Both consumers pass already-fetched data; this component does no data fetching itself.

- [ ] **Step 1: Write `ColourSweep`**

Pinned horizontal scroll through colour swatches. On desktop this pins the section and translates a horizontal strip of swatches as the user scrolls down; on mobile (`prefers-reduced-motion` OR narrow viewport doesn't matter — GSAP ScrollTrigger's `matchMedia` handles breakpoints) it falls back to a plain horizontally-scrollable strip with no pin, since pinning a horizontal scroll inside a narrow viewport is a known bad-UX pattern on touch.

`src/components/motion/ColourSweep.tsx`:

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { getGSAP, prefersReducedMotion } from '@/lib/motion/gsap';

interface ColourSweepProps {
  colours: { name: string; hex: string }[];
}

export default function ColourSweep({ colours }: ColourSweepProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || prefersReducedMotion()) return;

    const { gsap, ScrollTrigger } = getGSAP();
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Desktop and up: pin the section and drive the strip horizontally.
      mm.add('(min-width: 768px)', () => {
        const distance = track.scrollWidth - section.clientWidth;
        if (distance <= 0) return;

        const tween = gsap.to(track, {
          x: -distance,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${distance}`,
            scrub: 1,
            pin: true,
          },
        });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      });
      // Below 768px: no ScrollTrigger at all -- the track is a plain
      // overflow-x-auto strip (see JSX), so it's swipeable natively.
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="relative overflow-hidden bg-surface py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-10">
        <p className="text-xs uppercase tracking-[0.35em] text-muted">Every colour</p>
        <h2 className="display mt-2 text-4xl md:text-5xl text-text">Six colours. One boot.</h2>
      </div>
      <div
        ref={trackRef}
        className="flex gap-6 px-4 md:px-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 [scrollbar-width:thin]"
      >
        {colours.map((colour) => (
          <div
            key={colour.name}
            className="shrink-0 w-56 md:w-72 flex flex-col items-center gap-4"
          >
            <div
              className="w-full aspect-square rounded-full border border-text/20"
              style={{ backgroundColor: colour.hex }}
              aria-hidden="true"
            />
            <span className="text-sm uppercase tracking-[0.2em] text-text">
              {colour.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `SignatureShowcase`**

`src/components/motion/SignatureShowcase.tsx`:

```tsx
'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getGSAP, prefersReducedMotion } from '@/lib/motion/gsap';
import type { ProductWithVariants } from '@/lib/supabase/types';
import { formatZAR } from '@/lib/money';

interface SignatureShowcaseProps {
  products: ProductWithVariants[];
  /** teaser = homepage beat (max 3, "View the collection" CTA at the end);
      full = every product, used on the standalone /signature page. */
  variant: 'teaser' | 'full';
}

export default function SignatureShowcase({ products, variant }: SignatureShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shown = variant === 'teaser' ? products.slice(0, 3) : products;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReducedMotion()) return;

    const { gsap, ScrollTrigger } = getGSAP();
    const ctx = gsap.context(() => {
      const panels = container.querySelectorAll<HTMLElement>('[data-signature-panel]');
      panels.forEach((panel) => {
        gsap.fromTo(
          panel,
          { opacity: 0, scale: 1.04 },
          {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: panel,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          },
        );
      });
    }, container);

    return () => ctx.revert();
  }, [shown.length]);

  return (
    <div ref={containerRef} className="bg-canvas">
      {shown.map((product) => {
        const image = product.images.find((i) => i.colour_name === null) ?? product.images[0];
        return (
          <div
            key={product.id}
            data-signature-panel
            className="relative min-h-[70vh] flex items-end overflow-hidden border-b border-accent/10"
          >
            {image && (
              <Image
                src={image.url}
                alt={image.alt || product.name}
                fill
                sizes="100vw"
                className="object-cover"
              />
            )}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/60 to-transparent"
            />
            <div className="relative max-w-7xl mx-auto w-full px-4 md:px-6 py-12">
              <p className="text-xs uppercase tracking-[0.35em] text-muted">
                {product.signature_type === 'wildlife' && 'Wildlife panel'}
                {product.signature_type === 'hide' && 'Game hide panel'}
                {product.signature_type === 'floral' && 'Floral panel'}
              </p>
              <h3 className="display mt-2 text-4xl md:text-5xl text-text">{product.name}</h3>
              <p className="mt-3 text-text">{formatZAR(product.base_price)}</p>
              <Link
                href={`/product/${product.slug}`}
                className="mt-6 inline-block rounded-md bg-accent px-6 py-3 text-sm uppercase tracking-[0.15em] text-canvas transition-colors hover:bg-accent-hi"
              >
                View this style
              </Link>
            </div>
          </div>
        );
      })}

      {variant === 'teaser' && (
        <div className="flex justify-center py-12 bg-canvas">
          <Link
            href="/signature"
            className="rounded-md border border-text/30 px-6 py-3 text-sm uppercase tracking-[0.15em] text-text transition-colors hover:border-text"
          >
            View the Signature Collection
          </Link>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit; echo "exit: $?"`
Expected: `exit: 0`

- [ ] **Step 4: Manual browser verification**

Cannot verify against real data until Task 5 (homepage) and Task 6 (`/signature`) wire these in — defer the live check to those tasks' verification steps. For now, confirm the file compiles and ESLint is clean: `npx eslint src/components/motion/ColourSweep.tsx src/components/motion/SignatureShowcase.tsx; echo "exit: $?"` → `exit: 0`.

- [ ] **Step 5: Commit**

```bash
git add caracal-footwear/src/components/motion/ColourSweep.tsx caracal-footwear/src/components/motion/SignatureShowcase.tsx
git commit -m "feat(caracal): ColourSweep and SignatureShowcase motion components"
```

---

## Task 3: Hero beat with mask reveal

**Files:**
- Create: `src/components/home/HeroBeat.tsx`
- Modify: `src/app/(storefront)/page.tsx:1-91` (hero JSX extracted into `HeroBeat`, called from the page)

**Interfaces:**
- Consumes: `getGSAP()`, `prefersReducedMotion()` from Task 1.
- Produces: `<HeroBeat leadTime={string} deliveryThreshold={number} />` (the `formatZAR` call and copy already in the current hero, unchanged — only the wrapper and the H1 animation are new).

- [ ] **Step 1: Extract the current hero into `HeroBeat`, add the mask reveal**

The existing hero JSX (lines 13-90 of the current `page.tsx`, already read into context) moves into this new client component almost verbatim — only change: the `<h1>` is wrapped so its two lines can mask-reveal on load (not on scroll — it's the very first thing seen, so this animates on mount, not via ScrollTrigger).

`src/components/home/HeroBeat.tsx`:

```tsx
'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getGSAP, prefersReducedMotion } from '@/lib/motion/gsap';
import { formatZAR } from '@/lib/money';

interface HeroBeatProps {
  leadTime: string;
  deliveryThreshold: number;
}

export default function HeroBeat({ leadTime, deliveryThreshold }: HeroBeatProps) {
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const { gsap } = getGSAP();
    const targets = [line1Ref.current, line2Ref.current].filter(Boolean);
    if (targets.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { yPercent: 110 },
        { yPercent: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12, delay: 0.2 },
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="relative flex min-h-[85vh] items-end overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/hero/wild-by-nature.webp"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="hero-drift object-cover object-left md:object-center"
        />
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/80 to-canvas/40 md:bg-gradient-to-r md:via-canvas/85 md:to-canvas/25"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-canvas to-transparent"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 md:px-6 py-20 md:py-28">
        <p className="text-xs uppercase tracking-[0.35em] text-muted">Caracal Footwear</p>

        <h1 className="display mt-5 text-6xl text-text sm:text-7xl lg:text-8xl">
          <span className="block overflow-hidden">
            <span ref={line1Ref} className="block">Wild by</span>
          </span>
          <span className="block overflow-hidden">
            <span ref={line2Ref} className="block">Nature</span>
          </span>
        </h1>

        <div className="mt-7 max-w-md space-y-4 text-muted">
          <p>Handcrafted vellies in genuine leather, on a non-slip TPR sole. Built to last.</p>
          <p>
            Sizes 4 to 15. Made to order in {leadTime}. Free delivery on orders over{' '}
            {formatZAR(deliveryThreshold)}.
          </p>
        </div>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/range"
            className="rounded-md bg-accent px-6 py-3 text-sm uppercase tracking-[0.15em] text-canvas transition-colors hover:bg-accent-hi"
          >
            Shop the range
          </Link>
          <Link
            href="/signature"
            className="rounded-md border border-text/30 px-6 py-3 text-sm uppercase tracking-[0.15em] text-text transition-colors hover:border-text"
          >
            Signature Collection
          </Link>
        </div>
      </div>
    </section>
  );
}
```

Each line is wrapped in an `overflow-hidden` span so the `yPercent: 110 → 0` translate reads as a mask reveal (line slides up from below its own box, clipped) rather than sliding in from off-canvas.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit; echo "exit: $?"`
Expected: `exit: 0` — will still fail here if `page.tsx` hasn't been updated yet; that happens in Task 5. If executing tasks in strict order, this step's typecheck may show the now-unused import in `page.tsx`; that's expected and resolved by Task 5. Skip a standalone check on this file alone if so, and confirm together with Task 5.

- [ ] **Step 3: Commit**

```bash
git add caracal-footwear/src/components/home/HeroBeat.tsx
git commit -m "feat(caracal): HeroBeat component with mask-reveal headline"
```

---

## Task 4: Supporting homepage beats — Craft Pillars, Range Grid, Size Statement

**Files:**
- Create: `src/components/home/CraftPillarsBeat.tsx`
- Create: `src/components/home/RangeGridBeat.tsx`
- Create: `src/components/home/SizeStatementBeat.tsx`

**Interfaces:**
- Consumes: `<Reveal>` from Task 1 (`src/components/motion/Reveal.tsx`). `ProductCard`-style category card pattern from `src/components/shop/ProductCard.tsx` (read for the fallback-icon pattern; do not import it, these are category cards not product cards). `CATEGORY_LABELS`, `CATEGORY_SLUGS`, `ALL_CATEGORIES` from `src/lib/supabase/types.ts`.
- Produces:
  - `<CraftPillarsBeat />` — no props, static content.
  - `<RangeGridBeat categories={{ category: ProductCategory; count: number; image: { url: string; alt: string } | null }[]} />`
  - `<SizeStatementBeat />` — no props, static content.

**DeepSeek delegation brief** (write this to a prompt file, run via `ds-run.js`/`ds-apply.js`, then review the diff against the Global Constraints before committing — same pipeline as Phase 3):

All three are Server Components (no `'use client'`) — they render inside a Server Component page and only need scroll-reveal via `<Reveal>`, which handles its own client boundary internally.

**`CraftPillarsBeat.tsx`** — three pillars over a full-bleed background image, matching beat 3 of spec §6 ("genuine leather · non-slip TPR sole · handmade, over a stitched-edge macro photograph"). No stitched-edge macro photo currently exists in `public/`, so use `public/products/classic-chukka-tan.webp` as the background (a real client photo, not a placeholder graphic) with a strong `bg-canvas/80` overlay so the three pillar cards stay legible — do not add any invented "macro leather" claim in copy, only the three known facts. Structure:

```tsx
import Image from 'next/image';
import Reveal from '@/components/motion/Reveal';

const PILLARS = [
  { title: 'Genuine Leather', body: 'Full-grain hide, hand-cut and hand-stitched. No synthetics.' },
  { title: 'Non-Slip TPR Sole', body: 'Built to grip on tar, dirt and everything between.' },
  { title: 'Handmade', body: 'Every pair made to order. Nothing off a factory line.' },
];

export default function CraftPillarsBeat() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0">
        <Image src="/products/classic-chukka-tan.webp" alt="" aria-hidden="true" fill sizes="100vw" className="object-cover" />
      </div>
      <div className="absolute inset-0 bg-canvas/85" aria-hidden="true" />
      <div className="relative max-w-5xl mx-auto px-4 md:px-6 grid gap-10 md:grid-cols-3">
        {PILLARS.map((pillar, i) => (
          <Reveal key={pillar.title} delay={i * 0.1}>
            <div className="text-center">
              <h3 className="display text-2xl text-text">{pillar.title}</h3>
              <p className="mt-3 text-sm text-muted">{pillar.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
```

**`RangeGridBeat.tsx`** — the four category cards (spec beat 5). Takes pre-fetched `categories` prop (this component does no data fetching — the page assembles it, see Task 5). Each card: category image (or the same icon-fallback pattern `ProductCard.tsx` uses when there's no image — a circle-with-two-triangles caracal-ear glyph, `text-accent/30`, centered, with the category label under it), category label, style count, links to `/range/[slug]`. Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`, wrap the whole grid in one `<Reveal>` (not per-card — four simultaneous cards reads better than a stagger here). Section heading: "The Range" (`display text-4xl md:text-5xl text-text`) with the eyebrow "Four styles, six colours, sizes 4 to 15" (`text-xs uppercase tracking-[0.35em] text-muted`), same eyebrow/heading pattern as `ColourSweep.tsx`. Card styling matches `ProductCard.tsx`'s surface/border/hover conventions (`bg-surface rounded-lg overflow-hidden border border-text/5 hover:border-accent transition-colors`, `aspect-[4/3]` image area).

**`SizeStatementBeat.tsx`** — beat 6, a single full-width statement, dark background, large centered display type. Exact copy: eyebrow "No order too small", headline "Sizes 4 to 15." (`display text-5xl md:text-7xl text-text`), one line under it: "Ladies to mens, we make every size in every colour we stock." Wrap the whole block in one `<Reveal>`. Padding `py-24`, centered text, `bg-canvas` (default, no special background needed — the surrounding beats already alternate `bg-canvas`/`bg-surface`, so confirm this beat sits on `bg-canvas` to keep the alternation going: Hero(canvas image) → ColourSweep(surface) → CraftPillars(canvas, image overlay) → SignatureShowcase(canvas) → RangeGrid(surface — set this explicitly, see Task 5 wrapping) → SizeStatement(canvas)).

- [ ] **Step 1: Generate all three files via DeepSeek from the brief above**, matching the exact code given for `CraftPillarsBeat.tsx` verbatim and following the prose spec for the other two.

- [ ] **Step 2: Review the diff against Global Constraints** — check every button/border against design tokens (no raw hex), check no `catch (err: any)`, check `RangeGridBeat` actually accepts the `categories` prop shape given above and does not fetch its own data.

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit; echo "exit: $?"` → `exit: 0`
Run: `npx eslint src/components/home/CraftPillarsBeat.tsx src/components/home/RangeGridBeat.tsx src/components/home/SizeStatementBeat.tsx; echo "exit: $?"` → `exit: 0`

- [ ] **Step 4: Commit**

```bash
git add caracal-footwear/src/components/home/CraftPillarsBeat.tsx caracal-footwear/src/components/home/RangeGridBeat.tsx caracal-footwear/src/components/home/SizeStatementBeat.tsx
git commit -m "feat(caracal): craft pillars, range grid and size statement homepage beats"
```

---

## Task 5: Assemble the homepage

**Files:**
- Modify: `src/app/(storefront)/page.tsx` (full rewrite — replaces the Phase-1 hero-only version)

**Interfaces:**
- Consumes: `listProducts({ signatureOnly: true })`, `listColours()`, `listProducts()`, `getSiteSettings()` from `src/lib/queries/products.ts`. `HeroBeat`, `CraftPillarsBeat`, `RangeGridBeat`, `SizeStatementBeat` from Task 3/4. `ColourSweep`, `SignatureShowcase` from Task 2. `ALL_CATEGORIES`, `CATEGORY_SLUGS` from `src/lib/supabase/types.ts`.

- [ ] **Step 1: Write the assembled homepage**

```tsx
import { listProducts, listColours, getSiteSettings } from '@/lib/queries/products';
import { ALL_CATEGORIES } from '@/lib/supabase/types';
import HeroBeat from '@/components/home/HeroBeat';
import ColourSweep from '@/components/motion/ColourSweep';
import CraftPillarsBeat from '@/components/home/CraftPillarsBeat';
import SignatureShowcase from '@/components/motion/SignatureShowcase';
import RangeGridBeat from '@/components/home/RangeGridBeat';
import SizeStatementBeat from '@/components/home/SizeStatementBeat';

/**
 * The cinematic nine-beat homepage (spec §6), minus beats 7 (Reviews) and 8
 * (Journal teaser) -- both need Phase 5 tables and are added there. Beat 9
 * (Footer) is already rendered globally by the (storefront) layout.
 */
export default async function Home() {
  const [settings, colours, signatureProducts, allProducts] = await Promise.all([
    getSiteSettings(),
    listColours(),
    listProducts({ signatureOnly: true }),
    listProducts(),
  ]);

  const categories = ALL_CATEGORIES.map((category) => {
    const inCategory = allProducts.filter((p) => p.category === category);
    const withImage = inCategory.find((p) => p.images.length > 0);
    const image = withImage
      ? {
          url:
            withImage.images.find((i) => i.colour_name === null)?.url ??
            withImage.images[0].url,
          alt: withImage.name,
        }
      : null;
    return { category, count: inCategory.length, image };
  });

  return (
    <>
      <HeroBeat
        leadTime={settings.lead_time}
        deliveryThreshold={Number(settings.delivery_free_threshold)}
      />
      <ColourSweep colours={colours} />
      <CraftPillarsBeat />
      {signatureProducts.length > 0 && (
        <SignatureShowcase products={signatureProducts} variant="teaser" />
      )}
      <div className="bg-surface">
        <RangeGridBeat categories={categories} />
      </div>
      <SizeStatementBeat />
    </>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit; echo "exit: $?"`
Expected: `exit: 0`

- [ ] **Step 3: Clean build**

Run: `npm run build`
Expected: succeeds; `/` should be prerendered as static (`○`) or ISR, not forced dynamic — it fetches from Supabase at build time same as the range/product pages already do. If the dev server is running, kill it first (Windows/OneDrive file-lock gotcha from Phase 3).

- [ ] **Step 4: Live browser verification**

`npm run dev`, load `/` at desktop width: confirm all six beats render in order with real data (six colours in the sweep, real signature products with their photos, four category cards with real counts). Scroll through and confirm each beat animates once on entry. Reload with DevTools reduced-motion emulation on: confirm everything is visible immediately, no jank, no invisible-forever elements (this is the failure mode to watch for — a `Reveal`-wrapped element stuck at `opacity: 0` because the reduced-motion branch was skipped incorrectly). Then resize to 390px width: confirm the colour sweep becomes a swipeable strip (not pinned/broken), the range grid stacks to one column, nothing overflows horizontally.

- [ ] **Step 5: Commit**

```bash
git add caracal-footwear/src/app/(storefront)/page.tsx
git commit -m "feat(caracal): assemble cinematic homepage from six beats"
```

---

## Task 6: `/signature` page

**Files:**
- Create: `src/app/(storefront)/signature/page.tsx`

**Interfaces:**
- Consumes: `listProducts({ signatureOnly: true })` from `src/lib/queries/products.ts`. `SignatureShowcase` from Task 2 (`variant="full"`).

**DeepSeek delegation brief:**

Server Component. Fetch `const products = await listProducts({ signatureOnly: true });`. Page structure: a short intro section above the showcase (not full-bleed image — plain `bg-canvas` section, `py-20`, `max-w-3xl mx-auto px-4 md:px-6 text-center`) with eyebrow "The Signature Collection" (`text-xs uppercase tracking-[0.35em] text-muted`), headline "Wildlife. Hide. Floral." (`display text-5xl md:text-6xl text-text mt-2`), one paragraph: "Airbrush wildlife art, game hide panels and floral work on the same handcrafted vellie base. No competitor in this market offers decorated vellies at this level — every piece here is one of Caracal's own designs." (`mt-5 text-muted`), then `<SignatureShowcase products={products} variant="full" />` below it. If `products.length === 0` (seed data missing signature items), render the intro section only plus a line: "The Signature Collection is being photographed — check back soon, or ask Donald directly." — do not fabricate placeholder products.

- [ ] **Step 1: Generate the file via DeepSeek from the brief above.**

- [ ] **Step 2: Review against Global Constraints** (tokens, no raw hex, correct import paths).

- [ ] **Step 3: Typecheck and build**

Run: `npx tsc --noEmit; echo "exit: $?"` → `exit: 0`
Run: `npm run build` → succeeds, `/signature` listed in output.

- [ ] **Step 4: Live browser verification**

`npm run dev`, load `/signature`: confirm every signature product shows (lion, leopard, buffalo, zebra, protea, succulent per the seeded photos in `public/products/`), each panel animates in on scroll, "View this style" links land on the correct PDP. Check 390px width: panels stack full-width, no horizontal overflow, text stays legible over the images.

- [ ] **Step 5: Commit**

```bash
git add caracal-footwear/src/app/(storefront)/signature/page.tsx
git commit -m "feat(caracal): /signature collection page"
```

---

## Task 7: `/story` page

**Files:**
- Create: `src/app/(storefront)/story/page.tsx`

**Interfaces:**
- Consumes: `<Reveal>` from Task 1.

**DeepSeek delegation brief:**

Server Component, static content (no data fetching — nothing in `site_settings` or `products` is needed). Cinematic but simple: a stack of full-bleed `Reveal`-wrapped sections alternating `bg-canvas`/`bg-surface`, each with an eyebrow + headline + one or two paragraphs, `max-w-2xl mx-auto px-4 md:px-6 py-24 text-center`. Use exactly this copy, in this order — do not add, invent, or embellish beyond it (no Caracal Lodge claim per spec §10 Q2 default):

1. Eyebrow "Wild by Nature" / Headline "An animal built to adapt" / Body: "The caracal is one of Africa's most adaptable wild cats — equally at home in mountain scrub, semi-desert and open grassland, and rarely seen despite ranging across most of the continent. That's the animal on our badge, and the standard we build to: footwear that goes wherever you go, and outlasts the ground it walks on."
2. Eyebrow "The Craft" / Headline "Handmade, not mass-produced" / Body: "Every pair starts as genuine leather, hand-cut and hand-stitched onto a non-slip TPR sole. Nothing here comes off a factory line — each style is made to order, which is also why we can offer sizes 4 to 15 without turning away a small order."
3. Eyebrow "The Signature Tier" / Headline "Wildlife, hide and floral, hand-finished" / Body: "Our Signature Collection carries airbrush wildlife art, game hide panels and floral work on the same handcrafted base as the rest of the range. It's the one thing in this market nobody else is doing at this level."
4. Closing CTA section (no `Reveal` wrapper needed here, keep it simple): headline "See the range" (`display text-4xl text-text`), a button linking to `/range` styled exactly like the Hero's primary CTA (`rounded-md bg-accent px-6 py-3 text-sm uppercase tracking-[0.15em] text-canvas transition-colors hover:bg-accent-hi`).

Alternate `bg-canvas` / `bg-surface` / `bg-canvas` / `bg-canvas` across the four sections in that order.

- [ ] **Step 1: Generate the file via DeepSeek using the exact copy above.**

- [ ] **Step 2: Review against Global Constraints** and confirm the copy matches verbatim (no added claims).

- [ ] **Step 3: Typecheck and build**

Run: `npx tsc --noEmit; echo "exit: $?"` → `exit: 0`
Run: `npm run build` → succeeds, `/story` listed.

- [ ] **Step 4: Live browser verification**

`npm run dev`, load `/story`: confirm four sections in order, each reveals on scroll, reduced-motion emulation shows everything immediately, 390px width has no overflow.

- [ ] **Step 5: Commit**

```bash
git add caracal-footwear/src/app/(storefront)/story/page.tsx
git commit -m "feat(caracal): /story brand page"
```

---

## Task 8: Contact anti-bot logic and API route

**Files:**
- Create: `src/lib/contact.ts`
- Create: `src/lib/contact.test.ts`
- Create: `src/app/api/contact/route.ts`

**Interfaces:**
- Consumes: `sendEmail`, `reportRecipient` from `src/lib/resend.ts` (already exist, Phase 2).
- Produces: `isSpamSubmission(honeypot: string, renderedAt: number, now: number): boolean` — pure function, consumed by the route. `POST /api/contact` — body `{ name: string; email: string; message: string; company: string; renderedAt: number }`, response `{ ok: true }` on success or honeypot/timing trip (bots get a fake success, per the Lublaw pattern already proven in this monorepo), `{ ok: false; error: string }` with non-2xx on validation/send failure.

- [ ] **Step 1: Write the failing test**

`src/lib/contact.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { isSpamSubmission } from './contact';

describe('isSpamSubmission', () => {
  it('flags a filled honeypot regardless of timing', () => {
    expect(isSpamSubmission('bot-filled-this', Date.now(), Date.now())).toBe(true);
  });

  it('flags a submission faster than the minimum interval', () => {
    const renderedAt = 1000;
    const now = renderedAt + 1000; // 1s later, under the 2.5s floor
    expect(isSpamSubmission('', renderedAt, now)).toBe(true);
  });

  it('allows a genuine submission with an empty honeypot and realistic timing', () => {
    const renderedAt = 1000;
    const now = renderedAt + 5000; // 5s later
    expect(isSpamSubmission('', renderedAt, now)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/contact.test.ts; echo "exit: $?"`
Expected: fails with "Cannot find module './contact'" or similar — the module doesn't exist yet.

- [ ] **Step 3: Write `src/lib/contact.ts`**

```ts
const MIN_SUBMIT_MS = 2500;

/**
 * True if this submission looks automated: the honeypot field was filled
 * (real visitors never see it), or the form was submitted faster than a
 * human could plausibly fill it in. Mirrors the pattern already proven in
 * the Lublaw ContactForm/api/contact route.
 */
export function isSpamSubmission(honeypot: string, renderedAt: number, now: number): boolean {
  if (honeypot.trim().length > 0) return true;
  return now - renderedAt < MIN_SUBMIT_MS;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/contact.test.ts; echo "exit: $?"`
Expected: `exit: 0`, 3 passed.

- [ ] **Step 5: Write the API route**

`src/app/api/contact/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { isSpamSubmission } from '@/lib/contact';
import { sendEmail, reportRecipient } from '@/lib/resend';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: { name?: string; email?: string; message?: string; company?: string; renderedAt?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();
  const message = String(body.message ?? '').trim();
  const honeypot = String(body.company ?? '');
  const renderedAt = typeof body.renderedAt === 'number' ? body.renderedAt : 0;

  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, error: 'Please fill in all fields.' }, { status: 400 });
  }

  if (isSpamSubmission(honeypot, renderedAt, Date.now())) {
    // Pretend success so the bot doesn't learn its submission was rejected.
    return NextResponse.json({ ok: true });
  }

  const to = reportRecipient();
  if (!to) {
    console.error('[contact] REPORT_RECIPIENT_EMAIL not configured');
    return NextResponse.json(
      { ok: false, error: 'Contact form is not yet configured. Please WhatsApp Donald directly.' },
      { status: 503 },
    );
  }

  const result = await sendEmail({
    to,
    replyTo: email,
    subject: `New enquiry from ${name}`,
    html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${message.replace(/\n/g, '<br>')}</p>`,
  });

  if (!result.success) {
    return NextResponse.json({ ok: false, error: 'Failed to send. Please try again.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit; echo "exit: $?"`
Expected: `exit: 0`

- [ ] **Step 7: Commit**

```bash
git add caracal-footwear/src/lib/contact.ts caracal-footwear/src/lib/contact.test.ts caracal-footwear/src/app/api/contact/route.ts
git commit -m "feat(caracal): contact API route with honeypot/timing anti-bot"
```

---

## Task 9: ContactForm component and `/contact` page

**Files:**
- Create: `src/components/contact/ContactForm.tsx`
- Create: `src/app/(storefront)/contact/page.tsx`

**Interfaces:**
- Consumes: `POST /api/contact` from Task 8 (body/response shape above).
- Produces: `<ContactForm />` — no props, self-contained client component.

**DeepSeek delegation brief:**

`ContactForm.tsx` mirrors `lublaw/src/components/ContactForm.tsx` almost exactly (already read into context) — same `useState(() => Date.now())` for `renderedAt`, same hidden honeypot field pattern (`absolute -left-[9999px]`, `aria-hidden`, `tabIndex={-1}`, field name `company`), same `idle | sending | sent | error` status machine, POSTs to `/api/contact` with `{ name, email, message, company, renderedAt }`. Re-skin to Caracal's dark tokens: inputs `w-full bg-canvas border border-text/20 rounded-md px-3 py-2 text-sm text-text` (matches `src/app/admin/settings/page.tsx`'s input styling exactly), labels `block text-sm text-text mb-1`, submit button `bg-accent text-canvas px-5 py-2 rounded hover:bg-accent-hi disabled:opacity-50 text-sm font-medium` reading "Send" / "Sending…", error text `text-sm text-accent`, success state replaces the form with `<p className="text-text">Thanks — Donald will be in touch soon.</p>`. `catch` blocks use `err instanceof Error` per Global Constraints, never `catch (err: any)`.

`/contact/page.tsx`: Server Component, `const settings = await getSiteSettings();` (from `src/lib/queries/products.ts`). Layout: `max-w-2xl mx-auto px-4 md:px-6 py-16`, heading `<h1 className="display text-4xl md:text-5xl text-text">Get In Touch</h1>`, one line under it: "Questions about sizing, an order, or a custom request — WhatsApp is fastest." (`mt-3 text-muted`), a WhatsApp button above the form (`href={`https://wa.me/${settings.whatsapp_number}`}`, styled like the Hero's secondary CTA: `rounded-md border border-text/30 px-6 py-3 text-sm uppercase tracking-[0.15em] text-text hover:border-text`), then `<div className="mt-10"><ContactForm /></div>`.

- [ ] **Step 1: Generate both files via DeepSeek from the brief above.**

- [ ] **Step 2: Review against Global Constraints** and confirm `catch` blocks and token usage are correct (this is the DeepSeek styling gotcha that recurred three times in Phase 3 — check every button/input class by hand before committing).

- [ ] **Step 3: Typecheck and build**

Run: `npx tsc --noEmit; echo "exit: $?"` → `exit: 0`
Run: `npm run build` → succeeds, `/contact` listed.

- [ ] **Step 4: Live browser verification**

`npm run dev`, load `/contact`. Submit the form with realistic typing speed (wait a few seconds before clicking submit) with `REPORT_RECIPIENT_EMAIL`/`RESEND_API_KEY` set in the environment — confirm the email arrives (or, if Resend isn't configured locally, confirm the console logs the skip message from `sendEmail` and the UI still shows success, matching the existing "sends are skipped and logged" behaviour documented in `.env.local.example`). Then use `page.evaluate` or DevTools to fill the hidden `company` field and submit — confirm the API returns `{ ok: true }` but no email is sent (check server logs show no Resend call). Then submit instantly (no delay) with an empty honeypot — confirm same fake-success, no email.

- [ ] **Step 5: Commit**

```bash
git add caracal-footwear/src/components/contact/ContactForm.tsx caracal-footwear/src/app/(storefront)/contact/page.tsx
git commit -m "feat(caracal): /contact page with anti-bot ContactForm"
```

---

## Task 10: `/size-guide` and `/care`

**Files:**
- Create: `src/app/(storefront)/size-guide/page.tsx`
- Create: `src/app/(storefront)/care/page.tsx`

**Interfaces:**
- Consumes: `getSiteSettings()` from `src/lib/queries/products.ts` (size-guide needs `whatsapp_number` for the "not sure, ask us" line).

**DeepSeek delegation brief:**

Both are static Server Components, no motion, layout `max-w-3xl mx-auto px-4 md:px-6 py-16`, heading pattern `<h1 className="display text-4xl md:text-5xl text-text">…</h1>`, body copy `mt-6 space-y-4 text-muted` (paragraph spacing per project standard), section headings within the page `text-xl text-text mt-10 mb-3`.

**`/size-guide`:** Heading "Size Guide". Intro paragraph: "Caracal vellies run true to standard UK sizing, from 4 (ladies) to 15 (mens)." Then a table (`<table>` with `border border-text/10`, `text-sm`, header row `bg-surface text-text`, body rows `text-muted`, alternating none — keep it plain) with two columns "UK Size" and "Foot Length (approx.)", one row per size 4–15 using these standard, published UK-size-to-foot-length figures (label the table caption "Approximate — foot shape varies, so if you're between two sizes, WhatsApp us your foot length and we'll help you choose."):

| UK Size | Foot Length |
|---|---|
| 4 | 22.9 cm |
| 5 | 23.6 cm |
| 6 | 24.3 cm |
| 7 | 25.1 cm |
| 8 | 25.8 cm |
| 9 | 26.7 cm |
| 10 | 27.3 cm |
| 11 | 28.0 cm |
| 12 | 28.6 cm |
| 13 | 29.4 cm |
| 14 | 30.2 cm |
| 15 | 31.0 cm |

Below the table, a "How to measure your foot" section: numbered steps — (1) place a sheet of paper on a hard floor against a wall, (2) stand on it with your heel against the wall, (3) mark the tip of your longest toe, (4) measure wall-to-mark in cm, (5) measure both feet and use the larger, (6) match to the table above. Close with: `const settings = await getSiteSettings();` then a line "Still unsure? WhatsApp us on {settings.whatsapp_number} with your measurement." rendered as a link `href={`https://wa.me/${settings.whatsapp_number}`}`.

**`/care`:** Heading "Leather Care". Sections (each `text-xl text-text mt-10 mb-3` heading + paragraph):
- "Before First Wear" — "Treat new leather with a wax or cream conditioner before its first outing. This builds water resistance and keeps the leather supple from day one."
- "Everyday Care" — "Brush off dust and dry dirt with a soft brush before conditioning. Wipe scuffs with a barely damp cloth, then let them dry naturally before conditioning again."
- "If They Get Wet" — "Stuff with paper to hold their shape and dry them at room temperature, away from direct heat or sunlight. Never dry leather on a heater or in direct sun — it dries the hide out and cracks it."
- "Storage" — "Store in a cool, dry place with some airflow, not crushed under other shoes. A shoe tree or balled paper inside helps them keep their shape between wears."

- [ ] **Step 1: Generate both files via DeepSeek from the brief above, using the exact table figures and copy given.**

- [ ] **Step 2: Review against Global Constraints** (tokens, no raw hex, paragraph spacing present per the project's paragraph-spacing standard).

- [ ] **Step 3: Typecheck and build**

Run: `npx tsc --noEmit; echo "exit: $?"` → `exit: 0`
Run: `npm run build` → succeeds, both routes listed.

- [ ] **Step 4: Live browser verification**

`npm run dev`, load both pages at desktop and 390px width: confirm the size-guide table doesn't overflow horizontally on mobile (wrap it in `overflow-x-auto` if the DeepSeek output didn't already), confirm the WhatsApp link opens the correct number.

- [ ] **Step 5: Commit**

```bash
git add "caracal-footwear/src/app/(storefront)/size-guide/page.tsx" "caracal-footwear/src/app/(storefront)/care/page.tsx"
git commit -m "feat(caracal): /size-guide and /care content pages"
```

---

## Task 11: `/faq` and `/shipping-returns`

**Files:**
- Create: `src/app/(storefront)/faq/page.tsx`
- Create: `src/app/(storefront)/shipping-returns/page.tsx`

**Interfaces:**
- Consumes: `getSiteSettings()` from `src/lib/queries/products.ts` — both pages pull real `lead_time`, `delivery_free_threshold`, `delivery_fee` rather than hardcoding numbers that would drift from what checkout actually charges.

**DeepSeek delegation brief:**

Same static layout convention as Task 10.

**`/faq`:** Heading "Frequently Asked Questions". `const settings = await getSiteSettings();`. Render as a list of Q/A pairs (`<h2 className="text-lg text-text mt-8 mb-2">` for the question, `<p className="text-muted">` for the answer):
- Q: "What sizes do you make?" A: "4 (ladies) to 15 (mens). No order is too small — see our full [Size Guide](/size-guide)."
- Q: "What are they made of?" A: "Genuine leather on a non-slip TPR sole, handmade to order."
- Q: "How long does delivery take?" A: `Made to order in {settings.lead_time}, then delivered countrywide by courier.` (real interpolation, not a hardcoded string).
- Q: "Is delivery free?" A: `` `Yes, on orders over ${formatZAR(Number(settings.delivery_free_threshold))}. Below that, delivery is a flat ${formatZAR(Number(settings.delivery_fee))}.` `` (import `formatZAR` from `@/lib/money`).
- Q: "Can I return or exchange a pair?" A: "Yes — see our [Shipping & Returns](/shipping-returns) page for the full policy."
- Q: "Do you have decorated or patterned vellies?" A: "Yes — our [Signature Collection](/signature) has wildlife, game hide and floral panel designs, each a one-off in this market."

Use actual `<Link>` components from `next/link` for the bracketed references above, not literal markdown syntax.

**`/shipping-returns`:** Heading "Shipping & Returns". Two sections:
- "Shipping" — `` `We deliver countrywide across South Africa. Every pair is made to order, with a lead time of ${settings.lead_time} before it ships. Delivery is free on orders over ${formatZAR(...)}; below that, a flat ${formatZAR(...)} delivery fee applies at checkout.` ``
- "Returns & Exchanges" — "If a pair doesn't fit or isn't right, contact us within 7 days of delivery to arrange a return or exchange. Items must be unworn, unused, and in their original packaging. WhatsApp or email us first — see our [Contact](/contact) page — and we'll confirm the process before you send anything back."

- [ ] **Step 1: Generate both files via DeepSeek from the brief above, with real `getSiteSettings()`/`formatZAR()` interpolation, not hardcoded numbers.**

- [ ] **Step 2: Review against Global Constraints**, and specifically confirm no page hardcodes a Rand figure that should come from `site_settings` — those values must stay live so Donald's admin edits (Phase 3 settings page) actually change what customers see here.

- [ ] **Step 3: Typecheck and build**

Run: `npx tsc --noEmit; echo "exit: $?"` → `exit: 0`
Run: `npm run build` → succeeds, both routes listed.

- [ ] **Step 4: Live browser verification**

`npm run dev`, load both pages, confirm the interpolated Rand/lead-time values match what's actually in `site_settings` (cross-check against `/admin/settings`). Change a value in `/admin/settings` (e.g. delivery fee), reload `/faq` and `/shipping-returns`, confirm the new value shows — then change it back to the original.

- [ ] **Step 5: Commit**

```bash
git add "caracal-footwear/src/app/(storefront)/faq/page.tsx" "caracal-footwear/src/app/(storefront)/shipping-returns/page.tsx"
git commit -m "feat(caracal): /faq and /shipping-returns content pages"
```

---

## Task 12: `/privacy` and `/terms`

**Files:**
- Create: `src/app/(storefront)/privacy/page.tsx`
- Create: `src/app/(storefront)/terms/page.tsx`

**Interfaces:**
- Consumes: `getSiteSettings()` for `contact_email` (the data-request contact point on the privacy page).

**DeepSeek delegation brief:**

Same static layout convention as Task 10/11. Both pages carry this exact line near the top, styled as a small notice (`text-xs text-muted border border-text/10 rounded-md px-4 py-3`): "Caracal Footwear's company registration number will be added here once confirmed." — per spec §10 Q4's explicit default ("pages ship with the legal structure in place and the registration line marked as outstanding"). Do not invent a registration number.

**`/privacy`:** Heading "Privacy Policy". Sections:
- "Information We Collect" — "When you place an order, we collect your name, email, phone number and delivery address. When you contact us or submit a review, we collect your name and email."
- "How We Use It" — "We use your information only to fulfil your order, communicate about it, and respond to enquiries. We do not sell or share your information with third parties for marketing."
- "Third-Party Processors" — "Payments are processed by PayFast. Order and account data is stored with Supabase. Transactional emails are sent via Resend. Each processes data only as needed to provide their service to us."
- "Cookies & Local Storage" — "Your shopping cart is stored in your browser's local storage, not a tracking cookie. We do not use third-party advertising trackers."
- "Your Rights" — `` `Under South Africa's POPIA, you can request access to, correction of, or deletion of your personal information. Contact us at ${settings.contact_email}.` ``

**`/terms`:** Heading "Terms & Conditions". Sections:
- "Orders & Pricing" — "All prices are shown in South African Rand (ZAR) and include VAT where applicable. We reserve the right to correct pricing errors before an order is confirmed as paid."
- "Payment" — "Payment is processed securely via PayFast. Your order is confirmed once payment is verified."
- "Made to Order" — `` `Every pair is handmade to order, with a lead time of ${settings.lead_time} before dispatch.` ``
- "Delivery" — "We deliver countrywide within South Africa only. See our Shipping & Returns page for full details."
- "Returns" — "See our Shipping & Returns page for our return and exchange policy."
- "Governing Law" — "These terms are governed by the laws of the Republic of South Africa."

- [ ] **Step 1: Generate both files via DeepSeek from the brief above, using the exact copy given.**

- [ ] **Step 2: Review against Global Constraints**, and specifically confirm the registration-number notice is present verbatim on both pages and no registration number was invented.

- [ ] **Step 3: Typecheck and build**

Run: `npx tsc --noEmit; echo "exit: $?"` → `exit: 0`
Run: `npm run build` → succeeds, both routes listed.

- [ ] **Step 4: Live browser verification**

`npm run dev`, load both pages, confirm the registration-number notice renders, confirm `settings.contact_email` interpolates correctly on `/privacy`.

- [ ] **Step 5: Commit**

```bash
git add "caracal-footwear/src/app/(storefront)/privacy/page.tsx" "caracal-footwear/src/app/(storefront)/terms/page.tsx"
git commit -m "feat(caracal): /privacy and /terms legal pages"
```

---

## Task 13: Full verification pass and design self-audit

**Files:** None created — this task verifies the whole phase together.

- [ ] **Step 1: Full clean build**

```bash
rm -rf .next
npm run build
```

Expected: every route from this phase appears in the build output (`/`, `/signature`, `/story`, `/size-guide`, `/care`, `/contact`, `/faq`, `/shipping-returns`, `/privacy`, `/terms`), static generation intact on all of them (no unexpected `ƒ` dynamic markers — these are all either static content or fetch-at-build-time Server Components, same pattern as the existing `/range` pages).

- [ ] **Step 2: Full test suite**

Run: `npx vitest run; echo "exit: $?"`
Expected: `exit: 0`, all existing Phase 1-3 tests still pass plus the new `contact.test.ts`.

- [ ] **Step 3: Lint**

Run: `npx eslint .; echo "exit: $?"`
Expected: `exit: 0`

- [ ] **Step 4: Design self-audit checklist**

Walk every new route (`/`, `/signature`, `/story`, `/size-guide`, `/care`, `/contact`, `/faq`, `/shipping-returns`, `/privacy`, `/terms`) at both desktop (1440px) and 390px width, checking:
- No raw hex colours anywhere in the rendered page (spot-check computed styles in DevTools against the token list in Global Constraints).
- Every text/background pair meets the contrast notes already documented in `globals.css` (accent is never used for body text on canvas).
- `prefers-reduced-motion` emulation on `/`, `/signature`, `/story`: every element that would otherwise animate is visible immediately, nothing is stuck invisible.
- No horizontal scroll/overflow at 390px on any page.
- All internal links (`Header`, `Footer`, cross-links added in Tasks 10-12) resolve to a real route — `/journal` is the one expected exception, deferred to Phase 5.
- Focus ring (`:focus-visible`, accent-coloured) visible when tabbing through the contact form and all nav links.

- [ ] **Step 5: Lighthouse check on `/`**

Run a Lighthouse pass (Chrome DevTools → Lighthouse, mobile, Performance category) against `/` on the production build (`npm run start`, not `next dev` — dev mode skews performance scores). Spec success criterion #6 requires **≥ 75** on the cinematic homepage specifically (lower bar than `/range`/PDP's ≥90, because of the hero image and GSAP). If below 75, the most likely cause is the hero image (`public/hero/wild-by-nature.webp`, already flagged in `page.tsx`'s own comment as soft/upscaled) or GSAP's bundle size — note the finding rather than over-optimizing blind; report the actual score.

- [ ] **Step 6: Report to user**

Summarize: routes delivered, Lighthouse score on `/`, the returns-window default (7 days) and the size-guide "approximate" framing as two content assumptions to flag alongside the spec's existing open questions, and the explicit deferral of beats 7/8 to Phase 5.
