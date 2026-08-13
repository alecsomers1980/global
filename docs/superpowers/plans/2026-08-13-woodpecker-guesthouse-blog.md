# Woodpecker Guesthouse — AI Blog Pipeline Implementation Plan (Plan C)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the guesthouse owner a self-serve `/blog` (public, SEO/GEO-optimized articles about Hazyview, the Panorama Route, Kruger safaris, family travel and conferencing) fed by an AI generation pipeline: a monthly cron that drafts posts, a "Generate a draft now" admin button, a draft → approved → published (+ discarded) review queue, and a daily publish cron — all gated behind the compliance guard already standard across this portfolio's blog generators.

**Architecture:** One new Supabase table (`blog_posts`) reusing the exact RLS pattern already proven on `rooms` (public read on one status value, `is_staff()` full access) — no new auth mechanism, `/admin/blog` inherits gating from the `/admin` layout Plan B already built. Generation runs through the Anthropic SDK server-side only (two entry points: a manual staff-authed API route, and a `CRON_SECRET`-gated cron route using the service-role client, both calling one shared `generateBlogPost()` function). Publishing is a second, separate cron that only flips already-approved rows — nothing goes live without a human clicking Approve first.

**Tech Stack:** `@anthropic-ai/sdk` (new), `react-markdown` (new) — both already proven in this portfolio (Aloe Signs' `news_posts` pipeline), pinned to the same versions already running there. Everything else (`@supabase/supabase-js`, `@supabase/ssr`, `resend`) is already installed from Plans A/B.

**Spec:** `docs/superpowers/specs/2026-08-13-woodpecker-guesthouse-design.md` §6 (Blog admin, 7-point standard). Builds on Plan A (Foundation) and Plan B (Admin), both already implemented.

## Global Constraints

- **Reference implementation, not invented from scratch:** the generator's compliance-guard system prompt, the `===BODY===` delimiter parsing (keeps the large markdown body out of the JSON blob so a truncated response yields a shorter article, never a broken parse), and the `escapeJsonControlChars()` defensive fix are all adapted verbatim in structure from Aloe Signs' `lib/news-generator.ts` — the ANTI-SLOP rules block is copied unchanged (per house standard: keep it intact across all client generators), only the business specifics (property, location, categories, CTA) are re-targeted.
- **No fabricated hero images.** Aloe's generator calls the Unsplash API with a hardcoded fallback list of specific photo URLs. This plan deliberately does NOT port that: guessing real-looking Unsplash photo IDs for Woodpecker's categories would be exactly the kind of fabricated content this portfolio's standing rule forbids, and no Unsplash key exists for this client yet. Every generated post starts with `hero_image: null`; staff attach a real photo afterward using the identical "paste a `site-media` URL" field pattern rooms already use (`admin/rooms/[id]/page.tsx`). The public blog pages render an honest placeholder when `hero_image` is null — same convention as the empty-gallery state.
- **No fabricated contact details.** The generator's CTA section links to `/accommodation` and `/contact` only — never a phone number or WhatsApp number, because none is confirmed for this client yet (`NEXT_PUBLIC_WHATSAPP_NUMBER` is still unset per Plan A). The real WhatsApp button is already floating site-wide once that env var is set; the article doesn't need to duplicate it.
- **No new admin API routes for basic CRUD** — `blog_posts` reads/writes/approve/discard go through the RLS-enforced browser client directly (`is_staff()` policy), exactly like `lib/admin/rooms.ts`. Only the two things RLS can't gate as a workflow step get routes: on-demand AI generation (needs a server-side `ANTHROPIC_API_KEY`) and the two crons (need `CRON_SECRET`, run without a user session).
- **Reuse `CONTACT_TO_EMAIL`, don't invent a new admin email env var.** Aloe's version hardcodes specific staff emails (`andre@...`, `team@...`) that have no Woodpecker equivalent — inventing one would be a fabricated contact detail. The review-ready notification reuses the same `CONTACT_TO_EMAIL` the contact form already sends to.
- **SA English spelling**, **no fabricated content** (room specs, guest reviews, statistics, testimonials — none of these ever appear in generated copy), **explicit `git add` paths only**, **verify `git branch --show-current` before every commit** — same as Plans A and B.
- **No test framework** — same house convention: `npm run build` + a live `npm run dev` + curl is the verification method for pages/routes; `node --test` only for pure-logic helpers (this plan adds one: `pickNextCategory`).
- **Never construct a Supabase client during render** — same rule as Plans A/B, already enforced by the existing `lib/supabase/{client,server,admin}.ts` factories this plan reuses unchanged.

---

### Task 1: Blog Schema Migration

**Files:**
- Create: `supabase/migrations/0003_blog.sql`

**Interfaces:**
- Produces: `public.blog_posts(id, slug, title, excerpt, meta_title, meta_description, content, category, hero_image, status, scheduled_for, published_at, created_at, updated_at)`, RLS: public read where `status = 'published'`, staff full access via `is_staff()`.
- Consumes: `public.is_staff()` and `public.touch_updated_at()`, both from `0002_admin_auth.sql`.

- [ ] **Step 1: Write the migration**

```sql
-- Woodpecker Guesthouse — AI blog pipeline schema.
-- Run after 0001_init.sql and 0002_admin_auth.sql (needs is_staff() + touch_updated_at()).

create table if not exists public.blog_posts (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  title             text not null,
  excerpt           text not null default '',
  meta_title        text not null default '',
  meta_description  text not null default '',
  content           text not null default '',
  category          text not null default '',
  hero_image        text,
  status            text not null default 'draft' check (status in ('draft', 'approved', 'published', 'discarded')),
  scheduled_for     timestamptz,
  published_at      timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

drop trigger if exists blog_posts_touch on public.blog_posts;
create trigger blog_posts_touch before update on public.blog_posts
  for each row execute function public.touch_updated_at();

create index if not exists blog_posts_status_idx on public.blog_posts (status);

alter table public.blog_posts enable row level security;

create policy "public read published posts" on public.blog_posts
  for select using (status = 'published');
create policy "staff all posts" on public.blog_posts
  for all using (public.is_staff()) with check (public.is_staff());
```

- [ ] **Step 2: Run the migration**

Run in the Supabase SQL editor, after `0001_init.sql` and `0002_admin_auth.sql`. Verify: `select count(*) from public.blog_posts;` returns `0` with no error.

- [ ] **Step 3: Commit**

```bash
git branch --show-current
git add woodpecker-guesthouse/supabase/migrations/0003_blog.sql
git commit -m "feat(woodpecker-guesthouse): add blog_posts schema + RLS"
```

---

### Task 2: BlogPost Type + Category Rotation Helper

**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/lib/blog/categories.ts`
- Test: `test/blog-categories.test.mjs`

**Interfaces:**
- Produces: `BlogPost` type; `BLOG_CATEGORIES: readonly string[]`, `BlogCategory` type, `pickNextCategory(recentCategories: string[]): BlogCategory`.
- Consumes: nothing.

- [ ] **Step 1: Add `BlogPost` to `src/lib/types.ts`**

Append to the end of the file:

```ts

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  content: string;
  category: string;
  hero_image: string | null;
  status: "draft" | "approved" | "published" | "discarded";
  scheduled_for: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};
