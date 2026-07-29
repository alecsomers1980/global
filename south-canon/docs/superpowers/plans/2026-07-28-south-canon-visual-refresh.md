# South Canon Visual Refresh & Example Catalogue Content — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Populate the components that already support imagery (PlayHero, PlayCard, MediaGallery, PlaywrightCard) with real content, and grow the catalogue from 1 play to 7 using Paul Slabolepszy's real, sourced titles — turning a visually bleak, near-empty site into a populated, photography-driven one without touching the data model, auth, or admin logic.

**Architecture:** Pure presentation + seed-data pass on the existing `feat/south-canon-m1` branch/worktree. Four small component edits (all additive/conditional — no behavior changes when a field is null), followed by one idempotent-by-constraint Node seed script run once against the Supabase pooler connection, followed by a full verification pass.

**Tech Stack:** Next.js 16 / React 19 / Tailwind v4 (existing), `pg` (already installed, unlisted in package.json — same ad-hoc pattern M1's migrations used), Supabase Postgres via `DATABASE_URL` pooler connection string in `.env.local`.

## Global Constraints

- No schema changes. Every field used (`hero_image_url`, `play_media`, `rights_availability`, `portrait_url`) already exists from M1's migrations (`supabase/migrations/0001_core.sql`–`0003_rights.sql`).
- No fabricated cast lists, press quotes, or production history for the 6 new plays — `Characters`, `PressQuotes`, `ProductionHistory` already render `null` on an empty array; leave those tables empty for the new plays rather than invent content.
- Stock photography (Pexels) is illustrative, not documentary — never caption or alt-text it as an actual production photograph of a specific real staging.
- Paul Slabolepszy's `portrait_url` stays `NULL`. Do not assign a stock photo to a real, named person.
- **The existing Playwright e2e suite must pass unmodified** (`tests/e2e/*.spec.ts`) — in particular `play-detail.spec.ts`'s `'omits blocks that have no data'` test asserts *Saturday Night at the Palace* has **zero** `play_media` rows. **Correction found during Task 5:** the play already had 3 pre-existing `rights_availability` rows (all `South Africa`/`available`, from M1's original seed) — not zero, as this section originally claimed. `'shows availability by territory'` still passes regardless, since 4 of the 5 `TERRITORIES` remain uncovered. The binding rule is narrower than first stated: this plan's own tasks must not **insert** any `play_media` or `rights_availability` row for *Saturday Night at the Palace* — only update `hero_image_url`. All gallery/video/rights content this plan adds goes on the 6 new plays instead.
- All image URLs and the one video ID below are already verified real (Pexels direct CDN URLs checked live; the YouTube video's own title/description confirm it's genuinely footage from the 1999 film adaptation of *Heel Against the Head*) — use them exactly as given, don't re-guess or substitute.

---

## Task 1: `PlayCard` gains a poster image

**Files:**
- Modify: `components/catalogue/PlayCard.tsx`

