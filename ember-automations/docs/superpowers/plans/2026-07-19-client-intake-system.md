# Client Intake System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Ember Automations client-intake web app — the Track-A vessel that assembles per-client questionnaires from a Core+Module bank, collects answers via unguessable no-login links, and hands submissions to Claude Code (`review-intake`) for follow-ups.

**Architecture:** A Next.js (App Router) + TypeScript app in `ember-automations/`, backed by Supabase (Postgres + Storage) and Resend for email. Pure logic (question bank, slug, gap detection, markdown export) is TDD-tested with Vitest; UI/DB/email flows are verified by driving them against the success criteria. No LLM runs inside the app.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Supabase (`@supabase/supabase-js`, `@supabase/ssr`), Resend, Vitest, Vercel.

> **Amendment (2026-07-19, during execution):** Pin **Next 15**, not 14 — Next 14's `require-hook.js` crashes on Node 24 (`Cannot read properties of undefined (reading 'endsWith')`). Next 15 makes `params`, `cookies()`, and `headers()` **async** — Tasks 7/10/11/13/14 must `await` them (route/page signatures take `params: Promise<{…}>`). Also set `outputFileTracingRoot` in `next.config.mjs` so Next doesn't infer the parent monorepo as the workspace root.

## Global Constraints

- **Repo location:** app scaffolds into `ember-automations/` — must NOT clobber existing `brand/`, `documents/`, `tindlovu-questionnaire/`, `docs/`.
- **Brand tokens (verbatim from `brand/BRAND.md`):** Ember Orange `--ember-500: #f97316`, `--ember-600: #ea580c`, `--ember-700: #c2410c`; ember gradient `linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fbbf24 100%)`; dark scale `--dark-900: #0a0a0f`, `--dark-800: #13131a`, `--dark-700: #1c1c27`; text `#e2e2f0` / muted `#6b6b8a`; font **Inter**; dark-first; glassmorphism cards; ember glow on CTAs.
- **No LLM in the core flow.** Submission review = deterministic only. AI-suggest is out of v1.
- **Client access:** unguessable slug, no login, save & resume. Admin: Supabase Auth restricted to one `ADMIN_EMAIL`.
- **Secrets:** all keys live in `ember-automations/.env.local`, **created by hand by the human** (a PreToolUse hook blocks agents writing `.env*`). Never commit secrets.
- **Answers model:** `answers` is a JSONB column on `questionnaires` keyed by question id → `{ value, round, saved_at }`. Only `questionnaires` + `uploads` tables. Follow-ups are extra rounds inside `question_set`.
- **Discipline:** DRY, YAGNI, TDD for pure logic, frequent commits, one deliverable per task.

---

## File Structure

```
ember-automations/
├── package.json, tsconfig.json, next.config.mjs, tailwind.config.ts,
│   postcss.config.mjs, vitest.config.ts, .env.local (hand-created), .env.example
├── supabase/migrations/0001_init.sql
├── src/
│   ├── lib/
│   │   ├── types.ts            # shared domain types
│   │   ├── questionBank.ts     # Core + Module A + Module B + assembly helpers
│   │   ├── slug.ts             # unguessable slug generator
│   │   ├── gapDetection.ts     # deterministic flags (missing critical, MoSCoW, warnings)
│   │   ├── exportMarkdown.ts   # submission → review-intake markdown
│   │   ├── supabaseServer.ts   # service-role + ssr server clients
│   │   ├── supabaseBrowser.ts  # browser client
│   │   └── email.ts            # Resend wrapper
│   ├── app/
│   │   ├── globals.css         # Ember tokens
│   │   ├── layout.tsx
│   │   ├── page.tsx            # simple landing/redirect
│   │   ├── intake/[slug]/page.tsx           # client questionnaire loader (server)
│   │   ├── intake/[slug]/QuestionnaireForm.tsx  # client form (save/resume/upload/submit)
│   │   ├── login/page.tsx      # admin sign-in
│   │   ├── admin/layout.tsx    # auth guard
│   │   ├── admin/page.tsx      # submissions list
│   │   ├── admin/new/page.tsx  # create questionnaire (curate modules)
│   │   ├── admin/[id]/page.tsx # submission view + flags + export + rounds
│   │   └── api/
│   │       ├── intake/[slug]/route.ts        # GET load, PATCH save, POST submit
│   │       ├── uploads/route.ts              # POST file → Storage
│   │       └── admin/questionnaires/route.ts # POST create
│   │       └── admin/questionnaires/[id]/route.ts # PATCH (add round / status)
│   └── middleware.ts           # admin route protection
└── docs/superpowers/{specs,plans}/…   # (spec + this plan)
```

---

### Task 1: Scaffold Next.js app + Ember design tokens + Vitest

**Files:**
- Create: `ember-automations/package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `.env.example`
- Create: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`

**Interfaces:**
- Produces: a running Next.js dev server with Ember-styled base layout; Vitest configured so later tasks can TDD.

- [ ] **Step 1: Initialize package + deps**

Run in `ember-automations/`:
```bash
npm init -y
npm install next@14 react@18 react-dom@18 @supabase/supabase-js @supabase/ssr resend
npm install -D typescript @types/react @types/node tailwindcss postcss autoprefixer vitest @vitejs/plugin-react jsdom
```

- [ ] **Step 2: Add config files**

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2021", "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext", "moduleResolution": "bundler", "jsx": "preserve",
    "strict": true, "noEmit": true, "esModuleInterop": true, "skipLibCheck": true,
    "resolveJsonModule": true, "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`next.config.mjs`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {};
export default nextConfig;
```

`postcss.config.mjs`:
```js
export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
```

`tailwind.config.ts`:
```ts
import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ember: { 500: "#f97316", 600: "#ea580c", 700: "#c2410c", 100: "#ffedd5", 50: "#fff7ed" },
        dark: { 900: "#0a0a0f", 800: "#13131a", 700: "#1c1c27", 600: "#252535", 500: "#2e2e42" },
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
```

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
export default defineConfig({
  test: { environment: "node", include: ["src/**/*.test.ts"] },
  resolve: { alias: { "@": new URL("./src", import.meta.url).pathname } },
});
```