```

- [ ] **Step 2: Write the failing test**

```js
// test/blog-categories.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { BLOG_CATEGORIES, pickNextCategory } from "../src/lib/blog/categories.ts";

test("with no recent posts, returns one of the known categories", () => {
  const picked = pickNextCategory([]);
  assert.ok(BLOG_CATEGORIES.includes(picked));
});

test("picks a category that hasn't been used yet over ones that have", () => {
  const allButOne = BLOG_CATEGORIES.slice(1);
  const recent = allButOne.flatMap((c) => [c, c, c]); // heavily used
  const picked = pickNextCategory(recent);
  assert.equal(picked, BLOG_CATEGORIES[0]);
});

test("unknown categories in history are ignored, not counted", () => {
  const picked = pickNextCategory(["Some Old Deleted Category"]);
  assert.ok(BLOG_CATEGORIES.includes(picked));
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --test test/blog-categories.test.mjs`
Expected: FAIL — `Cannot find module '../src/lib/blog/categories.ts'`

- [ ] **Step 4: Write `src/lib/blog/categories.ts`**

```ts
// Woodpecker Guesthouse blog categories — Hazyview / Panorama Route / Kruger
// guesthouse angle. Kept separate from Aloe Signs' news-categories.ts because
// the topic list, not just the client name, is different.

export const BLOG_CATEGORIES = [
  "Kruger Safaris & Wildlife",
  "Panorama Route & Local Attractions",
  "Family Travel & Kids",
  "Conferencing & Groups",
  "Restaurant & Local Flavours",
  "Hazyview & Mpumalanga Travel Tips",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

/** Returns the least-recently-used category, breaking ties at random.
 *  Unknown strings in recentCategories (e.g. a category later renamed or
 *  removed) are ignored rather than throwing. */
export function pickNextCategory(recentCategories: string[]): BlogCategory {
  const counts = Object.fromEntries(BLOG_CATEGORIES.map((c) => [c, 0])) as Record<BlogCategory, number>;
  for (const rc of recentCategories) {
    if ((BLOG_CATEGORIES as readonly string[]).includes(rc)) {
      counts[rc as BlogCategory]++;
    }
  }
  const min = Math.min(...BLOG_CATEGORIES.map((c) => counts[c]));
  const least = BLOG_CATEGORIES.filter((c) => counts[c] === min);
  return least[Math.floor(Math.random() * least.length)];
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test test/blog-categories.test.mjs`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git branch --show-current
git add woodpecker-guesthouse/src/lib/types.ts woodpecker-guesthouse/src/lib/blog/categories.ts woodpecker-guesthouse/test/blog-categories.test.mjs
git commit -m "feat(woodpecker-guesthouse): add BlogPost type + category rotation helper"
```

---

### Task 3: Blog Generator (Anthropic, Compliance Guard)

**Files:**
- Create: `src/lib/blog/generator.ts`

**Interfaces:**
- Produces: `generateBlogPost(opts: { category: BlogCategory; recentTitles: string[] }): Promise<GeneratedPost>` where `GeneratedPost = { title: string; slug: string; excerpt: string; meta_title: string; meta_description: string; body_md: string }`.
- Consumes: `BlogCategory` from Task 2. Env: `ANTHROPIC_API_KEY`.

- [ ] **Step 1: Write `src/lib/blog/generator.ts`**

```ts
import Anthropic from "@anthropic-ai/sdk";
import type { BlogCategory } from "./categories";

let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set. Cannot generate blog posts.");
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/**
 * Models sometimes emit raw newlines/tabs inside JSON string values, which is
 * invalid JSON and makes JSON.parse throw "Bad control character in string
 * literal". Walk the text and escape any control character (< 0x20) that
 * appears inside a string literal. (Proven fix, ported from Aloe Signs'
 * news-generator.ts — same failure mode, same fix.)
 */
function escapeJsonControlChars(raw: string): string {
  let out = "";
  let inString = false;
  let escaped = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (escaped) {
      out += ch;
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      out += ch;
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      out += ch;
      continue;
    }
    const code = raw.charCodeAt(i);
    if (inString && code < 0x20) {
      if (ch === "\n") out += "\\n";
      else if (ch === "\r") out += "\\r";
      else if (ch === "\t") out += "\\t";
      else out += "\\u" + code.toString(16).padStart(4, "0");
      continue;
    }
    out += ch;
  }
  return out;
}

export interface GeneratedPost {
  title: string;
  slug: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  body_md: string;
}

export async function generateBlogPost(opts: {
  category: BlogCategory;
  recentTitles: string[];
}): Promise<GeneratedPost> {
  const client = getAnthropicClient();

  const systemPrompt = `You are an expert travel and hospitality content writer for Woodpecker Guesthouse, an affordable, family-friendly guesthouse and conferencing venue in Hazyview, Mpumalanga, South Africa — minutes from the Kruger National Park and on the Panorama Route. Your writing follows these rules:

- Use South African English: "organise", "colour", "favour", "programme", etc.
- Mention local context where relevant: Hazyview, the Panorama Route (God's Window, Blyde River Canyon, Bourke's Luck Potholes), Kruger National Park gate logistics, Mpumalanga's climate and seasons.
- Be practical, helpful, and educational. Write for the kind of guest who actually books Woodpecker: families, small groups, budget-conscious travellers, and conference/group bookers — not luxury-safari-lodge readers.
- UNIQUE ANGLE (this is what makes the article rank and get cited — do not write a generic listicle): build the piece around ONE specific, non-obvious angle or real position, not a bland "X things to know" list every competitor already has. Write from the first-hand perspective of a guesthouse that has hosted this kind of trip before: "what families forget to pack for a self-drive Kruger day", "why we tell first-timers to book two nights minimum near the gate", "the Panorama Route stop most visitors skip and shouldn't". Front-load the core takeaway in the opening paragraph so AI-mode search can cite it.
- REPLACEABILITY TEST (before you finalise): could an AI answer this reader's question in a single paragraph and make the whole article redundant? If yes, it has no fingerprint of its own — sharpen the angle and add real, concrete detail until a generic one-paragraph answer could not replace it.
- READER-QUESTION GAP: build the piece around ONE real question a traveller would actually type — phrased the way a person asks it ("is Hazyview close enough to Kruger for a day trip?"), not the way a marketer titles a page ("Your Complete Guide to Kruger Day Trips"). Answer it directly in the opening, then cover the part the competing top-ranking pages skip: the caveat, the real timing/cost driver, or the "it depends on…" they leave out. Do NOT name, quote, or invent a specific forum, thread, or commenter — this is a framing device for choosing the question, not a source to cite.
- HONESTY RULE: adopt the experienced-host voice, but do NOT invent guest reviews, guest names, booking statistics, occupancy numbers, or any other "proprietary Woodpecker Guesthouse data" that isn't provided to you. Do NOT invent room names, room counts, prices, or amenities beyond general statements like "family rooms" or "budget rooms" — never a specific rate. Use real, general facts about the region (geography, driving distances, park gate hours as widely known, general travel-planning realities) and the guesthouse's genuine positioning (affordable, family-friendly, close to Kruger) — a distinct perspective, never fabricated evidence.
- ANTI-SLOP RULES (these are the tells that make copy read as AI-generated — avoid every one):
  - No throat-clearing openers ("Here's the thing", "Let me be clear") and no faux-insight setups ("What nobody tells you", "The part everyone misses"). State the point.
  - No binary contrasts ("It's not X, it's Y" / "The question isn't X, it's Y") and no negative listing ("Not a X. Not a Y. A Z."). Say the thing directly.
  - No colon reveals (noun phrase, colon, dramatic lowercase reveal) and no rhetorical setups ("What if I told you", "Think about it:").
  - No importance puffery ("marks a pivotal moment", "plays a vital role", "stands as a testament"). State the fact and let the reader judge.
  - No weasel attribution ("experts agree", "studies show", "research suggests"). Name a real, verifiable source or cut the claim — this is the HONESTY RULE restated: never invent authority.
  - No trailing "-ing" clauses that pretend to explain significance ("highlighting our commitment to…", "underscoring…", "reflecting…"). Give the concrete consequence instead.
  - No fake-strong verbs ("serves as a centralised hub for") where "is" or "has" is clearer. No synonym cycling — if a word is the right word, repeat it.
  - No dramatic fragmentation ("That's it. That's the whole thing.") and no stack of one-line punchy paragraphs. Vary sentence length the way a person does.
  - No fake-profound closing line, and no "In conclusion" / "Ultimately" / "Overall" recap paragraph. End on the last concrete point or the CTA.
  - Banned words: delve, foster, leverage, utilise, facilitate, empower, streamline, robust, cutting-edge, paradigm shift, game changer, tapestry, realm, beacon, multifaceted, meticulous, intricate, paramount, transformative, elevate, embark, supercharge, harness, ever-evolving.
  - Banned filler phrases: "it's worth noting", "it's important to note", "at the end of the day", "when it comes to", "in today's world", "in the world of", "the reality is", "in this article", "let's dive in".
  - Em dashes: 1-2 in the whole article at most, and only where a comma or full stop would genuinely read worse. No decorative dashes.
  - Formatting: no emoji in headings, no bold sprinkled mid-sentence for emphasis, no bullet list where two sentences of prose read better.
  - No rule-of-three padding - three adjectives, three phrases, or three-item lists where you actually have one or two. Use the number of items you really have.
  - No 'Despite its X, [subject] faces several challenges... yet continues to thrive' formula, and no manufactured 'Challenges' or 'Future outlook' section unless there is something concrete and specific to say.
  - No proving importance by listing coverage ('featured in X, Y and other outlets', 'has a growing social media presence'). Show the specific thing that makes it matter.
  - Headings in sentence case, not Title Case. Do not skip heading levels. No horizontal rules between sections.
  - No inline-header vertical lists (a run of '**Label:** explanation' bullets down the page) where prose or a plain list reads better.
  - Straight quotes and apostrophes only - never curly/smart quotes.
  - Never emit model artefacts: no lenticular brackets, no [cite: N] or [span_N] markers, no contentReference or oaicite tags, no dagger symbols, no '[insert ...]' placeholders, no knowledge-cutoff disclaimers ('as of my last update'). Any of these means the draft is broken - rewrite it, do not patch it.
  - Banned words (current-model cluster, refresh on model release): showcasing, emphasizing, underscores, testament, additionally, moreover, furthermore, notably, pivotal, seamless, nestled, vibrant, boasts, align with.
  - These are signals, not laws. The goal is prose a real person would write, not evading a detector - if a flagged construction is genuinely the clearest way to say something, keep the meaning and rewrite the sentence rather than contorting around the rule.
  - Source and expiry: adapted from Wikipedia's 'Signs of AI writing' (WikiProject AI Cleanup). AI tells are model-specific and drift with each release - re-validate the word lists against that guide on every major model release.
- End EVERY article with a call-to-action section titled "## Plan your stay at Woodpecker Guesthouse". The section should invite readers to view rooms and get in touch, using only these two relative links: [our rooms](/accommodation) and [contact us](/contact). Do NOT include a phone number, WhatsApp number, email address, or any other contact detail — none is confirmed for this article. Keep the tone warm and welcoming.

The article category is: ${opts.category}. ${
    opts.recentTitles.length
      ? `Do NOT repeat or closely paraphrase any of these recent titles: ${opts.recentTitles.join("; ")}.`
      : ""
  }`;

  const userPrompt = `Write an expert, SEO-optimised blog article for the category "${opts.category}". Follow all the system instructions carefully.

Return your response in EXACTLY this format, with nothing before or after it:
1. A single-line JSON object (no code fences) containing ONLY these keys: "title" (max 70 chars), "slug" (url-safe, lowercase, hyphens only), "excerpt" (max 200 chars), "meta_title" (max 60 chars, include "Woodpecker Guesthouse"), "meta_description" (max 160 chars). Do NOT put the article body in the JSON.
2. On its own line, the exact delimiter: ===BODY===
3. After the delimiter, the full article in GitHub-flavoured Markdown (600-900 words, use ## headings and bullet points, ending with the "## Plan your stay at Woodpecker Guesthouse" section).`;

  const response = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text"
  );
  if (!textBlock) {
    throw new Error("No text content returned from Claude.");
  }

  let raw = textBlock.text.trim();
  raw = raw.replace(/^```(?:json|markdown)?\s*/i, "").replace(/```\s*$/i, "").trim();

  const delimiter = "===BODY===";
  const delimiterIndex = raw.indexOf(delimiter);

  let metaRaw = raw;
  let extractedBody = "";
  if (delimiterIndex !== -1) {
    metaRaw = raw.slice(0, delimiterIndex);
    extractedBody = raw.slice(delimiterIndex + delimiter.length).trim();
  }

  const firstBrace = metaRaw.indexOf("{");
  const lastBrace = metaRaw.lastIndexOf("}");
  const jsonSlice = firstBrace !== -1 && lastBrace > firstBrace ? metaRaw.slice(firstBrace, lastBrace + 1) : metaRaw;

  let parsed: any;
  try {
    parsed = JSON.parse(jsonSlice);
  } catch {
    parsed = JSON.parse(escapeJsonControlChars(jsonSlice));
  }

  const title = String(parsed.title ?? "Untitled").trim().slice(0, 70);
  const slug = parsed.slug ? slugify(String(parsed.slug)) : slugify(title);
  const excerpt = String(parsed.excerpt ?? "").slice(0, 200);
  const meta_title = String(parsed.meta_title ?? title).slice(0, 60);
  const meta_description = String(parsed.meta_description ?? excerpt).slice(0, 160);
  let body_md = extractedBody || String(parsed.body_md ?? "");

  const ctaHeading = "## Plan your stay at Woodpecker Guesthouse";
  if (!body_md.includes(ctaHeading)) {
    body_md += `\n\n${ctaHeading}\n\nReady to see the Panorama Route and Kruger for yourself? Browse [our rooms](/accommodation) or [contact us](/contact) to plan your stay.\n`;
  }

  return { title, slug, excerpt, meta_title, meta_description, body_md };
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build` (in `woodpecker-guesthouse/`)
Expected: build fails at this point only if `@anthropic-ai/sdk` isn't installed yet — that's fixed in Task 15. If the package is already present from a prior task run, expect a clean build with no new route referencing this file yet, so nothing changes in the output.

- [ ] **Step 3: Commit**

```bash
git branch --show-current
git add woodpecker-guesthouse/src/lib/blog/generator.ts
git commit -m "feat(woodpecker-guesthouse): add AI blog generator with compliance guard"
```

---

### Task 4: Blog Review Email

**Files:**
- Create: `src/lib/blog/email.ts`

**Interfaces:**
- Produces: `sendBlogReviewEmail(opts: { titles: string[] }): Promise<boolean>`.
- Consumes: env `RESEND_API_KEY`, `CONTACT_TO_EMAIL` (both already in `.env.example` from Plan A).

- [ ] **Step 1: Write `src/lib/blog/email.ts`**

```ts
import { Resend } from "resend";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://woodpeckersguesthouse.co.za";

/** Notifies the admin that new AI-drafted blog posts are waiting for review.
 *  Reuses RESEND_API_KEY + CONTACT_TO_EMAIL — the same pair the contact form
 *  already uses — rather than inventing a dedicated admin-email env var. */
export async function sendBlogReviewEmail(opts: { titles: string[] }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    console.warn("[blog-email] RESEND_API_KEY or CONTACT_TO_EMAIL not configured — skipping review email.");
    return false;
  }

  const reviewUrl = `${SITE_URL}/admin/blog`;
  const listItems = opts.titles.map((t) => `<li>${t}</li>`).join("");

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "Woodpecker Guesthouse Website <onboarding@resend.dev>",
    to,
    subject: `${opts.titles.length} new blog draft${opts.titles.length === 1 ? "" : "s"} awaiting review`,
    html: `<p>New AI-drafted blog posts are ready for your review. They will only go live once you approve them.</p><ul>${listItems}</ul><p><a href="${reviewUrl}">Review in the admin panel</a></p>`,
    text: `New AI-drafted blog posts are ready for review:\n\n${opts.titles.map((t) => `- ${t}`).join("\n")}\n\nReview here: ${reviewUrl}`,
  });

  if (error) {
    console.error("[blog-email] Resend error:", error);
    return false;
  }
  return true;
}
```

- [ ] **Step 2: Commit**

```bash
git branch --show-current
git add woodpecker-guesthouse/src/lib/blog/email.ts
git commit -m "feat(woodpecker-guesthouse): add blog review notification email"
```

---

### Task 5: Public Blog Data Layer

**Files:**
- Create: `src/lib/blog.ts`

**Interfaces:**
- Produces: `getBlogPosts(): Promise<BlogPost[]>`, `getBlogPostBySlug(slug: string): Promise<BlogPost | null>`.
- Consumes: `createPublicClient`, `supabasePublicConfigured` from `src/lib/supabase/public.ts` (Plan A); `BlogPost` from Task 2.

- [ ] **Step 1: Write `src/lib/blog.ts`**

```ts
import { createPublicClient, supabasePublicConfigured } from "@/lib/supabase/public";
import type { BlogPost } from "@/lib/types";

/** Public read: only published posts. Guarded the same way lib/rooms.ts and
 *  lib/gallery.ts are — createPublicClient() throws synchronously when env
 *  vars are unset, so every exported function checks supabasePublicConfigured()
 *  first and returns an empty/null fallback instead of crashing the page. */
export async function getBlogPosts(): Promise<BlogPost[]> {
  if (!supabasePublicConfigured()) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) {
    console.error("[blog] getBlogPosts failed:", error.message);
    return [];
  }
  return data as BlogPost[];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!supabasePublicConfigured()) return null;
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  if (error || !data) return null;
  return data as BlogPost;
}
```

- [ ] **Step 2: Commit**

```bash
git branch --show-current
git add woodpecker-guesthouse/src/lib/blog.ts
git commit -m "feat(woodpecker-guesthouse): add public blog data layer"
```

---

### Task 6: Article Typography + `react-markdown`

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: `.article-body` CSS class (consumed by Task 7's detail page, which wraps `<ReactMarkdown>` output in a `<div className="article-body">`).

- [ ] **Step 1: Append the typography block to `src/app/globals.css`**

Add after the existing `body { ... }` rule (do not touch anything above it):

```css