**Interfaces:**
- Consumes: `PlaySummary.heroImageUrl` (`lib/types.ts:24`, already selected by `lib/plays.ts`'s `SUMMARY_SELECT` — no data-layer change needed).
- Produces: no change to the component's exported signature (`PlayCard({ play }: { play: PlaySummary })`); used unmodified by `app/plays/page.tsx`, `app/page.tsx`, and `app/playwrights/[slug]/page.tsx`.

- [ ] **Step 1: Replace the file content**

```tsx
import Link from 'next/link'
import type { PlaySummary } from '@/lib/types'

export function PlayCard({ play }: { play: PlaySummary }) {
  return (
    <Link
      href={`/plays/${play.slug}`}
      className="group block border-b border-rule py-8 transition-colors hover:border-accent"
    >
      <article className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
        <div className="flex gap-6">
          {play.heroImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={play.heroImageUrl}
              alt={`Illustrative artwork for ${play.title}`}
              className="aspect-[3/4] w-28 shrink-0 object-cover md:w-36"
            />
          )}
          <div>
            <h2 className="font-display text-3xl leading-tight group-hover:text-accent md:text-4xl">
              {play.title}
            </h2>
            {play.credits.length > 0 && (
              <p className="mt-1 text-sm text-muted">
                {play.credits.map((c) => c.name).join(' · ')}
              </p>
            )}
            {play.logline && <p className="mt-3 max-w-2xl text-base">{play.logline}</p>}
          </div>
        </div>
        <dl className="flex gap-6 text-xs tracking-wide uppercase text-muted md:flex-col md:gap-2 md:text-right">
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

The only change from the current file: the text block is now wrapped in `<div className="flex gap-6">` with a conditional `<img>` before it. The outer 2-column grid (text-block, meta) and the `<dl>` block are untouched. When `heroImageUrl` is null (true for every play until Task 5 runs), this renders byte-for-byte the same DOM as today except for the new empty wrapper div — no visual change.

- [ ] **Step 2: Verify no regression before data exists**

Run: `npm run dev` (in the worktree's `south-canon/` directory; if port 3000 is occupied by an unrelated project, this repo's own dev server picking 3001 automatically is fine for a manual check — no config edit needed for a plain visual check, only for Playwright which hardcodes the port).

Visit `/plays` — confirm *Saturday Night at the Palace* still renders as a text-only row (no broken image icon, no layout shift), since it has no `hero_image_url` yet.

- [ ] **Step 3: Commit**

```bash
git add components/catalogue/PlayCard.tsx
git commit -m "feat(south-canon): add poster image slot to PlayCard"
```

---

## Task 2: Fix `PlayHero`'s documentary-photo caption claim

**Files:**
- Modify: `components/play/PlayHero.tsx:44-51`

**Interfaces:**
- Consumes: `PlayDetail.heroImageUrl` (unchanged).
- Produces: no signature change.

**Why:** The current `alt` text (`` `Production photograph from ${play.title}` ``) asserts the image is a real photo from an actual staging. Once Task 5 adds Pexels stock imagery here, that claim becomes false — it needs to read as illustrative key art, not documentary evidence of a real production.

- [ ] **Step 1: Edit the alt text**

In `components/play/PlayHero.tsx`, change:

```tsx
          alt={`Production photograph from ${play.title}`}
```

to:

```tsx
          alt={`Key art for ${play.title}`}
```

No other line in this file changes.

- [ ] **Step 2: Verify**

Run: `grep -rn "Production photograph" components/` — expect no matches.

- [ ] **Step 3: Commit**

```bash
git add components/play/PlayHero.tsx
git commit -m "fix(south-canon): stop captioning play hero images as documentary photography"
```

---

## Task 3: `/playwrights` index gets portraits

**Files:**
- Modify: `app/playwrights/page.tsx`

**Interfaces:**
- Consumes: `components/play/PlaywrightCard.tsx`'s existing `PlaywrightCard({ playwright }: { playwright: Playwright })` (already built in M1, currently only used from `app/plays/[slug]/page.tsx`'s credits list — confirmed via `grep -rn PlaywrightCard app/` before this plan was written).
- Produces: no change to any other file's interface.

- [ ] **Step 1: Replace the file content**

```tsx
import type { Metadata } from 'next'
import { Container } from '@/components/ui/Container'
import { PlaywrightCard } from '@/components/play/PlaywrightCard'
import { listPlaywrights } from '@/lib/playwrights'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Playwrights',
  description: 'The writers represented by South Canon.',
}

export default async function PlaywrightsPage() {
  const playwrights = await listPlaywrights()
  return (
    <Container className="py-16">
      <h1 className="font-display text-5xl md:text-6xl">Playwrights</h1>
      <div className="mt-12">
        {playwrights.map((p) => (
          <PlaywrightCard key={p.slug} playwright={p} />
        ))}
      </div>
    </Container>
  )
}
```

This drops the now-unused `Link` import (the old bare `<ul>` used it directly; `PlaywrightCard` renders its own "View full profile" link internally) and the old `<ul>`/`<li>` markup entirely, replacing it with the same `PlaywrightCard` already used elsewhere.

- [ ] **Step 2: Verify**

Run: `npm run dev`, visit `/playwrights`. With only Paul Slabolepszy seeded so far (no `portrait_url` yet), confirm the page still renders his name, no console errors, and no broken-image state (the component's `{playwright.portraitUrl ? <img/> : <div />}` branch is exercised — a plain empty `<div />` placeholder where the portrait column would be, which is existing, already-reviewed M1 code, not something this task changes).

- [ ] **Step 3: Commit**

```bash
git add app/playwrights/page.tsx
git commit -m "feat(south-canon): show playwright portraits on the /playwrights index"
```

---

## Task 4: Homepage hero becomes a split text/image layout

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `listPlays` from `lib/plays.ts` (already imported; no new export needed — `PlaySummary.heroImageUrl` and `.title` are used).
- Produces: no change to any other file's interface.

- [ ] **Step 1: Replace the file content**

```tsx
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { PlayCard } from '@/components/catalogue/PlayCard'
import { listPlays } from '@/lib/plays'