`.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
ADMIN_EMAIL=alecsomers1980@gmail.com
NOTIFY_EMAIL=alecsomers1980@gmail.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Add scripts to `package.json`:
```json
"scripts": { "dev": "next dev", "build": "next build", "start": "next start", "test": "vitest run" }
```

- [ ] **Step 3: Ember global styles + layout**

`src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
:root { --ember-gradient: linear-gradient(135deg,#f97316 0%,#fb923c 50%,#fbbf24 100%); }
body { background:#0a0a0f; color:#e2e2f0; font-family:'Inter',system-ui,sans-serif; }
.ember-glow { box-shadow: 0 0 30px rgba(249,115,22,0.15); }
.glass { background: rgba(30,30,46,0.7); backdrop-filter: blur(12px); border:1px solid rgba(255,255,255,0.06); border-radius:16px; }
```

`src/app/layout.tsx`:
```tsx
import "./globals.css";
export const metadata = { title: "Ember Automations — Client Intake", description: "Client discovery questionnaire." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
```

`src/app/page.tsx`:
```tsx
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="glass ember-glow p-10 max-w-md text-center">
        <h1 className="text-3xl font-extrabold" style={{ backgroundImage: "var(--ember-gradient)", WebkitBackgroundClip: "text", color: "transparent" }}>
          Ember Automations
        </h1>
        <p className="mt-3 text-[#6b6b8a]">Client intake. Use the link we sent you, or sign in to admin.</p>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Verify dev server renders styled page**

Run: `npm run dev` and open `http://localhost:3000`.
Expected: dark page, ember-gradient "Ember Automations" heading, glass card. No console errors.

- [ ] **Step 5: Verify Vitest runs**

Run: `npm test`
Expected: "No test files found" (exit 0) — Vitest is wired and ready.

- [ ] **Step 6: Commit**
```bash
git add ember-automations/package.json ember-automations/tsconfig.json ember-automations/next.config.mjs ember-automations/tailwind.config.ts ember-automations/postcss.config.mjs ember-automations/vitest.config.ts ember-automations/.env.example ember-automations/src
git commit -m "feat(intake): scaffold Next.js app with Ember tokens + Vitest"
```

---

### Task 2: Domain types + question bank + assembly helpers (TDD)

**Files:**
- Create: `src/lib/types.ts`, `src/lib/questionBank.ts`, `src/lib/questionBank.test.ts`

**Interfaces:**
- Produces:
  - Types: `Question`, `QuestionType`, `ModuleId`, `QuestionnaireStatus`, `AnswerValue`, `Questionnaire`.
  - `CORE: Question[]`, `MODULES: Record<ModuleId, Question[]>`.
  - `assembleQuestionSet(modules: ModuleId[], custom?: Question[]): Question[]` — Core first, then chosen modules in order, then custom; every returned question has `round` defaulting to 1.

- [ ] **Step 1: Write types**

`src/lib/types.ts`:
```ts
export type QuestionType =
  | "text" | "long" | "select" | "multiselect"
  | "url" | "email" | "number" | "file" | "moscow";

export type ModuleId = "A" | "B";

export type MoscowTag = "Must" | "Should" | "Could" | "Not-yet";

export interface Question {
  id: string;              // stable, e.g. "core.goal", "A.pages"
  module: "core" | ModuleId;
  label: string;
  help?: string;
  type: QuestionType;
  options?: string[];      // select/multiselect options, or moscow candidate features
  required: boolean;
  critical: boolean;       // ⏳ — blocks quoting if unanswered
  round: number;           // 1 = initial; 2+ = follow-up rounds
}

export type AnswerScalar = string | string[] | number | Record<string, MoscowTag> | null;
export interface AnswerValue { value: AnswerScalar; round: number; saved_at: string; }

export type QuestionnaireType = "website" | "tool" | "existing";
export type QuestionnaireStatus =
  | "draft" | "sent" | "in_progress" | "submitted" | "follow_up" | "ready_to_quote";

export interface Questionnaire {
  id: string;
  slug: string;
  client_name: string;
  project_name: string;
  type: QuestionnaireType;
  status: QuestionnaireStatus;
  question_set: Question[];
  answers: Record<string, AnswerValue>;
  created_at: string;
  updated_at: string;
}
```

- [ ] **Step 2: Write the failing test**

`src/lib/questionBank.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { CORE, MODULES, assembleQuestionSet } from "./questionBank";

describe("question bank", () => {
  it("core has the budget band and start-simple critical questions", () => {
    const ids = CORE.map(q => q.id);
    expect(ids).toContain("core.budget");
    expect(ids).toContain("core.posture");
    expect(CORE.find(q => q.id === "core.budget")!.critical).toBe(true);
  });

  it("module A covers site goal; module B covers process + roles", () => {
    expect(MODULES.A.map(q => q.id)).toContain("A.primaryJob");
    expect(MODULES.B.map(q => q.id)).toContain("B.process");
    expect(MODULES.B.map(q => q.id)).toContain("B.roles");
  });

  it("assembleQuestionSet puts core first, then modules, then custom, all round 1", () => {
    const custom = [{ id: "custom.1", module: "A", label: "X", type: "text", required: false, critical: false, round: 1 } as const];
    const set = assembleQuestionSet(["A"], custom);
    expect(set[0].module).toBe("core");
    expect(set.some(q => q.module === "A")).toBe(true);
    expect(set[set.length - 1].id).toBe("custom.1");
    expect(set.every(q => q.round === 1)).toBe(true);
  });

  it("has a moscow question in each module for MoSCoW tagging", () => {
    expect(MODULES.A.some(q => q.type === "moscow")).toBe(true);
    expect(MODULES.B.some(q => q.type === "moscow")).toBe(true);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot import from `./questionBank` (module not found).

- [ ] **Step 4: Write the question bank**

`src/lib/questionBank.ts`:
```ts
import type { Question, ModuleId } from "./types";

const q = (
  id: string, module: Question["module"], label: string, type: Question["type"],
  opts: Partial<Pick<Question, "help" | "options" | "required" | "critical">> = {}
): Question => ({
  id, module, label, type, round: 1,
  help: opts.help, options: opts.options,
  required: opts.required ?? false, critical: opts.critical ?? false,
});

// COMMON CORE — every project (vault reference/client-intake-questions.md)
export const CORE: Question[] = [
  q("core.contact", "core", "Your name, organisation, and role.", "text", { required: true, critical: true }),
  q("core.goal", "core", "In a sentence or two: what should this achieve / what problem does it solve?", "long", { required: true, critical: true }),
  q("core.decision", "core", "Who is the decision-maker who signs off and approves?", "text", { required: true, critical: true }),
  q("core.budget", "core", "What budget range are you working within for the build, and what monthly running cost is comfortable? (ranges are fine — so we recommend something that fits)", "long", { required: true, critical: true }),
  q("core.deadline", "core", "What's your deadline, and is it hard (a date/event) or flexible?", "text", { required: true, critical: true }),
  q("core.posture", "core", "Is this \"start simple this year and grow\", or does everything need to work from day one?", "select", { options: ["Start simple & grow", "Everything from day one"], required: true, critical: true }),
  q("core.tools", "core", "What existing tools/accounts must this keep or work with, and who owns them?", "long"),
  q("core.popia", "core", "Any rules about storing people's personal details (retention / POPIA)?", "long"),
  q("core.examples", "core", "Show us 1–2 sites/systems you like, and what you like about them.", "long", { help: "Paste links if you have them." }),
  q("core.anything", "core", "Anything else we should know?", "long"),
];

const MODULE_A: Question[] = [
  q("A.pages", "A", "What pages/sections do you need? (Home, About, Services, Contact, Gallery, Blog…)", "long"),
  q("A.primaryJob", "A", "What's the site's #1 job — phone calls, enquiry forms, bookings, online sales, or just credibility?", "select", { options: ["Phone calls", "Enquiry forms", "Bookings", "Online sales", "Credibility"], required: true, critical: true }),
  q("A.audience", "A", "Who's the audience, and which areas/towns do you serve? (for local SEO)", "long"),
  q("A.content", "A", "Do you provide the words and photos, or should we write/source them?", "select", { options: ["We provide everything", "You write/source everything", "Mix"], required: true }),
  q("A.branding", "A", "Do you have a logo, colours and fonts, or should we create them?", "select", { options: ["Have all", "Have some", "Create from scratch"] }),
  q("A.domain", "A", "Do you own a domain and hosting already?", "select", { options: ["Yes both", "Domain only", "Neither"] }),
  q("A.enquiries", "A", "Where should enquiries go — email, WhatsApp, a CRM?", "text"),
  q("A.moscow", "A", "Tag each possible feature by how much you need it.", "moscow", {
    help: "Must = launch blocker · Should = important · Could = nice · Not-yet = later.",
    options: ["Online booking", "Payments / shop", "Maps / directions", "Multiple languages", "Blog / news", "Photo gallery"],
  }),
];

const MODULE_B: Question[] = [
  q("B.process", "B", "Walk us through the process this should handle, start to finish.", "long", { required: true, critical: true }),
  q("B.roles", "B", "What are the user roles, and what can each do (view / submit / approve / admin)?", "long", { required: true, critical: true }),
  q("B.data", "B", "What records/data does it track, what reports do you need, and who sees them?", "long"),
  q("B.integrations", "B", "Which systems must it integrate with (e.g. a ticketing / payment / CRM API)?", "long"),
  q("B.outputs", "B", "How do outputs reach people (email, door list, codes, dashboards)?", "text"),
  q("B.scale", "B", "How many people use it, and does it spike around an event/season?", "text"),
  q("B.home", "B", "Where should it live — your existing tool (Airtable etc.) or a branded app?", "select", { options: ["Existing tool", "Branded app", "Not sure"] }),
  q("B.moscow", "B", "Tag each possible capability by how much you need it.", "moscow", {
    help: "Must = launch blocker · Should = important · Could = nice · Not-yet = later.",
    options: ["Requests", "Approvals", "Notifications", "Dashboards", "Integration sync", "Exports"],
  }),
];

export const MODULES: Record<ModuleId, Question[]> = { A: MODULE_A, B: MODULE_B };

export function assembleQuestionSet(modules: ModuleId[], custom: Question[] = []): Question[] {
  const chosen = modules.flatMap(m => MODULES[m]);
  return [...CORE, ...chosen, ...custom].map(q => ({ ...q, round: q.round ?? 1 }));
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**
```bash
git add ember-automations/src/lib/types.ts ember-automations/src/lib/questionBank.ts ember-automations/src/lib/questionBank.test.ts
git commit -m "feat(intake): question bank (core + module A/B) + assembly helper"
```

---

### Task 3: Unguessable slug generator (TDD)

**Files:**
- Create: `src/lib/slug.ts`, `src/lib/slug.test.ts`

**Interfaces:**
- Produces: `makeSlug(projectName: string): string` — kebab base from the name + a random suffix (`crypto.randomBytes`), lowercase, URL-safe, e.g. `maynardville-x7q2k9`.

- [ ] **Step 1: Write the failing test**

`src/lib/slug.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { makeSlug } from "./slug";

describe("makeSlug", () => {
  it("kebab-cases the project name and appends a random suffix", () => {
    const s = makeSlug("Maynardville Festival");
    expect(s).toMatch(/^maynardville-festival-[a-z0-9]{6}$/);
  });
  it("is URL-safe and unique across calls", () => {
    const a = makeSlug("A B!"); const b = makeSlug("A B!");
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[a-z0-9-]+$/);
  });
  it("handles empty/odd names without crashing", () => {
    expect(makeSlug("")).toMatch(/^project-[a-z0-9]{6}$/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `./slug` not found.

- [ ] **Step 3: Implement**

`src/lib/slug.ts`:
```ts
import { randomBytes } from "crypto";

export function makeSlug(projectName: string): string {
  const base = projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "project";
  const suffix = randomBytes(4).toString("hex").slice(0, 6);
  return `${base}-${suffix}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add ember-automations/src/lib/slug.ts ember-automations/src/lib/slug.test.ts
git commit -m "feat(intake): unguessable slug generator"
```

---

### Task 4: Deterministic gap detection (TDD)

**Files:**
- Create: `src/lib/gapDetection.ts`, `src/lib/gapDetection.test.ts`

**Interfaces:**
- Consumes: `Questionnaire`, `Question`, `AnswerValue`, `MoscowTag` from `./types`.
- Produces:
  - `isBlank(v: AnswerValue | undefined): boolean`
  - `moscowSummary(qs: Question[], answers): Record<MoscowTag, string[]>`
  - `detectGaps(qs: Question[], answers): { missingCritical: Question[]; moscow: Record<MoscowTag,string[]>; warnings: string[] }`
  - Warnings seeded with one real rule: "Everything from day one" posture + ≥4 Must features ⇒ over-scope-vs-budget flag.

- [ ] **Step 1: Write the failing test**

`src/lib/gapDetection.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { detectGaps, isBlank } from "./gapDetection";
import type { Question, AnswerValue } from "./types";

const Q = (id: string, extra: Partial<Question> = {}): Question =>
  ({ id, module: "core", label: id, type: "text", required: true, critical: false, round: 1, ...extra });
const A = (value: any): AnswerValue => ({ value, round: 1, saved_at: "" });

describe("gap detection", () => {
  it("treats null/empty string/empty array as blank", () => {
    expect(isBlank(undefined)).toBe(true);
    expect(isBlank(A(""))).toBe(true);
    expect(isBlank(A([]))).toBe(true);
    expect(isBlank(A("hi"))).toBe(false);
  });

  it("flags blank critical questions only", () => {
    const qs = [Q("core.goal", { critical: true }), Q("core.tools", { critical: false })];
    const res = detectGaps(qs, { });
    expect(res.missingCritical.map(q => q.id)).toEqual(["core.goal"]);
  });

  it("summarises MoSCoW tags", () => {
    const qs = [Q("A.moscow", { type: "moscow", options: ["Shop", "Blog", "Maps"] })];
    const answers = { "A.moscow": A({ Shop: "Must", Blog: "Could", Maps: "Must" }) };
    const res = detectGaps(qs, answers);
    expect(res.moscow.Must.sort()).toEqual(["Maps", "Shop"]);
    expect(res.moscow.Could).toEqual(["Blog"]);
  });

  it("warns when 'everything day one' meets 4+ Musts", () => {
    const qs = [
      Q("core.posture", { type: "select", options: ["Start simple & grow", "Everything from day one"] }),
      Q("A.moscow", { type: "moscow", options: ["a", "b", "c", "d"] }),
    ];
    const answers = {
      "core.posture": A("Everything from day one"),
      "A.moscow": A({ a: "Must", b: "Must", c: "Must", d: "Must" }),
    };
    expect(detectGaps(qs, answers).warnings.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `./gapDetection` not found.

- [ ] **Step 3: Implement**

`src/lib/gapDetection.ts`:
```ts
import type { Question, AnswerValue, MoscowTag } from "./types";

const TAGS: MoscowTag[] = ["Must", "Should", "Could", "Not-yet"];
type Answers = Record<string, AnswerValue>;

export function isBlank(v: AnswerValue | undefined): boolean {
  if (!v) return true;
  const x = v.value;
  if (x === null || x === undefined) return true;
  if (typeof x === "string") return x.trim() === "";
  if (Array.isArray(x)) return x.length === 0;
  if (typeof x === "object") return Object.keys(x).length === 0;
  return false;
}

export function moscowSummary(qs: Question[], answers: Answers): Record<MoscowTag, string[]> {
  const out: Record<MoscowTag, string[]> = { Must: [], Should: [], Could: [], "Not-yet": [] };
  for (const q of qs.filter(q => q.type === "moscow")) {
    const val = answers[q.id]?.value;
    if (val && typeof val === "object" && !Array.isArray(val)) {
      for (const [feature, tag] of Object.entries(val as Record<string, MoscowTag>)) {
        if (TAGS.includes(tag)) out[tag].push(feature);
      }
    }
  }
  return out;
}

export function detectGaps(qs: Question[], answers: Answers) {
  const missingCritical = qs.filter(q => q.critical && isBlank(answers[q.id]));
  const moscow = moscowSummary(qs, answers);
  const warnings: string[] = [];
  const posture = answers["core.posture"]?.value;
  if (posture === "Everything from day one" && moscow.Must.length >= 4) {
    warnings.push(`"Everything from day one" with ${moscow.Must.length} Must-have features — likely over-scoped for budget. Consider phasing (see anti-oversell rule).`);
  }
  return { missingCritical, moscow, warnings };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**
```bash
git add ember-automations/src/lib/gapDetection.ts ember-automations/src/lib/gapDetection.test.ts
git commit -m "feat(intake): deterministic gap detection (critical/MoSCoW/warnings)"
```

---

### Task 5: Submission → markdown export for review-intake (TDD)

**Files:**
- Create: `src/lib/exportMarkdown.ts`, `src/lib/exportMarkdown.test.ts`

**Interfaces:**
- Consumes: `Questionnaire` from `./types`; `detectGaps` from `./gapDetection`.
- Produces: `exportSubmissionMarkdown(qn: Questionnaire): string` — a markdown doc (`# <client> — <project>`, meta, every Q with its answer grouped by round, plus a "Deterministic flags" section) that `review-intake` can ingest.

- [ ] **Step 1: Write the failing test**

`src/lib/exportMarkdown.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { exportSubmissionMarkdown } from "./exportMarkdown";
import type { Questionnaire } from "./types";

const qn: Questionnaire = {
  id: "1", slug: "acme-x1", client_name: "Acme", project_name: "Site",
  type: "website", status: "submitted",
  question_set: [
    { id: "core.goal", module: "core", label: "Goal?", type: "long", required: true, critical: true, round: 1 },
    { id: "core.tools", module: "core", label: "Tools?", type: "long", required: false, critical: false, round: 1 },
  ],
  answers: { "core.goal": { value: "Sell online", round: 1, saved_at: "" } },
  created_at: "", updated_at: "",
};

describe("exportSubmissionMarkdown", () => {
  it("includes client/project heading and answered question", () => {
    const md = exportSubmissionMarkdown(qn);
    expect(md).toContain("# Acme — Site");
    expect(md).toContain("Goal?");
    expect(md).toContain("Sell online");
  });
  it("marks unanswered questions and flags missing critical", () => {
    const md = exportSubmissionMarkdown(qn);
    expect(md).toContain("_(no answer)_");
    expect(md).toContain("Missing critical");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `./exportMarkdown` not found.

- [ ] **Step 3: Implement**

`src/lib/exportMarkdown.ts`:
```ts
import type { Questionnaire, AnswerScalar } from "./types";
import { detectGaps } from "./gapDetection";

function renderValue(v: AnswerScalar): string {
  if (v === null || v === undefined || v === "") return "_(no answer)_";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "object") return Object.entries(v).map(([k, t]) => `${k}: **${t}**`).join(" · ");
  return String(v);
}

export function exportSubmissionMarkdown(qn: Questionnaire): string {
  const rounds = [...new Set(qn.question_set.map(q => q.round))].sort();
  const lines: string[] = [
    `# ${qn.client_name} — ${qn.project_name}`,
    ``,
    `- **Type:** ${qn.type}`,
    `- **Status:** ${qn.status}`,
    `- **Slug:** ${qn.slug}`,
    ``,
  ];
  for (const r of rounds) {
    if (rounds.length > 1) lines.push(`## Round ${r}`, ``);
    for (const q of qn.question_set.filter(q => q.round === r)) {
      const a = qn.answers[q.id]?.value ?? null;
      lines.push(`**${q.label}**${q.critical ? " ⏳" : ""}`, renderValue(a), ``);
    }
  }
  const { missingCritical, moscow, warnings } = detectGaps(qn.question_set, qn.answers);
  lines.push(`## Deterministic flags`, ``);
  lines.push(`- **Missing critical:** ${missingCritical.length ? missingCritical.map(q => q.label).join("; ") : "none"}`);
  lines.push(`- **MoSCoW — Must:** ${moscow.Must.join(", ") || "—"}`);
  lines.push(`- **Warnings:** ${warnings.length ? warnings.join(" ") : "none"}`);
  return lines.join("\n");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add ember-automations/src/lib/exportMarkdown.ts ember-automations/src/lib/exportMarkdown.test.ts
git commit -m "feat(intake): submission → review-intake markdown export"
```

---

### Task 6: Supabase schema + client factories

**Files:**
- Create: `supabase/migrations/0001_init.sql`, `src/lib/supabaseServer.ts`, `src/lib/supabaseBrowser.ts`

**Interfaces:**
- Produces:
  - `serviceClient()` — service-role Supabase client (server-only, bypasses RLS) for app reads/writes.
  - `browserClient()` — anon client for the login page.
  - Tables `questionnaires`, `uploads`; Storage bucket `intake-uploads`.

- [ ] **Step 1: Write the migration**

`supabase/migrations/0001_init.sql`:
```sql
create extension if not exists pgcrypto;

create table if not exists questionnaires (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  client_name text not null,
  project_name text not null,
  type text not null check (type in ('website','tool','existing')),
  status text not null default 'draft'
    check (status in ('draft','sent','in_progress','submitted','follow_up','ready_to_quote')),
  question_set jsonb not null default '[]'::jsonb,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists uploads (
  id uuid primary key default gen_random_uuid(),
  questionnaire_id uuid not null references questionnaires(id) on delete cascade,
  question_id text not null,
  storage_path text not null,
  filename text not null,
  content_type text,
  size integer,
  uploaded_at timestamptz not null default now()
);

-- RLS on; the app uses the service-role key (bypasses RLS). No public policies = no public table access.
alter table questionnaires enable row level security;
alter table uploads enable row level security;

insert into storage.buckets (id, name, public)
values ('intake-uploads','intake-uploads', false)
on conflict (id) do nothing;
```

- [ ] **Step 2: Apply the migration**

In the Supabase project SQL editor (or `supabase db push`), run `0001_init.sql`.
Verify: `select * from questionnaires;` returns 0 rows with no error; bucket `intake-uploads` exists under Storage.

- [ ] **Step 3: Client factories**

`src/lib/supabaseServer.ts`:
```ts
import { createClient } from "@supabase/supabase-js";
export function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
```

`src/lib/supabaseBrowser.ts`:
```ts
"use client";
import { createBrowserClient } from "@supabase/ssr";
export function browserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 4: Verify factories compile**

Run: `npm run build` (expect success up to this point; if unrelated pages error, note and continue). Minimum: no TypeScript error in `supabaseServer.ts` / `supabaseBrowser.ts`.

- [ ] **Step 5: Commit**
```bash
git add ember-automations/supabase ember-automations/src/lib/supabaseServer.ts ember-automations/src/lib/supabaseBrowser.ts
git commit -m "feat(intake): supabase schema + client factories"
```

---

### Task 7: Client questionnaire — load, render, save/resume, submit

**Files:**
- Create: `src/app/intake/[slug]/page.tsx`, `src/app/intake/[slug]/QuestionnaireForm.tsx`, `src/app/api/intake/[slug]/route.ts`

**Interfaces:**
- Consumes: `serviceClient()`, `Questionnaire`, `Question`, `assembleQuestionSet` types.
- Produces:
  - `GET /api/intake/:slug` → `{ questionnaire }` (public read of one row by slug).
  - `PATCH /api/intake/:slug` body `{ answers }` → persists answers, sets status `in_progress` (save/resume).
  - `POST /api/intake/:slug` → sets status `submitted`, updates `updated_at`.
  - Rendered form at `/intake/:slug` supporting text/long/select/multiselect/url/email/number/moscow inputs (file handled in Task 8).

- [ ] **Step 1: API route**

`src/app/api/intake/[slug]/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabaseServer";

async function load(slug: string) {
  const db = serviceClient();
  const { data, error } = await db.from("questionnaires").select("*").eq("slug", slug).single();
  if (error || !data) return null;
  return data;
}

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const qn = await load(params.slug);
  if (!qn) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ questionnaire: qn });
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  const { answers } = await req.json();
  const db = serviceClient();
  const { error } = await db.from("questionnaires")
    .update({ answers, status: "in_progress", updated_at: new Date().toISOString() })
    .eq("slug", params.slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const db = serviceClient();
  const { error } = await db.from("questionnaires")
    .update({ status: "submitted", updated_at: new Date().toISOString() })
    .eq("slug", params.slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  // Task 9 adds the Resend notification here.
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Server page loads the questionnaire**

`src/app/intake/[slug]/page.tsx`:
```tsx
import { serviceClient } from "@/lib/supabaseServer";
import { notFound } from "next/navigation";
import QuestionnaireForm from "./QuestionnaireForm";
import type { Questionnaire } from "@/lib/types";

export default async function IntakePage({ params }: { params: { slug: string } }) {
  const db = serviceClient();
  const { data } = await db.from("questionnaires").select("*").eq("slug", params.slug).single();
  if (!data) notFound();
  const qn = data as Questionnaire;
  return (
    <main className="min-h-screen max-w-2xl mx-auto p-6">
      <header className="mb-8">
        <p className="uppercase tracking-widest text-xs text-ember-500 font-semibold">Ember Automations · Discovery</p>
        <h1 className="text-3xl font-extrabold mt-1">{qn.project_name}</h1>
        <p className="text-[#6b6b8a] mt-2">Hi {qn.client_name} — a few questions so we can scope and build the right thing. Your progress saves automatically.</p>
      </header>
      <QuestionnaireForm slug={qn.slug} questionSet={qn.question_set} initialAnswers={qn.answers} status={qn.status} />
    </main>
  );
}
```

- [ ] **Step 3: Client form with save/resume + submit**

`src/app/intake/[slug]/QuestionnaireForm.tsx`:
```tsx
"use client";
import { useState, useCallback, useRef } from "react";
import type { Question, AnswerValue, MoscowTag } from "@/lib/types";

const nowRound = (qs: Question[]) => Math.max(...qs.map(q => q.round));

export default function QuestionnaireForm({ slug, questionSet, initialAnswers, status }:
  { slug: string; questionSet: Question[]; initialAnswers: Record<string, AnswerValue>; status: string }) {
  const [answers, setAnswers] = useState(initialAnswers || {});
  const [submitted, setSubmitted] = useState(status === "submitted" || status === "ready_to_quote");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRound = nowRound(questionSet);

  const persist = useCallback((next: Record<string, AnswerValue>) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      fetch(`/api/intake/${slug}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers: next }) });
    }, 700);
  }, [slug]);

  const set = (id: string, value: AnswerValue["value"]) => {
    const next = { ...answers, [id]: { value, round: activeRound, saved_at: new Date().toISOString() } };
    setAnswers(next); persist(next);
  };

  const submit = async () => {
    await fetch(`/api/intake/${slug}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers }) });
    await fetch(`/api/intake/${slug}`, { method: "POST" });
    setSubmitted(true);
  };

  if (submitted) return <div className="glass p-8 text-center"><h2 className="text-xl font-bold">Thank you!</h2><p className="text-[#6b6b8a] mt-2">We've got your answers and will be in touch. If we need anything more, this same link will show a few extra questions.</p></div>;

  return (
    <form className="space-y-6" onSubmit={e => { e.preventDefault(); submit(); }}>
      {questionSet.filter(q => q.round === activeRound).map(q => (
        <Field key={q.id} q={q} value={answers[q.id]?.value} onChange={(v) => set(q.id, v)} />
      ))}
      <button type="submit" className="bg-ember-500 hover:bg-ember-600 text-[#0a0a0f] font-semibold px-6 py-3 rounded-xl ember-glow transition">Submit answers</button>
    </form>
  );
}

function Field({ q, value, onChange }: { q: Question; value: any; onChange: (v: any) => void }) {
  const label = <label className="block font-semibold mb-1">{q.label}{q.critical && <span className="text-ember-500"> *</span>}</label>;
  const help = q.help && <p className="text-xs text-[#6b6b8a] mb-2">{q.help}</p>;
  const cls = "w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-[#e2e2f0]";
  return (
    <div className="glass p-5">
      {label}{help}
      {q.type === "long" && <textarea className={cls} rows={4} value={value ?? ""} onChange={e => onChange(e.target.value)} />}
      {["text", "url", "email", "number"].includes(q.type) &&
        <input className={cls} type={q.type === "number" ? "number" : q.type === "email" ? "email" : "text"} value={value ?? ""} onChange={e => onChange(e.target.value)} />}
      {q.type === "select" && (
        <select className={cls} value={value ?? ""} onChange={e => onChange(e.target.value)}>
          <option value="">Choose…</option>
          {q.options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )}
      {q.type === "multiselect" && q.options?.map(o => {
        const arr: string[] = Array.isArray(value) ? value : [];
        return <label key={o} className="flex items-center gap-2 py-0.5"><input type="checkbox" checked={arr.includes(o)} onChange={e => onChange(e.target.checked ? [...arr, o] : arr.filter(x => x !== o))} />{o}</label>;
      })}
      {q.type === "moscow" && <Moscow options={q.options ?? []} value={value ?? {}} onChange={onChange} />}
    </div>
  );
}

function Moscow({ options, value, onChange }: { options: string[]; value: Record<string, MoscowTag>; onChange: (v: Record<string, MoscowTag>) => void }) {
  const tags: MoscowTag[] = ["Must", "Should", "Could", "Not-yet"];
  return (
    <div className="space-y-2">
      {options.map(f => (
        <div key={f} className="flex items-center justify-between gap-3">
          <span>{f}</span>
          <div className="flex gap-1">
            {tags.map(t => (
              <button type="button" key={t}
                className={`text-xs px-2 py-1 rounded ${value[f] === t ? "bg-ember-500 text-[#0a0a0f]" : "bg-dark-600 text-[#6b6b8a]"}`}
                onClick={() => onChange({ ...value, [f]: t })}>{t}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Verify the flow (create a test row, drive it)**

In Supabase SQL editor insert a test row:
```sql
insert into questionnaires (slug, client_name, project_name, type, status, question_set)
values ('test-abc123', 'Test Client', 'Test Project', 'website', 'sent',
  '[{"id":"core.goal","module":"core","label":"Goal?","type":"long","required":true,"critical":true,"round":1},
    {"id":"A.primaryJob","module":"A","label":"Site #1 job?","type":"select","options":["Phone calls","Enquiry forms"],"required":true,"critical":true,"round":1}]'::jsonb);
```
Run `npm run dev`, open `/intake/test-abc123`. Verify: fields render, typing an answer then reloading the page shows the answer persisted (save/resume), clicking Submit shows the thank-you screen, and the row's `status` becomes `submitted` in Supabase.

- [ ] **Step 5: Commit**
```bash
git add ember-automations/src/app/intake ember-automations/src/app/api/intake
git commit -m "feat(intake): client questionnaire with save/resume + submit"
```

---

### Task 8: File upload question type

**Files:**
- Create: `src/app/api/uploads/route.ts`
- Modify: `src/app/intake/[slug]/QuestionnaireForm.tsx` (add the `file` branch in `Field`)

**Interfaces:**
- Consumes: `serviceClient()`.
- Produces: `POST /api/uploads` (multipart: `slug`, `questionId`, `file`) → uploads to `intake-uploads` bucket, inserts an `uploads` row, returns `{ path, filename }`. The `file` answer stores `{ value: filename }`.

- [ ] **Step 1: Upload route**

`src/app/api/uploads/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const slug = form.get("slug") as string;
  const questionId = form.get("questionId") as string;
  if (!file || !slug || !questionId) return NextResponse.json({ error: "missing fields" }, { status: 400 });

  const db = serviceClient();
  const { data: qn } = await db.from("questionnaires").select("id").eq("slug", slug).single();
  if (!qn) return NextResponse.json({ error: "not found" }, { status: 404 });

  const path = `${slug}/${questionId}/${Date.now()}-${file.name}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const up = await db.storage.from("intake-uploads").upload(path, buf, { contentType: file.type, upsert: true });
  if (up.error) return NextResponse.json({ error: up.error.message }, { status: 400 });

  await db.from("uploads").insert({ questionnaire_id: qn.id, question_id: questionId, storage_path: path, filename: file.name, content_type: file.type, size: file.size });
  return NextResponse.json({ path, filename: file.name });
}
```

- [ ] **Step 2: Add `file` branch to the Field component**

In `QuestionnaireForm.tsx`, add inside `Field` (after the `moscow` branch), and it needs the slug — pass `slug` down to `Field`:

Change the map in the form to `<Field key={q.id} q={q} slug={slug} value={...} onChange={...} />` and update `Field`'s props to include `slug: string`. Then add:
```tsx
{q.type === "file" && (
  <input type="file" className={cls} onChange={async e => {
    const f = e.target.files?.[0]; if (!f) return;
    const fd = new FormData(); fd.append("file", f); fd.append("slug", slug); fd.append("questionId", q.id);
    const res = await fetch("/api/uploads", { method: "POST", body: fd });
    const j = await res.json(); if (j.filename) onChange(j.filename);
  }} />
)}
{q.type === "file" && value && <p className="text-xs text-[#6b6b8a] mt-1">Uploaded: {value}</p>}
```

- [ ] **Step 3: Verify upload**

Add a `file`-type question to the test row's `question_set` (e.g. `{"id":"A.logo","module":"A","label":"Upload your logo","type":"file","required":false,"critical":false,"round":1}`). Reload `/intake/test-abc123`, choose a small image. Verify: the file appears in the `intake-uploads` bucket, an `uploads` row exists, and "Uploaded: <filename>" shows.

- [ ] **Step 4: Commit**
```bash
git add ember-automations/src/app/api/uploads ember-automations/src/app/intake/[slug]/QuestionnaireForm.tsx
git commit -m "feat(intake): file upload question type"
```

---

### Task 9: Email notification on submit (Resend)

**Files:**
- Create: `src/lib/email.ts`
- Modify: `src/app/api/intake/[slug]/route.ts` (call it in `POST`)

**Interfaces:**
- Produces: `notifySubmission(qn: { client_name: string; project_name: string; slug: string }): Promise<void>` — emails `NOTIFY_EMAIL` that a client submitted, with a link to the admin submission.

- [ ] **Step 1: Email wrapper**

`src/lib/email.ts`:
```ts
import { Resend } from "resend";

export async function notifySubmission(qn: { client_name: string; project_name: string; slug: string; id?: string }) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!key || !to) return; // no-op if unconfigured (e.g. local without keys)
  const resend = new Resend(key);
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/admin/${qn.id ?? ""}`;
  await resend.emails.send({
    from: process.env.RESEND_FROM || "Ember Automations <intake@emb3r.co.za>",
    to,
    subject: `New intake: ${qn.client_name} — ${qn.project_name}`,
    text: `${qn.client_name} submitted the "${qn.project_name}" questionnaire.\n\nReview: ${url}`,
  });
}
```

- [ ] **Step 2: Call it on submit**

In `src/app/api/intake/[slug]/route.ts` `POST`, replace the `// Task 9` comment with:
```ts
const { data: qn } = await db.from("questionnaires").select("id, client_name, project_name, slug").eq("slug", params.slug).single();
if (qn) await notifySubmission(qn);
```
Add the import at the top: `import { notifySubmission } from "@/lib/email";`

- [ ] **Step 3: Verify**

With `RESEND_API_KEY` + `NOTIFY_EMAIL` set in `.env.local` (verified sender domain, or use Resend's onboarding sender), submit the test questionnaire. Verify an email arrives. Without keys set, confirm submit still succeeds (no-op path).

- [ ] **Step 4: Commit**
```bash
git add ember-automations/src/lib/email.ts ember-automations/src/app/api/intake/[slug]/route.ts
git commit -m "feat(intake): Resend notification on submit"
```

---

### Task 10: Admin authentication (Supabase Auth, single email)

**Files:**
- Create: `src/app/login/page.tsx`, `src/middleware.ts`, `src/app/admin/layout.tsx`

**Interfaces:**
- Produces: `/login` (magic-link sign-in); middleware that redirects unauthenticated users away from `/admin/*`; admin layout that additionally enforces `session.user.email === ADMIN_EMAIL`.

- [ ] **Step 1: Login page**

`src/app/login/page.tsx`:
```tsx
"use client";
import { useState } from "react";
import { browserClient } from "@/lib/supabaseBrowser";

export default function Login() {
  const [email, setEmail] = useState(""); const [sent, setSent] = useState(false);
  const signIn = async () => {
    await browserClient().auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/admin` } });
    setSent(true);
  };
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="glass p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4">Admin sign-in</h1>
        {sent ? <p className="text-[#6b6b8a]">Check your email for the sign-in link.</p> : (
          <>
            <input className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 mb-3" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            <button className="bg-ember-500 text-[#0a0a0f] font-semibold px-4 py-2 rounded-lg w-full" onClick={signIn}>Send magic link</button>
          </>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Middleware (session refresh + gate)**

`src/middleware.ts`:
```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (c) => c.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
    } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (req.nextUrl.pathname.startsWith("/admin") && !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return res;
}
export const config = { matcher: ["/admin/:path*"] };
```

- [ ] **Step 3: Admin layout enforces the allowed email**

`src/app/admin/layout.tsx`:
```tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) redirect("/login");
  return (
    <div className="min-h-screen max-w-4xl mx-auto p-6">
      <header className="flex items-center justify-between mb-8">
        <span className="uppercase tracking-widest text-xs text-ember-500 font-semibold">Ember Automations · Admin</span>
        <a href="/admin/new" className="bg-ember-500 text-[#0a0a0f] font-semibold px-4 py-2 rounded-lg text-sm">+ New questionnaire</a>
      </header>
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Verify auth gate**

In Supabase Auth, ensure email sign-in is enabled and add your user. Run `npm run dev`, visit `/admin` → redirected to `/login`. Sign in with `ADMIN_EMAIL` → reach admin. Sign in with a different email → `/admin` redirects back to `/login` (allow-list works).

- [ ] **Step 5: Commit**
```bash
git add ember-automations/src/app/login ember-automations/src/middleware.ts ember-automations/src/app/admin/layout.tsx
git commit -m "feat(intake): admin auth (Supabase magic link + single-email allow-list)"
```

---

### Task 11: Admin — create questionnaire (curate modules → link)

**Files:**
- Create: `src/app/admin/new/page.tsx`, `src/app/api/admin/questionnaires/route.ts`

**Interfaces:**
- Consumes: `assembleQuestionSet`, `makeSlug`, `serviceClient`, `MODULES`.
- Produces: `POST /api/admin/questionnaires` body `{ client_name, project_name, type, modules: ModuleId[], custom: Question[] }` → creates a row (`status:'sent'`, snapshot from `assembleQuestionSet`), returns `{ slug }`. Admin page shows the resulting link.

- [ ] **Step 1: Create route**

`src/app/api/admin/questionnaires/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabaseServer";
import { assembleQuestionSet } from "@/lib/questionBank";
import { makeSlug } from "@/lib/slug";
import type { ModuleId, Question } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { client_name, project_name, type, modules, custom } = await req.json() as
    { client_name: string; project_name: string; type: string; modules: ModuleId[]; custom?: Question[] };
  const question_set = assembleQuestionSet(modules ?? [], custom ?? []);
  const slug = makeSlug(project_name);
  const db = serviceClient();
  const { error } = await db.from("questionnaires")
    .insert({ slug, client_name, project_name, type, status: "sent", question_set });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ slug });
}
```

- [ ] **Step 2: Create-questionnaire page**

`src/app/admin/new/page.tsx`:
```tsx
"use client";
import { useState } from "react";
import { MODULES } from "@/lib/questionBank";
import type { ModuleId } from "@/lib/types";

export default function NewQuestionnaire() {
  const [f, setF] = useState({ client_name: "", project_name: "", type: "website" });
  const [mods, setMods] = useState<ModuleId[]>([]);
  const [link, setLink] = useState<string | null>(null);
  const toggle = (m: ModuleId) => setMods(s => s.includes(m) ? s.filter(x => x !== m) : [...s, m]);

  const create = async () => {
    const res = await fetch("/api/admin/questionnaires", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, modules: mods }) });
    const j = await res.json();
    if (j.slug) setLink(`${location.origin}/intake/${j.slug}`);
  };

  const cls = "w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 mb-3";
  if (link) return <div className="glass p-6"><h2 className="font-bold mb-2">Link ready</h2><a className="text-ember-500 break-all" href={link}>{link}</a><p className="text-[#6b6b8a] text-sm mt-2">Send this to the client.</p></div>;

  return (
    <div className="glass p-6 space-y-2">
      <h1 className="text-xl font-bold mb-4">New questionnaire</h1>
      <input className={cls} placeholder="Client name" onChange={e => setF({ ...f, client_name: e.target.value })} />
      <input className={cls} placeholder="Project name" onChange={e => setF({ ...f, project_name: e.target.value })} />
      <select className={cls} value={f.type} onChange={e => setF({ ...f, type: e.target.value })}>
        <option value="website">New website</option>
        <option value="tool">Web app / internal tool</option>
        <option value="existing">Existing project</option>
      </select>
      <p className="font-semibold mt-2 mb-1">Modules</p>
      {(Object.keys(MODULES) as ModuleId[]).map(m => (
        <label key={m} className="flex items-center gap-2"><input type="checkbox" checked={mods.includes(m)} onChange={() => toggle(m)} />Module {m} — {m === "A" ? "Marketing website" : "Web app / internal tool"}</label>
      ))}
      <button className="bg-ember-500 text-[#0a0a0f] font-semibold px-5 py-2 rounded-lg mt-4" onClick={create}>Generate link</button>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Signed in as admin, go to `/admin/new`, create "Maynardville / Comp Tickets / Web app tool" with Module B. Verify: a link is shown; opening it renders Core + Module B questions.

- [ ] **Step 4: Commit**
```bash
git add ember-automations/src/app/admin/new ember-automations/src/app/api/admin/questionnaires/route.ts
git commit -m "feat(intake): admin create questionnaire (curate modules → link)"
```

---

### Task 12: Admin — submissions list

**Files:**
- Create: `src/app/admin/page.tsx`

**Interfaces:**
- Consumes: `serviceClient`.
- Produces: a table of all questionnaires (client, project, status, created) linking to `/admin/:id`.

- [ ] **Step 1: List page**

`src/app/admin/page.tsx`:
```tsx
import { serviceClient } from "@/lib/supabaseServer";
import type { Questionnaire } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const db = serviceClient();
  const { data } = await db.from("questionnaires").select("*").order("created_at", { ascending: false });
  const rows = (data ?? []) as Questionnaire[];
  return (
    <div className="glass p-6">
      <h1 className="text-xl font-bold mb-4">Submissions</h1>
      <table className="w-full text-sm">
        <thead><tr className="text-left text-[#6b6b8a]"><th className="py-2">Client</th><th>Project</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className="border-t border-[#2a2a3d]">
              <td className="py-2">{r.client_name}</td><td>{r.project_name}</td>
              <td><span className="text-xs uppercase tracking-wide text-ember-500">{r.status}</span></td>
              <td className="text-right"><a className="text-ember-500" href={`/admin/${r.id}`}>Open →</a></td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={4} className="py-4 text-[#6b6b8a]">No questionnaires yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Visit `/admin`. Verify the Maynardville and test rows appear, newest first, each linking to `/admin/:id`.

- [ ] **Step 3: Commit**
```bash
git add ember-automations/src/app/admin/page.tsx
git commit -m "feat(intake): admin submissions list"
```

---

### Task 13: Admin — submission view (answers + flags + export + ready-to-quote)

**Files:**
- Create: `src/app/admin/[id]/page.tsx`, `src/app/admin/[id]/Actions.tsx`, `src/app/api/admin/questionnaires/[id]/route.ts`

**Interfaces:**
- Consumes: `serviceClient`, `detectGaps`, `exportSubmissionMarkdown`.
- Produces:
  - Submission view: every question + answer, a "Deterministic flags" panel (missing critical, MoSCoW Musts, warnings), a copy-to-clipboard export button, and a "Mark ready to quote" button.
  - `PATCH /api/admin/questionnaires/:id` body `{ status }` → updates status.

- [ ] **Step 1: Status route**

`src/app/api/admin/questionnaires/[id]/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabaseServer";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const db = serviceClient();
  const { error } = await db.from("questionnaires").update({ ...body, updated_at: new Date().toISOString() }).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Submission page (server)**

`src/app/admin/[id]/page.tsx`:
```tsx
import { serviceClient } from "@/lib/supabaseServer";
import { notFound } from "next/navigation";
import { detectGaps } from "@/lib/gapDetection";
import { exportSubmissionMarkdown } from "@/lib/exportMarkdown";
import type { Questionnaire } from "@/lib/types";
import Actions from "./Actions";

export const dynamic = "force-dynamic";

export default async function SubmissionView({ params }: { params: { id: string } }) {
  const db = serviceClient();
  const { data } = await db.from("questionnaires").select("*").eq("id", params.id).single();
  if (!data) notFound();
  const qn = data as Questionnaire;
  const { missingCritical, moscow, warnings } = detectGaps(qn.question_set, qn.answers);
  const md = exportSubmissionMarkdown(qn);

  return (
    <div className="space-y-6">
      <div className="glass p-6">
        <h1 className="text-2xl font-bold">{qn.client_name} — {qn.project_name}</h1>
        <p className="text-[#6b6b8a] text-sm mt-1">Status: {qn.status} · /intake/{qn.slug}</p>
      </div>

      <div className="glass p-6">
        <h2 className="font-bold mb-3">Deterministic flags</h2>
        <p><span className="text-[#6b6b8a]">Missing critical:</span> {missingCritical.length ? missingCritical.map(q => q.label).join("; ") : "none"}</p>
        <p><span className="text-[#6b6b8a]">MoSCoW Musts:</span> {moscow.Must.join(", ") || "—"}</p>
        {warnings.map((w, i) => <p key={i} className="text-ember-500 mt-1">⚠ {w}</p>)}
      </div>

      <div className="glass p-6 space-y-4">
        <h2 className="font-bold">Answers</h2>
        {qn.question_set.map(q => (
          <div key={q.id}>
            <p className="font-semibold">{q.label}{q.critical && <span className="text-ember-500"> *</span>}</p>
            <p className="text-[#c9c9de] whitespace-pre-wrap">{fmt(qn.answers[q.id]?.value)}</p>
          </div>
        ))}
      </div>

      <Actions id={qn.id} markdown={md} status={qn.status} />
    </div>
  );
}

function fmt(v: any): string {
  if (v === null || v === undefined || v === "") return "—";
  if (Array.isArray(v)) return v.join(", ");
  if (typeof v === "object") return Object.entries(v).map(([k, t]) => `${k}: ${t}`).join(" · ");
  return String(v);
}
```

- [ ] **Step 3: Client actions (copy export + mark ready)**

`src/app/admin/[id]/Actions.tsx`:
```tsx
"use client";
import { useState } from "react";

export default function Actions({ id, markdown, status }: { id: string; markdown: string; status: string }) {
  const [msg, setMsg] = useState("");
  const copy = async () => { await navigator.clipboard.writeText(markdown); setMsg("Markdown copied — paste into review-intake."); };
  const ready = async () => {
    await fetch(`/api/admin/questionnaires/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "ready_to_quote" }) });
    setMsg("Marked ready to quote."); location.reload();
  };
  return (
    <div className="glass p-6 flex flex-wrap gap-3 items-center">
      <button className="bg-dark-600 px-4 py-2 rounded-lg" onClick={copy}>Copy export for review-intake</button>
      {status !== "ready_to_quote" && <button className="bg-ember-500 text-[#0a0a0f] font-semibold px-4 py-2 rounded-lg" onClick={ready}>Mark ready to quote</button>}
      {msg && <span className="text-[#6b6b8a] text-sm">{msg}</span>}
    </div>
  );
}
```

- [ ] **Step 4: Verify**

Open a submitted questionnaire at `/admin/:id`. Verify: answers render, flags panel shows missing-critical + Musts, "Copy export" puts the markdown on the clipboard, "Mark ready to quote" flips status to `ready_to_quote`.

- [ ] **Step 5: Commit**
```bash
git add ember-automations/src/app/admin/[id] ember-automations/src/app/api/admin/questionnaires/[id]/route.ts
git commit -m "feat(intake): admin submission view + flags + export + ready-to-quote"
```

---

### Task 14: Follow-up rounds (add approved questions to the same link)

**Files:**
- Modify: `src/app/api/admin/questionnaires/[id]/route.ts` (add an "add round" action)
- Modify: `src/app/admin/[id]/Actions.tsx` (form to paste approved follow-up questions)

**Interfaces:**
- Consumes: existing PATCH route + `Question` type.
- Produces: PATCH accepts `{ addFollowUps: string[] }` → appends each as a `long` question at `round = maxRound + 1`, sets status `follow_up`, resets the client link to answer the new round.

- [ ] **Step 1: Extend the PATCH route**

Replace the body of `PATCH` in `src/app/api/admin/questionnaires/[id]/route.ts` with:
```ts
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const db = serviceClient();
  const { data: qn } = await db.from("questionnaires").select("question_set").eq("id", params.id).single();
  if (!qn) return NextResponse.json({ error: "not found" }, { status: 404 });

  let update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (Array.isArray(body.addFollowUps) && body.addFollowUps.length) {
    const qs = qn.question_set as { round: number }[];
    const nextRound = Math.max(...qs.map(q => q.round)) + 1;
    const added = body.addFollowUps.map((label: string, i: number) => ({
      id: `followup.${nextRound}.${i}`, module: "core", label, type: "long",
      required: false, critical: false, round: nextRound,
    }));
    update.question_set = [...(qn.question_set as unknown[]), ...added];
    update.status = "follow_up";
  } else if (body.status) {
    update.status = body.status;
  }
  const { error } = await db.from("questionnaires").update(update).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Add follow-up form to Actions**

Append to `src/app/admin/[id]/Actions.tsx` inside the component (below existing buttons): a textarea (one question per line) + "Send follow-ups" button that PATCHes `{ addFollowUps: lines }` and reloads.
```tsx
// add to state: const [fu, setFu] = useState("");
// add to JSX:
<div className="w-full">
  <textarea className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2" rows={3}
    placeholder="Approved follow-up questions, one per line (from review-intake)" value={fu} onChange={e => setFu(e.target.value)} />
  <button className="bg-ember-500 text-[#0a0a0f] font-semibold px-4 py-2 rounded-lg mt-2" onClick={async () => {
    const lines = fu.split("\n").map(s => s.trim()).filter(Boolean);
    if (!lines.length) return;
    await fetch(`/api/admin/questionnaires/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ addFollowUps: lines }) });
    location.reload();
  }}>Send follow-ups to client</button>