/* Blog article typography — bespoke, not raw markdown/Tailwind Typography.
   Fraunces for headings (matches the rest of the site's display font),
   Figtree body copy, warm-palette tokens already defined above. */
.article-body {
  font-family: var(--font-sans);
  color: var(--ink);
  font-size: 1.0625rem;
  line-height: 1.75;
}
.article-body > * + * {
  margin-top: 1.25em;
}
.article-body h2 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--ink);
  margin-top: 2em;
}
.article-body h3 {
  font-family: var(--font-display);
  font-size: 1.25rem;
  color: var(--ink);
  margin-top: 1.75em;
}
.article-body a {
  color: var(--terracotta);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.article-body ul,
.article-body ol {
  padding-left: 1.5em;
}
.article-body li + li {
  margin-top: 0.4em;
}
.article-body strong {
  color: var(--ink);
  font-weight: 600;
}
.article-body blockquote {
  border-left: 3px solid var(--terracotta);
  padding-left: 1em;
  color: var(--muted);
  font-style: italic;
}
```

- [ ] **Step 2: Commit**

```bash
git branch --show-current
git add woodpecker-guesthouse/src/app/globals.css
git commit -m "feat(woodpecker-guesthouse): add bespoke article-body typography"
```

---

### Task 7: Public Blog Pages

**Files:**
- Create: `src/app/blog/page.tsx`
- Create: `src/app/blog/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getBlogPosts`, `getBlogPostBySlug` (Task 5); `.article-body` CSS (Task 6); `react-markdown` (installed in Task 15).

- [ ] **Step 1: Write `src/app/blog/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getBlogPosts } from "@/lib/blog";