export const revalidate = 300

export default async function HomePage() {
  const allPlays = await listPlays({ genres: [] })
  const flagship = allPlays.find((p) => p.slug === 'saturday-night-at-the-palace')
  const plays = allPlays.slice(0, 4)

  return (
    <>
      <Container className="py-24 md:py-32">
        <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-accent">
              Theatrical licensing for the global South
            </p>
            <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.05] md:text-7xl">
              The work of Africa&rsquo;s greatest playwrights, properly represented.
            </h1>
            <p className="mt-8 max-w-2xl text-xl text-muted">
              South Canon licenses plays for performance worldwide &mdash; and makes sure the writers
              who made them are paid, on time, with a full account of where their work is playing.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/plays"
                className="bg-accent px-8 py-4 text-sm uppercase tracking-wide text-paper hover:opacity-90"
              >
                Browse the catalogue
              </Link>
              <Link
                href="/about"
                className="border border-ink px-8 py-4 text-sm uppercase tracking-wide hover:bg-ink hover:text-paper"
              >
                For writers
              </Link>
            </div>
          </div>

          {flagship?.heroImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={flagship.heroImageUrl}
              alt={`Key art for ${flagship.title}`}
              className="aspect-[4/5] w-full object-cover"
            />
          )}
        </div>
      </Container>

      {plays.length > 0 && (
        <Container className="pb-24">
          <h2 className="font-display text-3xl">From the catalogue</h2>
          <div className="mt-4">
            {plays.map((p) => (
              <PlayCard key={p.id} play={p} />
            ))}
          </div>
        </Container>
      )}
    </>
  )
}
```

The hero copy, links, and the "From the catalogue" section are unchanged — only wrapped in the new split grid with a conditional flagship image on the right (mirrors `PlayHero.tsx`'s `grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center` pattern exactly, so no new layout idiom is introduced).

- [ ] **Step 2: Verify**

Run: `npm run dev`, visit `/`. Confirm the `<h1>` still reads "...properly represented." (unchanged text — `tests/e2e/pages.spec.ts`'s `'home page renders the positioning line'` test checks this) and, since `flagship` has no `heroImageUrl` yet, the right column simply doesn't render (text-only hero, same as today).

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat(south-canon): give the homepage hero a flagship-play image"
```

---

## Task 5: Seed script — hero images, 6 new plays, rights, and the two media galleries

**Files:**
- Create: `scripts/seed-visual-refresh-content.js`