</div>
```

- [ ] **Step 3: Verify the round loop**

On a submitted questionnaire, paste two follow-up lines and send. Verify: status → `follow_up`; opening `/intake/:slug` now shows ONLY the two new questions (the form renders the highest round); answering + submitting saves them and returns status to `submitted`. In `/admin/:id` the export markdown shows "Round 1 / Round 2".

- [ ] **Step 4: Commit**
```bash
git add ember-automations/src/app/api/admin/questionnaires/[id]/route.ts ember-automations/src/app/admin/[id]/Actions.tsx
git commit -m "feat(intake): follow-up rounds on the same client link"
```

---

### Task 15: Patch the `review-intake` skill to recognise an admin export

**Files:**
- Modify: `C:/Users/info/.claude/skills/review-intake/SKILL.md` (Inputs section)

**Interfaces:** none (documentation/harness change per the System Evolution habit).

- [ ] **Step 1: Update the Inputs bullet**

In the `## Inputs` section, change the "The answers" bullet to also list the Ember admin export:
```markdown
- **The answers** — paste the Tally notification email, a CSV/JSON export, an Airtable record, a file
  path, **or the markdown from the Ember intake admin's "Copy export for review-intake" button**
  (it already includes a Deterministic-flags section — trust those counts, don't recompute them).
```