export const revalidate = 60; // ISR: new/approved posts go live within a minute, no redeploy needed

export const metadata: Metadata = {
  title: "Blog",
  description: "Guides to Hazyview, the Panorama Route and Kruger National Park from Woodpecker Guesthouse.",
};

export default async function BlogIndexPage() {
  const posts = await getBlogPosts();

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-ink mb-2">Blog</h1>
      <p className="text-muted mb-10 max-w-2xl">
        Travel guides and local tips for Hazyview, the Panorama Route and Kruger National Park.
      </p>
      {posts.length === 0 ? (
        <p className="text-muted">Articles are being added — check back soon.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="rounded-xl border border-line bg-white overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/3] bg-sand/40 relative">
                {post.hero_image && (
                  <Image src={post.hero_image} alt={post.title} fill className="object-cover" />
                )}
              </div>
              <div className="p-4">
                {post.category && (
                  <p className="text-terracotta text-xs font-medium uppercase tracking-wide mb-1">
                    {post.category}
                  </p>
                )}
                <p className="text-ink font-medium">{post.title}</p>
                {post.excerpt && <p className="text-muted text-sm mt-1 line-clamp-2">{post.excerpt}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Write `src/app/blog/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/blog";

export const revalidate = 60; // ISR: admin edits go live within a minute, no redeploy needed

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || post.meta_description || "",
    image: post.hero_image || undefined,
    datePublished: post.published_at || undefined,
    dateModified: post.updated_at,
    author: { "@type": "Organization", name: "Woodpecker Guesthouse" },
    publisher: { "@type": "Organization", name: "Woodpecker Guesthouse" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <main className="max-w-3xl mx-auto px-6 py-16">
        {post.hero_image ? (
          <div className="aspect-[16/9] relative rounded-xl overflow-hidden mb-8 bg-sand/40">
            <Image src={post.hero_image} alt={post.title} fill className="object-cover" />
          </div>
        ) : (
          <div className="aspect-[16/9] rounded-xl mb-8 bg-sand/40" />
        )}
        {post.category && (
          <p className="text-terracotta text-xs font-medium uppercase tracking-wide mb-2">{post.category}</p>
        )}
        <h1 className="font-display text-3xl md:text-4xl text-ink mb-3">{post.title}</h1>
        {post.published_at && (
          <time className="block text-muted text-sm mb-8">
            {new Date(post.published_at).toLocaleDateString("en-ZA", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        )}
        <div className="article-body">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </main>
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git branch --show-current
git add woodpecker-guesthouse/src/app/blog/page.tsx "woodpecker-guesthouse/src/app/blog/[slug]/page.tsx"
git commit -m "feat(woodpecker-guesthouse): add public blog index + detail pages"
```

---

### Task 8: Sitemap Update

**Files:**
- Modify: `src/app/sitemap.ts`

**Interfaces:**
- Consumes: `getBlogPosts` from Task 5.

- [ ] **Step 1: Update `src/app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { getRooms } from "@/lib/rooms";
import { getBlogPosts } from "@/lib/blog";

const BASE_URL = "https://woodpeckersguesthouse.co.za";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [rooms, posts] = await Promise.all([getRooms(), getBlogPosts()]);
  const staticRoutes = [
    "",
    "/accommodation",
    "/conferencing",
    "/restaurant",
    "/gallery",
    "/attractions",
    "/blog",
    "/contact",
    "/privacy-policy",
    "/terms-conditions",
  ].map((path) => ({ url: `${BASE_URL}${path}`, lastModified: new Date() }));

  const roomRoutes = rooms.map((room) => ({
    url: `${BASE_URL}/accommodation/${room.slug}`,
    lastModified: new Date(),
  }));

  const blogRoutes = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
  }));

  return [...staticRoutes, ...roomRoutes, ...blogRoutes];
}
```

- [ ] **Step 2: Commit**

```bash
git branch --show-current
git add woodpecker-guesthouse/src/app/sitemap.ts
git commit -m "feat(woodpecker-guesthouse): add /blog and blog posts to sitemap"
```

---

### Task 9: Admin Blog Data Layer

**Files:**
- Create: `src/lib/admin/blog.ts`

**Interfaces:**
- Produces: `getAllPostsAdmin(): Promise<BlogPost[]>`, `getPostByIdAdmin(id: string): Promise<BlogPost | null>`, `updatePost(id: string, patch: Partial<BlogPost>): Promise<{ error: string | null }>`, `deletePost(id: string): Promise<{ error: string | null }>`.
- Consumes: `createClient` from `src/lib/supabase/client.ts` (Plan B); `BlogPost` from Task 2.

- [ ] **Step 1: Write `src/lib/admin/blog.ts`**

```ts
import { createClient } from "@/lib/supabase/client";
import type { BlogPost } from "@/lib/types";

/** Admin read: ALL posts regardless of status (RLS: is_staff() allows this;
 *  the public getBlogPosts() in lib/blog.ts only ever sees status: 'published'). */
export async function getAllPostsAdmin(): Promise<BlogPost[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("[admin/blog] getAllPostsAdmin failed:", error.message);
    return [];
  }
  return data as BlogPost[];
}

export async function getPostByIdAdmin(id: string): Promise<BlogPost | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id).single();
  if (error || !data) return null;
  return data as BlogPost;
}

export async function updatePost(id: string, patch: Partial<BlogPost>): Promise<{ error: string | null }> {
  const supabase = createClient();
  const finalPatch: Partial<BlogPost> = { ...patch };
  // Approving a draft that has no schedule must get one, otherwise the daily
  // publish cron (scheduled_for <= now(), see Task 12) skips it forever.
  if (patch.status === "approved") {
    const current = await getPostByIdAdmin(id);
    if (current && !current.scheduled_for) {
      finalPatch.scheduled_for = new Date().toISOString();
    }
  }
  const { error } = await supabase.from("blog_posts").update(finalPatch).eq("id", id);
  return { error: error?.message ?? null };
}

export async function deletePost(id: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  return { error: error?.message ?? null };
}
```

- [ ] **Step 2: Commit**

```bash
git branch --show-current
git add woodpecker-guesthouse/src/lib/admin/blog.ts
git commit -m "feat(woodpecker-guesthouse): add admin blog data layer"
```

---

### Task 10: "Generate a Draft Now" API Route

**Files:**
- Create: `src/app/api/admin/blog/generate/route.ts`

**Interfaces:**
- Consumes: `createClient` (server) from `src/lib/supabase/server.ts`; `generateBlogPost` (Task 3); `pickNextCategory`, `BLOG_CATEGORIES` (Task 2); `sendBlogReviewEmail` (Task 4).
- Produces: `POST /api/admin/blog/generate` — staff-authed, body `{ category?: string }` optional, returns `{ post: BlogPost }` or an error.

- [ ] **Step 1: Write `src/app/api/admin/blog/generate/route.ts`**

```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateBlogPost } from "@/lib/blog/generator";
import { BLOG_CATEGORIES, pickNextCategory, type BlogCategory } from "@/lib/blog/categories";
import { sendBlogReviewEmail } from "@/lib/blog/email";

export const runtime = "nodejs";
export const maxDuration = 60;

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  // Same auth pattern as the upload route (Task 9, Plan B): server client
  // returns null when Supabase isn't configured, treat that as unauthorized too.
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "staff"].includes(profile.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}) as { category?: string });

  try {
    const { data: recent } = await supabase
      .from("blog_posts")
      .select("title, category")
      .order("created_at", { ascending: false })
      .limit(12);
    const recentTitles = (recent ?? []).map((r) => r.title).filter(Boolean);
    const recentCategories = (recent ?? []).map((r) => r.category).filter(Boolean);

    let category: BlogCategory;
    if (body.category && (BLOG_CATEGORIES as readonly string[]).includes(body.category)) {
      category = body.category as BlogCategory;
    } else {
      category = pickNextCategory(recentCategories);
    }

    const generated = await generateBlogPost({ category, recentTitles });

    let slug = generated.slug || slugify(generated.title) || "article";
    for (let attempt = 0; attempt < 10; attempt++) {
      const { count } = await supabase
        .from("blog_posts")
        .select("id", { count: "exact", head: true })
        .eq("slug", slug);
      if (!count) break;
      slug = `${generated.slug}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    }

    const { data: inserted, error } = await supabase
      .from("blog_posts")
      .insert({
        title: generated.title,
        slug,
        excerpt: generated.excerpt,
        meta_title: generated.meta_title,
        meta_description: generated.meta_description,
        content: generated.body_md,
        category,
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await sendBlogReviewEmail({ titles: [generated.title] }).catch((err) =>
      console.error("[blog/generate] review email failed:", err)
    );

    return NextResponse.json({ post: inserted }, { status: 201 });
  } catch (error: any) {
    const message = error?.message || "Failed to generate article";
    if (message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json(
        { error: "AI is not configured yet. Add ANTHROPIC_API_KEY in Vercel to enable article generation." },
        { status: 400 }
      );
    }
    console.error("[blog/generate]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git branch --show-current
git add "woodpecker-guesthouse/src/app/api/admin/blog/generate/route.ts"
git commit -m "feat(woodpecker-guesthouse): add on-demand blog draft generation route"
```

---

### Task 11: Monthly Generate Cron

**Files:**
- Create: `src/app/api/cron/generate-blog/route.ts`

**Interfaces:**
- Consumes: `createAdminClient` from `src/lib/supabase/admin.ts` (Plan B); `generateBlogPost` (Task 3); `pickNextCategory` (Task 2); `sendBlogReviewEmail` (Task 4). Env: `CRON_SECRET`.
- Produces: `GET /api/cron/generate-blog` — `CRON_SECRET`-gated, drafts 2 posts.

- [ ] **Step 1: Write `src/app/api/cron/generate-blog/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateBlogPost } from "@/lib/blog/generator";
import { pickNextCategory, type BlogCategory } from "@/lib/blog/categories";
import { sendBlogReviewEmail } from "@/lib/blog/email";

export const runtime = "nodejs";
export const maxDuration = 300;

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  try {
    const { data: recent } = await supabase
      .from("blog_posts")
      .select("title, category")
      .order("created_at", { ascending: false })
      .limit(12);
    const recentTitles = (recent ?? []).map((r) => r.title).filter(Boolean);
    const recentCategories = (recent ?? []).map((r) => r.category).filter(Boolean);

    const ensureUniqueSlug = async (baseSlug: string): Promise<string> => {
      let candidate = baseSlug || "article";
      for (let attempt = 0; attempt < 10; attempt++) {
        const { count } = await supabase
          .from("blog_posts")
          .select("id", { count: "exact", head: true })
          .eq("slug", candidate);
        if (!count) return candidate;
        candidate = `${baseSlug}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      }
      throw new Error(`Could not generate a unique slug for "${baseSlug}"`);
    };

    const category1: BlogCategory = pickNextCategory(recentCategories);
    const article1 = await generateBlogPost({ category: category1, recentTitles });
    const slug1 = await ensureUniqueSlug(article1.slug || slugify(article1.title));

    const category2: BlogCategory = pickNextCategory([...recentCategories, category1]);
    const article2 = await generateBlogPost({ category: category2, recentTitles: [...recentTitles, article1.title] });
    const slug2 = await ensureUniqueSlug(article2.slug || slugify(article2.title));

    const { error } = await supabase.from("blog_posts").insert([
      {
        title: article1.title,
        slug: slug1,
        excerpt: article1.excerpt,
        meta_title: article1.meta_title,
        meta_description: article1.meta_description,
        content: article1.body_md,
        category: category1,
        status: "draft",
      },
      {
        title: article2.title,
        slug: slug2,
        excerpt: article2.excerpt,
        meta_title: article2.meta_title,
        meta_description: article2.meta_description,
        content: article2.body_md,
        category: category2,
        status: "draft",
      },
    ]);

    if (error) {
      throw new Error(error.message);
    }

    await sendBlogReviewEmail({ titles: [article1.title, article2.title] }).catch((err) =>
      console.error("[generate-blog] review email failed:", err)
    );

    return NextResponse.json({ success: true, generated: 2 });
  } catch (error: any) {
    console.error("[generate-blog] Error:", error);
    return NextResponse.json({ error: "Failed to generate blog posts", message: error?.message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git branch --show-current
git add "woodpecker-guesthouse/src/app/api/cron/generate-blog/route.ts"
git commit -m "feat(woodpecker-guesthouse): add monthly blog generation cron"
```

> **Correction (found during implementation):** running this route locally with no Supabase env vars set threw `supabaseUrl is required` from `createAdminClient()` — the call sat before the `try` block even started, so it was never caught, and Next returned an empty-body 500 instead of a JSON error. `createAdminClient()`'s only prior caller (the upload route, Plan B) was protected indirectly through an RLS-client check that happens to run first; crons have no session to check. Fixed by adding `supabaseAdminConfigured()` to `src/lib/supabase/admin.ts` (same shape as `supabaseConfigured()`/`supabasePublicConfigured()`) and an early guard — `if (!supabaseAdminConfigured()) return NextResponse.json({ error: "Supabase is not configured yet." }, { status: 503 });` — right after the `CRON_SECRET` check, before `createAdminClient()` is called, in both this route and Task 12's. See commit `711cea07`.

---

### Task 12: Daily Publish Cron

**Files:**
- Create: `src/app/api/cron/publish-blog/route.ts`

**Interfaces:**
- Consumes: `createAdminClient` (Plan B). Env: `CRON_SECRET`.
- Produces: `GET /api/cron/publish-blog` — flips `approved` + due posts to `published`.

- [ ] **Step 1: Write `src/app/api/cron/publish-blog/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  try {
    const nowIso = new Date().toISOString();
    const { data: due, error: selectError } = await supabase
      .from("blog_posts")
      .select("id, slug")
      .eq("status", "approved")
      .lte("scheduled_for", nowIso);

    if (selectError) throw new Error(selectError.message);
    if (!due || due.length === 0) {
      return NextResponse.json({ published: 0 });
    }

    const { error: updateError } = await supabase
      .from("blog_posts")
      .update({ status: "published", published_at: nowIso })
      .in(
        "id",
        due.map((p) => p.id)
      );
    if (updateError) throw new Error(updateError.message);

    revalidatePath("/blog");
    for (const post of due) revalidatePath(`/blog/${post.slug}`);

    return NextResponse.json({ published: due.length, postIds: due.map((p) => p.id) });
  } catch (error: any) {
    console.error("[publish-blog] Error:", error);
    return NextResponse.json({ error: "Failed to publish blog posts", message: error?.message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git branch --show-current
git add "woodpecker-guesthouse/src/app/api/cron/publish-blog/route.ts"
git commit -m "feat(woodpecker-guesthouse): add daily blog publish cron"
```

---

### Task 13: Admin Blog List Page

**Files:**
- Create: `src/app/admin/blog/page.tsx`

**Interfaces:**
- Consumes: `getAllPostsAdmin`, `updatePost`, `deletePost` (Task 9); `BLOG_CATEGORIES` (Task 2); `POST /api/admin/blog/generate` (Task 10).

- [ ] **Step 1: Write `src/app/admin/blog/page.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllPostsAdmin, updatePost, deletePost } from "@/lib/admin/blog";
import type { BlogPost } from "@/lib/types";

const STATUS_LABEL: Record<BlogPost["status"], string> = {
  draft: "Draft",
  approved: "Approved",
  published: "Published",
  discarded: "Discarded",
};

const STATUS_STYLE: Record<BlogPost["status"], string> = {
  draft: "bg-sand/50 text-muted",
  approved: "bg-olive/15 text-olive-deep",
  published: "bg-terracotta/15 text-terracotta-deep",
  discarded: "bg-line text-muted",
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | BlogPost["status"]>("all");

  const load = () => {
    setLoading(true);
    getAllPostsAdmin().then((p) => {
      setPosts(p);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/admin/blog/generate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (id: string) => {
    await updatePost(id, { status: "approved" });
    load();
  };

  const handleDiscard = async (id: string) => {
    await updatePost(id, { status: "discarded" });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post permanently?")) return;
    await deletePost(id);
    load();
  };

  const filtered = filter === "all" ? posts : posts.filter((p) => p.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Blog</h1>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="rounded-full bg-terracotta text-white px-5 py-2 text-sm font-semibold hover:bg-terracotta-deep transition-colors disabled:opacity-50"
        >
          {generating ? "Generating…" : "Generate a draft now"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-2 text-sm">
        {(["all", "draft", "approved", "published", "discarded"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 transition-colors ${
              filter === s ? "bg-terracotta text-white" : "bg-white border border-line text-ink hover:bg-surface"
            }`}
          >
            {s === "all" ? "All" : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted">No posts yet.</p>
      ) : (
        <div className="rounded-xl border border-line bg-white divide-y divide-line">
          {filtered.map((post) => (
            <div key={post.id} className="flex items-center justify-between px-5 py-4 gap-4">
              <Link href={`/admin/blog/${post.id}`} className="min-w-0 flex-1 hover:underline">
                <p className="text-ink font-medium truncate">{post.title}</p>
                <p className="text-muted text-xs">{post.category}</p>
              </Link>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS_STYLE[post.status]}`}>
                {STATUS_LABEL[post.status]}
              </span>
              <div className="flex gap-2 shrink-0">
                {post.status === "draft" && (
                  <button
                    onClick={() => handleApprove(post.id)}
                    className="text-xs text-olive-deep hover:underline"
                  >
                    Approve
                  </button>
                )}
                {post.status !== "discarded" && post.status !== "published" && (
                  <button onClick={() => handleDiscard(post.id)} className="text-xs text-muted hover:underline">
                    Discard
                  </button>
                )}
                <button onClick={() => handleDelete(post.id)} className="text-xs text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git branch --show-current
git add woodpecker-guesthouse/src/app/admin/blog/page.tsx
git commit -m "feat(woodpecker-guesthouse): add admin blog list + generate/approve/discard UI"
```

---

### Task 14: Admin Blog Edit Page

**Files:**
- Create: `src/app/admin/blog/[id]/page.tsx`

**Interfaces:**
- Consumes: `getPostByIdAdmin`, `updatePost` (Task 9); `BLOG_CATEGORIES` (Task 2).

- [ ] **Step 1: Write `src/app/admin/blog/[id]/page.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPostByIdAdmin, updatePost } from "@/lib/admin/blog";
import { BLOG_CATEGORIES } from "@/lib/blog/categories";
import type { BlogPost } from "@/lib/types";

export default function AdminBlogEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getPostByIdAdmin(params.id).then(setPost);
  }, [params.id]);

  if (!post) return <p className="text-muted">Loading…</p>;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    const { error: updateError } = await updatePost(post.id, {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      meta_title: post.meta_title,
      meta_description: post.meta_description,
      content: post.content,
      category: post.category,
      hero_image: post.hero_image,
      status: post.status,
    });
    setSaving(false);
    if (updateError) setError(updateError);
    else {
      setSaved(true);
      router.refresh();
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display text-2xl text-ink">{post.title}</h1>
      <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-line bg-white p-6">
        <div>
          <label className="block text-sm text-ink mb-1">Title</label>
          <input
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
            value={post.title}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-ink mb-1">Slug</label>
          <input
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
            value={post.slug}
            onChange={(e) => setPost({ ...post, slug: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-ink mb-1">Excerpt</label>
          <textarea
            rows={2}
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta resize-y"
            value={post.excerpt}
            onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-ink mb-1">Meta title</label>
            <input
              className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
              value={post.meta_title}
              onChange={(e) => setPost({ ...post, meta_title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-ink mb-1">Category</label>
            <select
              className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
              value={post.category}
              onChange={(e) => setPost({ ...post, category: e.target.value })}
            >
              {BLOG_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-ink mb-1">Meta description</label>
          <textarea
            rows={2}
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta resize-y"
            value={post.meta_description}
            onChange={(e) => setPost({ ...post, meta_description: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-ink mb-1">Content (Markdown)</label>
          <textarea
            rows={16}
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta resize-y font-mono"
            value={post.content}
            onChange={(e) => setPost({ ...post, content: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-ink mb-1">Hero image URL</label>
          <input
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
            placeholder="Uploaded via the Gallery admin, or paste a site-media URL"
            value={post.hero_image ?? ""}
            onChange={(e) => setPost({ ...post, hero_image: e.target.value || null })}
          />
        </div>
        <div>
          <label className="block text-sm text-ink mb-1">Status</label>
          <select
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
            value={post.status}
            onChange={(e) => setPost({ ...post, status: e.target.value as BlogPost["status"] })}
          >
            <option value="draft">Draft</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
            <option value="discarded">Discarded</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        {saved && <p className="text-sm text-olive-deep bg-olive/10 rounded-lg px-3 py-2">Saved.</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-terracotta text-white px-6 py-2.5 text-sm font-semibold hover:bg-terracotta-deep transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git branch --show-current
git add "woodpecker-guesthouse/src/app/admin/blog/[id]/page.tsx"
git commit -m "feat(woodpecker-guesthouse): add admin blog edit page"
```

---

### Task 15: Nav, Dependencies, Cron Config, Env

**Files:**
- Modify: `src/components/admin/AdminSidebar.tsx`
- Modify: `package.json`
- Create: `vercel.json`
- Modify: `.env.example`

**Interfaces:**
- No new interfaces — wires up what Tasks 1-14 already produced.

- [ ] **Step 1: Add Blog to the admin nav**

In `src/components/admin/AdminSidebar.tsx`, change the `NAV` array:

```ts
const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/rooms", label: "Rooms" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/security", label: "Security" },
];
```

- [ ] **Step 2: Add dependencies to `package.json`**

In the `dependencies` block, add (keep alphabetical, matching the existing list):

```json
    "@anthropic-ai/sdk": "^0.111.0",
    "react-markdown": "^10.1.0",
```

(Full resulting `dependencies` block, for reference — `@anthropic-ai/sdk` after `@supabase/supabase-js`, `react-markdown` after `react-dom`:)

```json
  "dependencies": {
    "@anthropic-ai/sdk": "^0.111.0",
    "@supabase/ssr": "^0.12.3",
    "@supabase/supabase-js": "^2.110.8",
    "next": "16.2.1",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "react-markdown": "^10.1.0",
    "resend": "^6.18.0",
    "server-only": "^0.0.1",
    "sharp": "^0.35.3"
  },
```

- [ ] **Step 3: Install**

Run: `npm install` (in `woodpecker-guesthouse/`)
Expected: `@anthropic-ai/sdk` and `react-markdown` appear in `package-lock.json`, no errors.

- [ ] **Step 4: Create `vercel.json`**

```json
{
  "crons": [
    { "path": "/api/cron/generate-blog", "schedule": "0 6 1 * *" },
    { "path": "/api/cron/publish-blog", "schedule": "0 6 * * *" }
  ]
}
```

(Monthly generation on the 1st at 06:00 UTC; daily publish check at 06:00 UTC. Both within Vercel Hobby's once-per-day-per-job cron limit.)

- [ ] **Step 5: Add env vars to `.env.example`**

Append:

```
ANTHROPIC_API_KEY=
CRON_SECRET=
```

- [ ] **Step 6: Commit**

```bash
git branch --show-current
git add woodpecker-guesthouse/src/components/admin/AdminSidebar.tsx woodpecker-guesthouse/package.json woodpecker-guesthouse/package-lock.json woodpecker-guesthouse/vercel.json woodpecker-guesthouse/.env.example
git commit -m "feat(woodpecker-guesthouse): wire up blog nav, deps, cron schedule, env vars"
```

---

### Task 16: Full Verification Pass + README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Run the full test suite**

Run: `node --test test/antibot.test.mjs test/blog-categories.test.mjs`
Expected: all tests PASS (4 + 3 = 7 total).

- [ ] **Step 2: Run the build**

Run: `npm run build` (in `woodpecker-guesthouse/`)
Expected: succeeds, `/blog` and `/blog/[slug]` appear in the route list with ISR (`○`/`●` + revalidate annotation), `/admin/blog` and `/admin/blog/[id]` appear as dynamic admin routes, `/api/admin/blog/generate`, `/api/cron/generate-blog`, `/api/cron/publish-blog` appear as route handlers.

- [ ] **Step 3: Verify against a live dev server**

Run: `npm run dev` in the background, then:
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/blog` → expect `200`
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/cron/generate-blog` → expect `401` (no `CRON_SECRET` header sent, and this check only skips in dev per the route's own `NODE_ENV === "production"` guard — confirm by checking `NODE_ENV` in `npm run dev`'s output; if the local dev server doesn't set `NODE_ENV=production`, expect the request to succeed or fail on the missing `ANTHROPIC_API_KEY`/Supabase config instead — either way, confirm the route does not throw an unhandled 500 with no JSON body)
- `curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/admin/blog/generate` → expect `401` (no session cookie)
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin/blog` → expect `307` (redirect to `/admin/login`, same as every other `/admin/*` route)
- `curl -s http://localhost:3000/sitemap.xml | grep -c "<url>"` → expect a count ≥ the static route count from Plan A (blog routes add to it, never subtract)

Stop the dev server when done.

- [ ] **Step 4: Update `README.md`**

Add a "Blog admin" section after the existing "Admin panel" section:

```markdown

## Blog admin

`/admin/blog` — AI-drafted articles about Hazyview, the Panorama Route and Kruger, reviewed before they go live.

- **Monthly generation cron** (`/api/cron/generate-blog`, 1st of the month) drafts 2 posts and emails `CONTACT_TO_EMAIL` to review.
- **"Generate a draft now"** button on `/admin/blog` does the same thing on demand.
- **Review queue:** every draft starts as `Draft`. Click **Approve** to schedule it (publishes on the next daily run), or **Discard**. Nothing reaches the public site without a human clicking Approve.
- **Daily publish cron** (`/api/cron/publish-blog`) flips `Approved` posts to `Published` once their schedule is due.
- **No fabricated hero images or contact details:** generated posts start with no hero image and a CTA that links to `/accommodation` and `/contact` only — never a photo or phone number that isn't real. Add a hero image the same way as room photos: paste a `site-media` URL into the post's edit page.
- Requires `ANTHROPIC_API_KEY` and `CRON_SECRET` in Vercel — both crons return 401 without them (in production; local dev skips the `CRON_SECRET` check).
```

Update "Known follow-ups" — add:

```markdown
- Blog pipeline crons (`vercel.json`) need `ANTHROPIC_API_KEY` and `CRON_SECRET` set in Vercel before they'll run; until then the admin's "Generate a draft now" button is the only working entry point, and it needs the same `ANTHROPIC_API_KEY`.
```

- [ ] **Step 5: Commit**

```bash
git branch --show-current
git add woodpecker-guesthouse/README.md
git commit -m "docs(woodpecker-guesthouse): document blog admin pipeline"
```

---

## Deploy-Time Follow-Ups (not part of this plan's scope)

- Provision `ANTHROPIC_API_KEY`, `CRON_SECRET`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL` in Vercel (the latter two already needed by the contact form from Plan A).
- Once a live Supabase project exists (still pending per Plan A/B's open items), run `0003_blog.sql` after `0001` and `0002`.
- First real generation run should be triggered manually via "Generate a draft now" and reviewed end-to-end (draft → approve → confirm it actually appears on `/blog` after the next publish cron, or approve then manually hit `/api/cron/publish-blog` with the right `CRON_SECRET` header to confirm immediately) before trusting the monthly cron unattended.