**Interfaces:**
- Consumes: `DATABASE_URL` from `.env.local` (same pooler connection string used for M1's migrations), the `pg` package (already present in `node_modules`, installed `--no-save` in M1 — confirmed still present via `node -e "console.log(require('./node_modules/pg/package.json').version)"` → `8.22.0`).
- Produces: no exported interface — this is a one-off script, run once, not imported by application code.

**Content this task writes (verified, sourced — see spec `docs/superpowers/specs/2026-07-28-south-canon-visual-refresh-design.md` for citations):**

| slug | year | genres | themes | setting | hero image (Pexels photo id) |
|---|---|---|---|---|---|
| over-the-hill | 1985 | Drama, Comedy | Rugby, Masculinity, Reunion | A rugby club, South Africa | 6896181 |
| smallholding | 1989 | Comedy | Absurdism, Rural life | A smallholding, South Africa | 6896179 |
| mooi-street-moves | 1992 | Comedy, Drama | Friendship, Social change | Mooi Street, Johannesburg | 12092991 |
| the-return-of-elvis-du-pisanie | 1992 | Drama | Homecoming, Solo performance | *(null)* | 7513421 |
| pale-natives | 1993 | Comedy, Drama | Identity, Post-apartheid anxiety | *(null)* | 7991182 |
| heel-against-the-head | 1995 | Comedy | Rugby, Friendship | Wales, during the Rugby World Cup | 22908923 |

Plus: *Saturday Night at the Palace* gets `hero_image_url` only (Pexels photo id `12616962`) — **no** `play_media`, **no** `rights_availability` row (Global Constraints above explain why).

- [ ] **Step 1: Write the script**

```js
// scripts/seed-visual-refresh-content.js
// One-off seed script for the 2026-07-28 visual-refresh plan. Run once; re-running will fail
// cleanly on the `plays.slug` unique constraint rather than duplicating rows.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') })
const { Client } = require('pg')

const PEXELS = (id, w) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`

const NEW_PLAYS = [
  {
    title: 'Over the Hill',
    slug: 'over-the-hill',
    logline: 'A rugby reunion drama that doubles as a reckoning with guilt, masculinity and the stories men tell themselves.',
    synopsis_short: "Old teammates gather for a rugby club reunion in this DALRO Award-winning drama, one of several Slabolepszy plays that use the game to probe masculinity and unresolved guilt.",
    genres: ['Drama', 'Comedy'],
    themes: ['Rugby', 'Masculinity', 'Reunion'],
    year_written: 1985,
    languages: ['English'],
    setting: 'A rugby club, South Africa',
    hero_image_url: PEXELS(6896181, 1600),
  },
  {
    title: 'Smallholding',
    slug: 'smallholding',
    logline: 'A darkly comic, absurdist turn from Slabolepszy, set on the kind of small farm that swallows the people trying to make it pay.',
    synopsis_short: "Winner of the Vita Best Play award, Smallholding is one of the plays scholars point to for Slabolepszy's absurdist streak and comic technique.",
    genres: ['Comedy'],
    themes: ['Absurdism', 'Rural life'],
    year_written: 1989,
    languages: ['English'],
    setting: 'A smallholding, South Africa',
    hero_image_url: PEXELS(6896179, 1600),
  },
  {
    title: 'Mooi Street Moves',
    slug: 'mooi-street-moves',
    logline: "Two men scraping by on Johannesburg's Mooi Street, an odd-couple friendship tested by the politics and social fractures of the city around them.",
    synopsis_short: 'Written for Seputla Sebogodi and Martin Le Maitre and later staged internationally (Glasgow MayFest, Amstel Playwright of the Year), Mooi Street Moves pairs buddy-comedy instincts with a hard look at social and political fracture.',
    genres: ['Comedy', 'Drama'],
    themes: ['Friendship', 'Social change'],
    year_written: 1992,
    languages: ['English'],
    setting: 'Mooi Street, Johannesburg',
    hero_image_url: PEXELS(12092991, 1600),
  },
  {
    title: 'The Return of Elvis du Pisanie',
    slug: 'the-return-of-elvis-du-pisanie',
    logline: "One of Slabolepszy's most garlanded plays, originally performed as a solo tour-de-force by the writer himself.",
    synopsis_short: 'The Return of Elvis du Pisanie swept the Vita, Fleur du Cap and DALRO Best Play awards in the same year — the role of Eddie made Slabolepszy the first South African actor to win every major Best Actor award in a single year.',
    genres: ['Drama'],
    themes: ['Homecoming', 'Solo performance'],
    year_written: 1992,
    languages: ['English'],
    setting: null,
    hero_image_url: PEXELS(7513421, 1600),
  },
  {
    title: 'Pale Natives',
    slug: 'pale-natives',
    logline: "A comedy of early-'90s white male anxiety, as the ground shifts under two old friends faster than either can keep up.",
    synopsis_short: 'First staged in the early 1990s and revived decades later at the Market Theatre, Pale Natives captures the unease of white South African men navigating a country changing around them.',
    genres: ['Comedy', 'Drama'],
    themes: ['Identity', 'Post-apartheid anxiety'],
    year_written: 1993,
    languages: ['English'],
    setting: null,
    hero_image_url: PEXELS(7991182, 1600),
  },
  {
    title: 'Heel Against the Head',
    slug: 'heel-against-the-head',
    logline: 'Two rugby-mad mates, Tjokkie and Crispin, chase the World Cup all the way to Wales — and find more than sport waiting for them there.',
    synopsis_short: 'A Vita and Star Tonight Best Comedy winner, later adapted by Slabolepszy into a feature film of the same name, following devoted fans Tjokkie and Crispin on a rugby pilgrimage that becomes something bigger.',
    genres: ['Comedy'],
    themes: ['Rugby', 'Friendship'],
    year_written: 1995,
    languages: ['English'],
    setting: 'Wales, during the Rugby World Cup',
    hero_image_url: PEXELS(22908923, 1600),
  },
]

const MEDIA_BY_SLUG = {
  'mooi-street-moves': [
    { type: 'photo', url: PEXELS(11718581, 1200), caption: 'Illustrative image', credit: 'Photo: Linda Gschwentner / Pexels' },
    { type: 'photo', url: PEXELS(18501410, 1200), caption: 'Illustrative image', credit: 'Photo: Daniel Cardoso / Pexels' },
  ],
  'heel-against-the-head': [
    { type: 'photo', url: PEXELS(8462993, 1200), caption: 'Illustrative image', credit: 'Photo: Mart Production / Pexels' },
    { type: 'photo', url: PEXELS(6899791, 1200), caption: 'Illustrative image', credit: 'Photo: Cottonbro Studio / Pexels' },
    {
      type: 'video',
      url: 'https://www.youtube.com/embed/DxauZXqVNpY',
      caption: 'Clip from the 1999 film adaptation of Heel Against the Head',
      credit: null,
    },
  ],
}

async function main() {
  const db = new Client({ connectionString: process.env.DATABASE_URL })
  await db.connect()

  try {
    await db.query('begin')

    const { rows: [writer] } = await db.query(
      "select id from playwrights where slug = 'paul-slabolepszy'",
    )
    if (!writer) throw new Error("playwright 'paul-slabolepszy' not found — run this after M1's seed data exists")

    const updated = await db.query(
      "update plays set hero_image_url = $1 where slug = 'saturday-night-at-the-palace' returning id",
      [PEXELS(12616962, 1600)],
    )
    if (updated.rowCount !== 1) throw new Error('expected exactly one existing play to update')

    for (const play of NEW_PLAYS) {
      const { rows: [inserted] } = await db.query(
        `insert into plays
           (title, slug, logline, synopsis_short, genres, themes, year_written, languages, setting, hero_image_url, status)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'published')
         returning id`,
        [
          play.title, play.slug, play.logline, play.synopsis_short,
          play.genres, play.themes, play.year_written, play.languages,
          play.setting, play.hero_image_url,
        ],
      )
      const playId = inserted.id

      await db.query(
        `insert into play_playwrights (play_id, playwright_id, role, sort) values ($1, $2, 'author', 0)`,
        [playId, writer.id],
      )

      await db.query(
        `insert into rights_availability (play_id, territory, status) values ($1, 'South Africa', 'available')`,
        [playId],
      )

      const media = MEDIA_BY_SLUG[play.slug] ?? []
      for (const [i, m] of media.entries()) {
        await db.query(
          `insert into play_media (play_id, type, url, caption, credit, sort) values ($1,$2,$3,$4,$5,$6)`,
          [playId, m.type, m.url, m.caption, m.credit, i],
        )
      }

      console.log(`seeded: ${play.title} (${playId})`)
    }

    await db.query('commit')
    console.log('done')
  } catch (err) {
    await db.query('rollback')
    throw err
  } finally {
    await db.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

- [ ] **Step 2: Run it**

Run: `node scripts/seed-visual-refresh-content.js` from the `south-canon/` directory.

Expected output: 6 lines of `seeded: <title> (<uuid>)` followed by `done`, no errors. (The transaction wraps everything — if the unique-slug constraint or the writer lookup fails, nothing is partially written.)

- [ ] **Step 3: Verify against the database directly**

```bash
node -e "
require('dotenv').config({path:'.env.local'});
const {Client} = require('pg');
const c = new Client({connectionString: process.env.DATABASE_URL});
c.connect().then(async () => {
  const plays = await c.query('select slug, hero_image_url is not null as has_hero from plays order by slug');
  console.table(plays.rows);
  const media = await c.query('select play_id, type, count(*) from play_media group by play_id, type');
  console.table(media.rows);
  const rights = await c.query('select play_id, territory, status from rights_availability');
  console.table(rights.rows);
  await c.end();
});
"
```

Expected: 7 rows in `plays`, all with `has_hero = true`. `play_media` grouped rows only for the two plays seeded with media (2 photo rows each, plus 1 video row for *Heel Against the Head*). `rights_availability` has exactly 6 rows (the 6 new plays), never the original play.

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-visual-refresh-content.js
git commit -m "feat(south-canon): seed 6 real Slabolepszy titles with sourced content and stock imagery"
```

(The script's *effect* — the database rows — isn't itself version-controlled; only the script is. This matches how M1's migrations were applied: the script is the reviewable artifact, the run is a one-time operation against the live Supabase project.)

---

## Task 6: Full verification pass

**Files:** none (verification only).

- [ ] **Step 1: Type-check and build**

```bash
npm run build
```

Expected: succeeds with no errors. This is the check that catches static-generation issues invisible in dev mode (as it did for the real Suspense bug found during M1) — with 7 plays now, `generateStaticParams` in `app/plays/[slug]/page.tsx` and `app/playwrights/[slug]/page.tsx` will statically render more pages than before, which is the main new thing this build pass exercises.

- [ ] **Step 2: Unit tests**

```bash
npm test
```

Expected: all existing tests in `tests/unit/*.test.ts` still pass — `plays.test.ts`'s assertions (`listPlays` returns the seeded play, filters by playwright, `listGenres` includes `'Drama'`) all remain true with 6 additional plays present, since none of them removes or renames anything the tests check.

- [ ] **Step 3: E2E tests**

If port 3000 is occupied by an unrelated project in this environment (established recurring issue from M1), temporarily point `playwright.config.ts` at port 3001, run, then revert:

```bash
npm run e2e
```

Expected: all tests in `tests/e2e/*.spec.ts` pass, **including** `play-detail.spec.ts`'s `'omits blocks that have no data'` and `'shows availability by territory'` tests for *Saturday Night at the Palace* — these must still pass unmodified per the Global Constraints above. If `playwright.config.ts` was edited for the port workaround, revert it with `git checkout -- playwright.config.ts` before committing anything else, and confirm with `git status` that no stray `test-results/` output got staged.

- [ ] **Step 4: Manual visual check**

Run: `npm run dev`. Visit each of the following and confirm images render (no broken-image icons), no layout breakage at a mobile width (~375px) and desktop width (~1280px):

- `/` — flagship hero image + 4 poster thumbnails in "From the catalogue"
- `/plays` — all 7 plays show poster thumbnails
- `/playwrights` — Paul Slabolepszy's card (no portrait yet — confirm the empty-div placeholder doesn't break layout, per Global Constraints this is expected and out of scope to fix)
- `/plays/mooi-street-moves` — hero image, 2-photo gallery, no Characters/Press/Production sections
- `/plays/heel-against-the-head` — hero image, 2-photo gallery, the embedded YouTube video plays
- `/plays/saturday-night-at-the-palace` — hero image present, but **no** Media section (confirms Task 5's constraint held)

- [ ] **Step 5: Update the design spec's status line**

In `docs/superpowers/specs/2026-07-28-south-canon-visual-refresh-design.md`, change the header line `Status: Approved for planning` to `Status: Implemented 2026-07-28`.

- [ ] **Step 6: Final commit**

```bash
git add docs/superpowers/specs/2026-07-28-south-canon-visual-refresh-design.md
git commit -m "docs(south-canon): mark visual refresh spec implemented"
```