- [ ] **Step 2: Verify**

Re-read the skill file; confirm the Inputs section now names the admin export and instructs reusing its deterministic flags. No code test — this is a doc change.

- [ ] **Step 3: Commit**

(The skill lives outside the repo; commit only if that directory is under version control. Otherwise note the change is saved.)

---

### Task 16: Deploy to Vercel + end-to-end verification against success criteria

**Files:** none (configuration + verification).

**Interfaces:** none.

- [ ] **Step 1: Confirm `.env.local` and Vercel env**

Ensure `.env.local` (hand-created) has all keys from `.env.example` filled. In Vercel project settings, add the same env vars. Set `NEXT_PUBLIC_SITE_URL` to the production URL.

- [ ] **Step 2: Deploy**

Run: `npx vercel --prod` (or connect the repo). Set the project Root Directory to `ember-automations`. Verify the build succeeds.

- [ ] **Step 3: End-to-end verification (spec §9)**

Drive the whole flow on the deployed URL:
1. Admin → New questionnaire "Maynardville" (Module B) → get link → email/send it.
2. Open the link as a client → answer, upload a file, reload mid-way (progress persists), submit → answer lands in `/admin/:id` and a Resend email arrives.
3. `/admin/:id` shows correct deterministic flags (leave a critical question blank → it's flagged).
4. "Copy export" → paste into `review-intake` in Claude Code → it drafts ≤5 no-jargon follow-ups → paste approved lines into the follow-up box → client link shows the new round → answer it.
5. "Mark ready to quote" → export feeds `grill-me` / `to-spec` in Claude Code.

Confirm each numbered criterion passes. Record any failures and fix before calling done.

- [ ] **Step 4: Final commit / tag**
```bash
git add -A ember-automations
git commit -m "chore(intake): production env + deploy config"
```

---

## Self-Review

**Spec coverage:**
- §1 purpose / Track-A vessel → Tasks 7–14. ✅
- §3 stack (Next/Supabase/Resend/Vercel/tokens) → Tasks 1, 6, 9, 16. ✅
- §4 question bank (Core + A + B, MoSCoW) → Task 2. ✅
- §5 client experience (no login, save/resume, uploads, rounds) → Tasks 7, 8, 14. ✅
- §6 admin (create, list, submission view, deterministic flags, export, ready-to-quote) → Tasks 11–13. AI-suggest deliberately deferred (documented). ✅
- §7 data model (2 tables, JSONB answers, follow-ups as rounds) → Tasks 6, 14. ✅
- §8 two-track connection + review-intake harness patch → Tasks 13, 15. ✅
- §9 success criteria → Task 16. ✅
- §10 repo shape (no clobber), admin auth, domain → Tasks 1, 10, 16. ✅

**Placeholder scan:** No TBD/TODO; every code step shows real code; verification steps give concrete commands + expected results.

**Type consistency:** `Question`/`AnswerValue`/`Questionnaire` defined in Task 2 and used unchanged in Tasks 4, 5, 7, 11, 13, 14. `assembleQuestionSet`, `makeSlug`, `detectGaps`, `exportSubmissionMarkdown`, `serviceClient`, `notifySubmission` all defined before first use. `answers` shape `{ value, round, saved_at }` consistent across form, gap detection, export.

**Note:** Tasks 1 and 6's `npm run build` checks may surface unrelated route errors until later tasks land — the plan calls out to verify the specific new files compile, not the whole app, at those early stages.
