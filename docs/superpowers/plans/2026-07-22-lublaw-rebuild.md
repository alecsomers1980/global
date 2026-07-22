# Lublaw Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild https://lublaw.co.za/ (B Lubbe & Associates Attorneys) as a Next.js site at `lublaw/` in this monorepo, preserving its gold/maroon look while modernizing execution, and add a Supabase-backed admin blog with full historical migration.

**Architecture:** Next.js App Router + TypeScript, Tailwind CSS v4 (CSS-token theme, no JS config file), Supabase (Postgres + Auth + Storage), Resend for the contact form. Practice-area pages are static TS data rendered through one shared template; the blog is fully database-driven with a single-admin CMS. Deployed to Vercel via git-push auto-deploy (not executed in this plan — see Task 14).

**Tech Stack:** `next` (latest via create-next-app), `react`/`react-dom` (latest), `@supabase/ssr`, `@supabase/supabase-js`, `resend`, `tailwindcss@4` + `@tailwindcss/postcss`, `react-markdown` (blog post rendering), TypeScript, ESLint.

**Reference implementation:** `dianas-bulbinella/` in this monorepo uses the same stack and patterns (Supabase clients, PasswordInput, forgot/reset-password flow, migrations folder, dry-run/`--apply` import scripts). Tasks below adapt its code directly — file contents shown are Lublaw-specific adaptations, not the originals.

## Global Constraints

- Full design spec: `docs/superpowers/specs/2026-07-22-lublaw-rebuild-design.md` — every task below implements a section of it.
- Project root: `lublaw/` (new sibling folder to `dianas-bulbinella/`, `nyoni-education-hub/`, etc. at the monorepo root).
- Dev server port: `3012` (avoids collision with `dianas-bulbinella`'s `3005`).
- No unit test framework in this monorepo's Next.js projects (confirmed: `dianas-bulbinella` has none). Verification per task = `npm run build` (type-check), `npm run lint`, and a manual check via `npm run dev` — not `pytest`/`jest`-style tests. This matches CLAUDE.md's "match existing style" and "no speculative infra."
- Brand colors (from source site, exact values): primary/accent `#B0A46E` (gold), secondary `#8D2B2E` (maroon), background `#FFFFFF`, body text `#666666`.
- Single Supabase Auth admin account — no roles table, no `is_staff()` helper. RLS policies use `auth.role() = 'authenticated'` directly (simpler than dianas's multi-role setup, because there is only ever one authenticated user). This is a deliberate simplification per the spec ("no multi-user roles needed").
- Every login surface ships forgot-password, show/hide password, and keep-me-signed-in from the first pass (standing project rule) — Task 4 covers this.
- Every code step below already contains the complete, exact implementation (required by this skill's "no placeholders" rule) — an executor should write these files as shown rather than re-deriving them, since re-deriving already-specified code through DeepSeek wastes a round-trip without saving anything. Route DeepSeek (`node opencode-glm-extension/ds-agent.js "<prompt>"`, monorepo root) at the *mechanical, high-volume* sub-steps instead: Task 6 Step 2's transformation of ~25 crawled pages into `PRACTICE_AREAS` entries, and Task 12 Step 3's transformation of ~150+ scraped posts into the intake JSON array — both are "reshape this text into this fixed schema, repeated many times" work with no design judgment, exactly what DeepSeek is for. Tasks 6, 7, and 12 still require Claude/the executing subagent to drive the Firecrawl scrape calls directly first (DeepSeek has no tool access) — only the reshaping-into-schema step delegates.
- Practice-area and legal-page copy is crawled from the live site verbatim (not rewritten) — see Task 6/7 for the exact URLs.
- Do not run `vercel` CLI or push to a shared remote as part of this plan — Task 14 prepares deploy readiness only; actual deploy/push needs explicit user go-ahead per session rules.

---

### Task 1: Scaffold the Next.js app + brand theme

**Files:**
- Create: `lublaw/` (via `create-next-app`)
- Modify: `lublaw/src/app/globals.css`
- Modify: `lublaw/src/app/layout.tsx`
- Modify: `lublaw/package.json` (dev script port)

**Interfaces:**
- Produces: CSS custom properties consumed by every later component — `--color-gold`, `--color-maroon`, `--color-ink`, `--color-muted`, `--color-paper`, `--color-surface`, `--color-line`; Tailwind utility classes `bg-gold`, `text-maroon`, etc. via `@theme inline`. Font vars `--font-heading`, `--font-body`.

- [ ] **Step 1: Scaffold with create-next-app**

Run from the monorepo root (`c:/Users/info/OneDrive/Documents/Antigravity`):

```bash
npx create-next-app@latest lublaw --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

When prompted, accept defaults. This installs the latest `next`, `react`, `tailwindcss@4`.

- [ ] **Step 2: Set the dev port to 3012**

In `lublaw/package.json`, change:
```json
"dev": "next dev -p 3012",
```

- [ ] **Step 3: Replace `lublaw/src/app/globals.css` with brand tokens**

```css
@import "tailwindcss";

:root {
  --gold: #B0A46E;
  --gold-deep: #8D8358;
  --maroon: #8D2B2E;
  --paper: #FFFFFF;
  --surface: #FAF9F6;
  --ink: #2A2A2A;
  --muted: #666666;
  --line: #E3E3E3;
}

@theme inline {
  --color-gold: var(--gold);
  --color-gold-deep: var(--gold-deep);
  --color-maroon: var(--maroon);
  --color-paper: var(--paper);
  --color-surface: var(--surface);
  --color-ink: var(--ink);
  --color-muted: var(--muted);
  --color-line: var(--line);
  --font-heading: var(--font-heading-family);
  --font-body: var(--font-body-family);
}

body {
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-body-family), system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4 {
  font-family: var(--font-heading-family), Georgia, serif;
  text-wrap: balance;
}

::selection {
  background: var(--gold);
  color: var(--paper);
}
```

- [ ] **Step 4: Wire fonts and metadata in `lublaw/src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const heading = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading-family",
});
const body = Inter({
  subsets: ["latin"],
  variable: "--font-body-family",
});

export const metadata: Metadata = {
  title: "B Lubbe & Associates Attorneys | Table View, Cape Town",
  description:
    "B Lubbe & Associates Attorneys, Conveyancers, Notaries and Administrators of Deceased Estates. Based in Table View, Milnerton, Melkbosstrand, Cape Town.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-ZA">
      <body className={`${heading.variable} ${body.variable} antialiased`}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

(`Header`/`Footer` are created in Task 5 — this file will fail to build until then, which is expected; Step 5 below only checks the scaffold, not full layout.)

- [ ] **Step 5: Verify the scaffold builds before Header/Footer exist**

Temporarily comment out the `Header`/`Footer` import and JSX in `layout.tsx`, run:

```bash
cd lublaw && npm run dev
```

Expected: dev server starts on `http://localhost:3012` with no errors, default styling shows the brand background color. Stop the server, restore the Header/Footer lines (they'll be created in Task 5 — leave the imports in place; Task 5 makes the build succeed again).

- [ ] **Step 6: Commit**

```bash
cd lublaw && git add -A
git commit -m "feat(lublaw): scaffold Next.js app with brand theme tokens"
```

---

### Task 2: Supabase clients + env template + dependencies

**Files:**
- Create: `lublaw/src/lib/supabase/client.ts`
- Create: `lublaw/src/lib/supabase/server.ts`
- Create: `lublaw/src/lib/supabase/admin.ts`
- Create: `lublaw/.env.local.example`
- Modify: `lublaw/package.json`
- Modify: `lublaw/.gitignore` (confirm `.env.local` is ignored — `create-next-app` includes this by default)

**Interfaces:**
- Produces: `createClient(persist?: boolean)` (browser, `@/lib/supabase/client`), `createClient()` async (server, `@/lib/supabase/server`), `createAdminClient()` (service-role, `@/lib/supabase/admin`) — used by every Supabase-touching task from here on.

- [ ] **Step 1: Install dependencies**

```bash
cd lublaw && npm install @supabase/ssr @supabase/supabase-js resend react-markdown
```

- [ ] **Step 2: Create `lublaw/src/lib/supabase/client.ts`**

```ts
import { createBrowserClient } from "@supabase/ssr";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

/**
 * Browser Supabase client (anon key, RLS-enforced).
 * `persist` drives "keep me signed in": true = 30-day cookie, false = session
 * cookie, undefined = leave the existing cookie lifetime alone.
 */
export function createClient(persist?: boolean) {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    persist === undefined
      ? undefined
      : { cookieOptions: { maxAge: persist ? THIRTY_DAYS : undefined } }
  );
}
```

- [ ] **Step 3: Create `lublaw/src/lib/supabase/server.ts`**

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Server-side Supabase client (RLS-enforced, uses the anon key + session cookies). */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // called from a Server Component — safe to ignore; proxy.ts refreshes.
          }
        },
      },
    }
  );
}
```

- [ ] **Step 4: Create `lublaw/src/lib/supabase/admin.ts`**

```ts
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/** Service-role client — bypasses RLS. Server-only (migration/import scripts,
 *  admin image-upload route). Never import this into client components. */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
```

- [ ] **Step 5: Create `lublaw/.env.local.example`**

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
CONTACT_TO_EMAIL=info@lublaw.co.za
```

- [ ] **Step 6: Verify build**

```bash
cd lublaw && npm run build
```

Expected: build fails at this point only because `.env.local` doesn't exist yet and Header/Footer aren't built — confirm the failure is about missing components/env, not a syntax error in the three new files (`npx tsc --noEmit` on the three files individually if in doubt).

- [ ] **Step 7: Commit**

```bash
cd lublaw && git add -A
git commit -m "feat(lublaw): add Supabase client helpers and env template"
```

---

### Task 3: Database schema — `posts` table + storage bucket

**Files:**
- Create: `lublaw/supabase/migrations/0001_blog.sql`
- Create: `lublaw/supabase/README.md`

**Interfaces:**
- Produces: `public.posts` table with columns `id, title, slug, excerpt, content, featured_image, status, published_at, created_at, updated_at` — consumed by admin CRUD (Task 10), public blog pages (Task 11), and the migration script (Task 13).

- [ ] **Step 1: Write the migration**

```sql
-- Lublaw blog: single-admin CMS, no roles table.
-- RLS: public reads published posts; any authenticated session (the one
-- admin account) can read/write everything. Run via `supabase db push` or
-- paste into the Supabase SQL editor.

create extension if not exists "pgcrypto";

create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.posts (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  slug           text not null unique,
  excerpt        text not null default '',
  content        text not null,               -- markdown
  featured_image text not null default '',     -- Supabase Storage public URL
  status         text not null default 'draft' check (status in ('draft', 'published')),
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists posts_status_idx        on public.posts (status);
create index if not exists posts_published_at_idx   on public.posts (published_at desc);

drop trigger if exists posts_touch on public.posts;
create trigger posts_touch before update on public.posts
  for each row execute function public.touch_updated_at();

alter table public.posts enable row level security;

drop policy if exists "public reads published posts" on public.posts;
create policy "public reads published posts" on public.posts
  for select using (status = 'published' or auth.role() = 'authenticated');

drop policy if exists "authenticated writes posts" on public.posts;
create policy "authenticated writes posts" on public.posts
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
```

- [ ] **Step 2: Document manual setup steps in `lublaw/supabase/README.md`**

```markdown
# Lublaw Supabase setup

1. Create a Supabase project. Copy its URL + anon key + service-role key into `.env.local` (see `.env.local.example`).
2. Run `supabase/migrations/0001_blog.sql` in the SQL editor (or `supabase db push` if the CLI is linked).
3. Create a **public** Storage bucket named `blog-images`.
   - Storage > New bucket > name `blog-images` > Public bucket: ON.
4. Create the single admin user: Authentication > Users > Add user (email + password). No sign-up flow exists in the app — this is the only account.
```

- [ ] **Step 3: No automated verification possible without a live Supabase project** — this task has no build/lint check (it's SQL + docs, not app code). Mark it reviewed once the SQL parses cleanly (paste into `https://supabase.com/dashboard` SQL editor locally when the project exists, or `npx supabase db lint` if the Supabase CLI is installed).

- [ ] **Step 4: Commit**

```bash
cd lublaw && git add -A
git commit -m "feat(lublaw): add posts table migration and Supabase setup docs"
```

---

### Task 4: Admin auth — login, forgot-password, reset-password, route protection

**Files:**
- Create: `lublaw/src/components/PasswordInput.tsx`
- Create: `lublaw/src/app/admin/login/page.tsx`
- Create: `lublaw/src/app/forgot-password/page.tsx`
- Create: `lublaw/src/app/reset-password/page.tsx`
- Create: `lublaw/src/proxy.ts`

**Interfaces:**
- Consumes: `createClient` from `@/lib/supabase/client` (Task 2), `createClient` from `@/lib/supabase/server` is NOT used here (proxy uses its own inline client, matching the dianas pattern, because `next/headers` cookies() isn't available in middleware).
- Produces: `/admin` is gated — unauthenticated visits redirect to `/admin/login?next=<path>`. Used by Task 10 (admin layout assumes the user is already authenticated by the time it renders).

- [ ] **Step 1: Create `lublaw/src/components/PasswordInput.tsx`**

```tsx
"use client";
import { useState } from "react";

/** Password field with a reveal toggle. Standing rule for every login in
 *  this codebase: forgot-password + show-password + keep-signed-in. */
export default function PasswordInput({
  value,
  onChange,
  placeholder = "Password",
  autoComplete = "current-password",
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  id?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        className="rounded-lg border border-line bg-white px-4 py-2.5 pr-16 text-sm w-full outline-none focus:border-maroon"
        type={show ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-maroon px-2 py-1"
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Create `lublaw/src/app/admin/login/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/PasswordInput";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient(keepSignedIn);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    router.push(searchParams.get("next") ?? "/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="bg-paper border border-line rounded-2xl p-8 w-full max-w-sm shadow-sm">
        <h1 className="text-xl font-heading text-ink text-center">B Lubbe & Associates</h1>
        <p className="text-sm text-muted text-center mt-1">Admin sign-in</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-ink mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-maroon"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-ink mb-1" htmlFor="password">Password</label>
            <PasswordInput id="password" value={password} onChange={setPassword} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted cursor-pointer">
              <input
                type="checkbox"
                className="accent-maroon"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
              />
              Keep me signed in
            </label>
            <Link href="/forgot-password" className="text-maroon hover:underline">
              Forgot password?
            </Link>
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-maroon text-white px-5 py-2.5 text-sm font-semibold hover:bg-maroon/90 transition-colors w-full disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `lublaw/src/app/forgot-password/page.tsx`**

```tsx
"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (resetError) setError(resetError.message);
    else setSent(true);
  };

  if (sent) {
    return (
      <div className="max-w-md mx-auto px-6 py-16">
        <div className="bg-paper border border-line rounded-2xl p-8 shadow-sm text-center">
          <h1 className="text-2xl font-heading text-ink mb-4">Reset your password</h1>
          <p className="text-muted mb-6">If that email exists, we&apos;ve sent a reset link.</p>
          <Link href="/admin/login" className="text-maroon hover:underline text-sm font-medium">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="bg-paper border border-line rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-heading text-ink mb-6">Reset your password</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm text-ink mb-1">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-maroon"
              required
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-maroon text-white px-5 py-2.5 text-sm font-semibold hover:bg-maroon/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Sending link..." : "Send reset link"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `lublaw/src/app/reset-password/page.tsx`**

```tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/PasswordInput";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => authListener?.subscription.unsubscribe();
  }, [supabase]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) setError(updateError.message);
    else setSuccess(true);
  };

  if (!ready) {
    return (
      <div className="max-w-md mx-auto px-6 py-16">
        <div className="bg-paper border border-line rounded-2xl p-8 shadow-sm text-center">
          <h1 className="text-2xl font-heading text-ink mb-4">Choose a new password</h1>
          <p className="text-muted">Open the reset link from your email to continue.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-6 py-16">
        <div className="bg-paper border border-line rounded-2xl p-8 shadow-sm text-center">
          <h1 className="text-2xl font-heading text-ink mb-4">Password updated</h1>
          <button
            onClick={() => {
              router.push("/admin");
              router.refresh();
            }}
            className="rounded-full bg-maroon text-white px-5 py-2.5 text-sm font-semibold hover:bg-maroon/90 transition-colors"
          >
            Go to admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="bg-paper border border-line rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-heading text-ink mb-6">Choose a new password</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="new-password" className="block text-sm text-ink mb-1">New password</label>
            <PasswordInput id="new-password" value={password} onChange={setPassword} autoComplete="new-password" />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm text-ink mb-1">Confirm password</label>
            <PasswordInput id="confirm-password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-maroon text-white px-5 py-2.5 text-sm font-semibold hover:bg-maroon/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create `lublaw/src/proxy.ts`**

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Refreshes the Supabase auth session on every matched request and gates
 *  the /admin area (single account — no roles, just "signed in or not"). */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdmin = path.startsWith("/admin");
  const isAdminLogin = path === "/admin/login";

  if (isAdmin && !isAdminLogin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (isAdminLogin && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

Note: if the installed `next` version in `lublaw/` does not recognize `proxy.ts` as the middleware entrypoint (check `node_modules/next/dist/docs/` or the Next.js release notes for the installed version — `dianas-bulbinella`'s `AGENTS.md` warns this monorepo's Next.js may differ from training-data conventions), fall back to `lublaw/src/middleware.ts` with identical content exported as `middleware` instead of `proxy`.

- [ ] **Step 6: Verify**

```bash
cd lublaw && npm run build && npm run lint
```

Expected: no type errors in the five new files (build will still fail overall until Header/Footer exist — confirm the failure is unrelated to these files).

- [ ] **Step 7: Commit**

```bash
cd lublaw && git add -A
git commit -m "feat(lublaw): add admin auth (login, forgot/reset password, route gate)"
```

---

### Task 5: Header (mega-menu nav) + Footer

**Files:**
- Create: `lublaw/src/components/layout/Header.tsx`
- Create: `lublaw/src/components/layout/Footer.tsx`
- Create: `lublaw/src/lib/nav.ts`

**Interfaces:**
- Produces: `NAV_GROUPS` array (`@/lib/nav`) — `{ label: string; href: string; children?: { label: string; href: string }[] }[]` — consumed by Header and, in Task 6, cross-checked against the practice-area page slugs so every nav link resolves.

- [ ] **Step 1: Create `lublaw/src/lib/nav.ts`**

```ts
export type NavLink = { label: string; href: string };
export type NavGroup = NavLink & { children?: NavLink[] };

export const NAV_GROUPS: NavGroup[] = [
  { label: "Home", href: "/" },
  {
    label: "Wills & Estates",
    href: "/wills-estates/administration-of-deceased-estates",
    children: [
      { label: "Administration of Deceased Estates", href: "/wills-estates/administration-of-deceased-estates" },
      { label: "Drafting of Wills", href: "/wills-estates/drafting-of-wills" },
      { label: "Setting up Trusts / Appointment of Trustees", href: "/wills-estates/setting-up-trusts-appointment-of-trustees" },
      { label: "Estate Planning", href: "/wills-estates/estate-planning" },
      { label: "Contingency Plans for SME's", href: "/wills-estates/contingency-plans-for-smes" },
      { label: "Estate & Wills Related Litigation", href: "/wills-estates/estate-wills-related-litigation" },
    ],
  },
  {
    label: "Property Law",
    href: "/property-law/conveyancing",
    children: [
      { label: "Conveyancing", href: "/property-law/conveyancing" },
      { label: "Property Transfer Cost Calculator", href: "/property-law/property-transfer-cost-calculator" },
      { label: "Contracts", href: "/property-law/contracts" },
      { label: "Lease Agreements", href: "/property-law/lease-agreements" },
      { label: "Sureties", href: "/property-law/sureties" },
      { label: "Power of Attorney", href: "/property-law/power-of-attorney" },
      { label: "Property Dispute Litigation", href: "/property-law/property-dispute-litigation" },
    ],
  },
  {
    label: "Litigation",
    href: "/litigation/divorces",
    children: [
      { label: "Divorces", href: "/litigation/divorces" },
      { label: "Property Disputes", href: "/litigation/property-disputes" },
      { label: "Evictions", href: "/litigation/evictions" },
      { label: "Debt Collection", href: "/litigation/debt-collection" },
      { label: "Consumer Protection Act", href: "/litigation/consumer-protection-act" },
      { label: "Personal Injuries", href: "/litigation/personal-injuries" },
      { label: "High Court Applications", href: "/litigation/high-court-applications" },
    ],
  },
  {
    label: "Law of Contract",
    href: "/law-of-contract/antenuptial-contracts",
    children: [
      { label: "Antenuptial (PreNup) Contracts", href: "/law-of-contract/antenuptial-contracts" },
      { label: "Service Level Agreements", href: "/law-of-contract/service-level-agreements" },
      { label: "Cohabitation Agreements", href: "/law-of-contract/cohabitation-agreements" },
      { label: "Partnership Agreements", href: "/law-of-contract/partnership-agreements" },
    ],
  },
  { label: "Notary", href: "/notary" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
];
```

- [ ] **Step 2: Create `lublaw/src/components/layout/Header.tsx`**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { NAV_GROUPS } from "@/lib/nav";

export default function Header() {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b border-line bg-paper sticky top-0 z-50">
      <div className="bg-ink text-white text-xs px-4 py-1.5 flex justify-end gap-4">
        <span>Tel: 021 554 4882</span>
        <a href="mailto:info@lublaw.co.za" className="hover:text-gold">info@lublaw.co.za</a>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-heading text-xl text-maroon font-bold">
          B Lubbe &amp; Associates
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {NAV_GROUPS.map((group) => (
            <div
              key={group.label}
              className="relative"
              onMouseEnter={() => setOpenGroup(group.label)}
              onMouseLeave={() => setOpenGroup(null)}
            >
              <Link href={group.href} className="text-sm text-ink hover:text-maroon font-medium py-2 inline-block">
                {group.label}{group.children ? " »" : ""}
              </Link>
              {group.children && openGroup === group.label && (
                <div className="absolute top-full left-0 bg-paper border border-line rounded-lg shadow-lg py-2 min-w-[280px]">
                  {group.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block px-4 py-2 text-sm text-ink hover:bg-surface hover:text-maroon"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <button
          className="lg:hidden text-ink"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {mobileOpen && (
        <nav className="lg:hidden border-t border-line px-4 py-4 space-y-1">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <Link
                href={group.href}
                className="block py-2 text-sm font-medium text-ink"
                onClick={() => setMobileOpen(false)}
              >
                {group.label}
              </Link>
              {group.children && (
                <div className="pl-4 space-y-1">
                  {group.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block py-1.5 text-sm text-muted"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      )}
    </header>
  );
}
```

- [ ] **Step 3: Create `lublaw/src/components/layout/Footer.tsx`**

```tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-ink text-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-8 sm:grid-cols-3">
        <div>
          <h3 className="font-heading text-lg mb-3">Contact Us</h3>
          <p className="text-sm text-white/70">T. 021 554 4882</p>
          <p className="text-sm text-white/70">F. 021 554 0991</p>
          <a href="mailto:info@lublaw.co.za" className="text-sm text-gold hover:underline">
            info@lublaw.co.za
          </a>
        </div>
        <div>
          <h3 className="font-heading text-lg mb-3">Address</h3>
          <p className="text-sm text-white/70">9E Sandown Road, Bloubergsands, 7441</p>
          <p className="text-sm text-white/70">P.O. Box 11476, Bloubergrant, 7443, Docex 3, Blouberg</p>
        </div>
        <div>
          <h3 className="font-heading text-lg mb-3">POPIA</h3>
          <Link href="/cookies-disclaimer" className="block text-sm text-white/70 hover:text-gold">
            Cookies Disclaimer
          </Link>
          <Link href="/popia-privacy-notice" className="block text-sm text-white/70 hover:text-gold">
            POPIA Privacy Notice
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 text-center text-xs text-white/50 py-4">
        © {new Date().getFullYear()} B Lubbe & Associates. All Rights Reserved.
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Verify**

```bash
cd lublaw && npm run build && npm run dev
```

Expected: build succeeds (Header/Footer imports in `layout.tsx` now resolve). Open `http://localhost:3012` — nav renders with working dropdowns, footer renders with correct contact/address info. Practice-area links 404 until Task 6 — expected at this point.

- [ ] **Step 5: Commit**

```bash
cd lublaw && git add -A
git commit -m "feat(lublaw): add header mega-menu nav and footer"
```

---

### Task 6: Practice-area content data + template + all pages

**Not delegated to DeepSeek** — requires live crawling of the source site via Firecrawl tools (`firecrawl_scrape`), which DeepSeek cannot call. Execute this task directly.

**Files:**
- Create: `lublaw/src/lib/practice-areas.ts`
- Create: `lublaw/src/components/PracticeAreaTemplate.tsx`
- Create: `lublaw/src/app/wills-estates/[slug]/page.tsx`
- Create: `lublaw/src/app/property-law/[slug]/page.tsx`
- Create: `lublaw/src/app/litigation/[slug]/page.tsx`
- Create: `lublaw/src/app/law-of-contract/[slug]/page.tsx`
- Create: `lublaw/src/app/notary/page.tsx`
- Create: `lublaw/src/app/intellectual-property/page.tsx`

**Interfaces:**
- Produces: `PracticeArea` type and `PRACTICE_AREAS: Record<string, PracticeArea>` (`@/lib/practice-areas`) — keyed by full path matching `NAV_GROUPS` hrefs from Task 5. `PracticeAreaTemplate` component takes `{ area: PracticeArea }`.

- [ ] **Step 1: Crawl each source page's real content**

For each of the 24 grouped pages listed in `NAV_GROUPS` (Task 5) plus Notary, use `firecrawl_scrape` on the matching `https://lublaw.co.za/<original-slug>/` URL (original slugs are in the design spec's Content Inventory and in the links list already captured during brainstorming — e.g. `https://lublaw.co.za/administration-of-deceased-estates/`) with `formats: ["markdown"]`, `onlyMainContent: true`. Extract the page's heading and body paragraphs (ignore the repeated nav/footer boilerplate present in every scrape).

- [ ] **Step 2: Write `lublaw/src/lib/practice-areas.ts`**

```ts
export type PracticeArea = {
  slug: string;         // matches the [slug] segment, e.g. "conveyancing"
  group: "wills-estates" | "property-law" | "litigation" | "law-of-contract" | "notary";
  title: string;
  intro: string;         // first paragraph, shown under the H1
  sections: { heading?: string; body: string }[]; // remaining content, in order
};

export const PRACTICE_AREAS: PracticeArea[] = [
  {
    slug: "administration-of-deceased-estates",
    group: "wills-estates",
    title: "Administration of Deceased Estates",
    intro: "REPLACE WITH CRAWLED FIRST PARAGRAPH",
    sections: [{ body: "REPLACE WITH CRAWLED BODY CONTENT" }],
  },
  // ... one entry per page crawled in Step 1, 25 entries total (24 grouped + Notary).
  // Every `slug` here must match a `href`'s final segment in NAV_GROUPS (lublaw/src/lib/nav.ts).
];

export function getPracticeArea(group: PracticeArea["group"], slug: string) {
  return PRACTICE_AREAS.find((p) => p.group === group && p.slug === slug);
}
```

Replace every placeholder value with the real crawled text from Step 1 — this is a data-population step, not a design decision; the schema and page wiring below are fixed, only the array contents come from the crawl.

- [ ] **Step 3: Create `lublaw/src/components/PracticeAreaTemplate.tsx`**

```tsx
import type { PracticeArea } from "@/lib/practice-areas";

export default function PracticeAreaTemplate({ area }: { area: PracticeArea }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-heading text-3xl text-maroon mb-6">{area.title}</h1>
      <p className="text-lg text-ink mb-8">{area.intro}</p>
      {area.sections.map((section, i) => (
        <div key={i} className="mb-6">
          {section.heading && (
            <h2 className="font-heading text-xl text-ink mb-2">{section.heading}</h2>
          )}
          <p className="text-muted leading-relaxed">{section.body}</p>
        </div>
      ))}
      <div className="mt-12 p-6 bg-surface rounded-2xl border border-line">
        <p className="text-ink font-medium mb-2">Need advice on this?</p>
        <a href="/contact" className="inline-block rounded-full bg-maroon text-white px-5 py-2.5 text-sm font-semibold hover:bg-maroon/90">
          Contact us
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create the four group route files** (identical pattern, one per group)

`lublaw/src/app/wills-estates/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { getPracticeArea } from "@/lib/practice-areas";
import PracticeAreaTemplate from "@/components/PracticeAreaTemplate";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const area = getPracticeArea("wills-estates", slug);
  if (!area) notFound();
  return <PracticeAreaTemplate area={area} />;
}
```

Repeat verbatim for `property-law`, `litigation`, `law-of-contract`, swapping the group string passed to `getPracticeArea`.

- [ ] **Step 5: Create `lublaw/src/app/notary/page.tsx`**

```tsx
import { getPracticeArea } from "@/lib/practice-areas";
import PracticeAreaTemplate from "@/components/PracticeAreaTemplate";
import { notFound } from "next/navigation";

export default function Page() {
  const area = getPracticeArea("notary", "notary");
  if (!area) notFound();
  return <PracticeAreaTemplate area={area} />;
}
```

- [ ] **Step 6: Create `lublaw/src/app/intellectual-property/page.tsx`**

`Intellectual Property` is in the spec's Content Inventory but not in `NAV_GROUPS` (the live nav dropdown doesn't list it either — only the homepage specialisms grid links to it, see Task 8). Give it `PracticeArea.group = "notary"` in the `PRACTICE_AREAS` array from Step 2 (reusing that group value avoids adding a needless sixth enum member for one extra standalone page) and add its own route file:

```tsx
import { getPracticeArea } from "@/lib/practice-areas";
import PracticeAreaTemplate from "@/components/PracticeAreaTemplate";
import { notFound } from "next/navigation";

export default function Page() {
  const area = getPracticeArea("notary", "intellectual-property");
  if (!area) notFound();
  return <PracticeAreaTemplate area={area} />;
}
```

- [ ] **Step 7: Verify every nav link resolves**

```bash
cd lublaw && npm run build && npm run dev
```

Click through all 26 links in the Header (desktop mega-menu) manually in a browser at `http://localhost:3012`, plus `/intellectual-property` directly (it's not in the nav — see Step 6) — confirm none 404 and each shows the real crawled title/content, not placeholder text.

- [ ] **Step 8: Commit**

```bash
cd lublaw && git add -A
git commit -m "feat(lublaw): add practice-area content and page template"
```

---

### Task 7: Legal pages (Cookies Disclaimer, POPIA Privacy Notice)

**Not delegated to DeepSeek** — requires crawling the source pages via Firecrawl.

**Files:**
- Create: `lublaw/src/app/cookies-disclaimer/page.tsx`
- Create: `lublaw/src/app/popia-privacy-notice/page.tsx`

**Interfaces:**
- Consumes: none new.
- Produces: `/cookies-disclaimer`, `/popia-privacy-notice` routes, linked from Footer (Task 5, already wired).

- [ ] **Step 1: Crawl both pages**

`firecrawl_scrape` on `https://lublaw.co.za/cookies-disclaimer/` and `https://lublaw.co.za/popia-privacy-notice/`, `formats: ["markdown"]`, `onlyMainContent: true`.

- [ ] **Step 2: Write `lublaw/src/app/cookies-disclaimer/page.tsx`** (structure below; body text is the crawled content from Step 1, formatted as JSX paragraphs)

```tsx
export default function CookiesDisclaimerPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 prose">
      <h1 className="font-heading text-3xl text-maroon mb-6">Cookies Disclaimer</h1>
      {/* Replace with the real crawled paragraphs from lublaw.co.za/cookies-disclaimer/ */}
      <p className="text-muted leading-relaxed">
        REPLACE WITH CRAWLED CONTENT
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Write `lublaw/src/app/popia-privacy-notice/page.tsx`** using the same structure, heading "POPIA Privacy Notice", body from the second crawl.

- [ ] **Step 4: Verify**

```bash
cd lublaw && npm run build
```

Visit `/cookies-disclaimer` and `/popia-privacy-notice` in the dev server — confirm real crawled text renders, not the placeholder.

- [ ] **Step 5: Commit**

```bash
cd lublaw && git add -A
git commit -m "feat(lublaw): add cookies disclaimer and POPIA privacy notice pages"
```

---

### Task 8: Homepage

**Files:**
- Create: `lublaw/src/app/page.tsx`
- Create: `lublaw/src/components/home/Hero.tsx`
- Create: `lublaw/src/components/home/WhyUs.tsx`
- Create: `lublaw/src/components/home/SpecialismsGrid.tsx`
- Create: `lublaw/src/components/home/AboutBerna.tsx`
- Create: `lublaw/src/components/ContactForm.tsx`

**Interfaces:**
- Consumes: `PRACTICE_AREAS` from `@/lib/practice-areas` (Task 6) — specialisms grid links into real practice pages instead of dead links.
- Produces: `ContactForm` component, reused by Task 9 (wires it to the API route) and by `/contact` page created in this task.

- [ ] **Step 1: Create `lublaw/src/components/home/Hero.tsx`**

```tsx
export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-surface to-white border-b border-line">
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <p className="text-gold-deep font-medium mb-2">Your Dedicated Professional Team</p>
        <h1 className="font-heading text-4xl sm:text-5xl text-maroon mb-4">Where People Matter</h1>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          For expert legal advice, backed by more than 20 years of experience.
        </p>
        <a
          href="/contact"
          className="inline-block mt-8 rounded-full bg-maroon text-white px-8 py-3 font-semibold hover:bg-maroon/90 transition-colors"
        >
          Get in touch
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `lublaw/src/components/home/WhyUs.tsx`**

```tsx
const REASONS = [
  { title: "Experience", body: "We have more than 20 years' in practice across a wide range of specialities." },
  { title: "Knowledge", body: "Our attorneys are experts in their field and offer legal advice with your interests in mind." },
  { title: "Passion", body: "We are passionate about offering our clients a tailored service, unique to their individual circumstances and needs." },
];

export default function WhyUs() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <h2 className="font-heading text-3xl text-center text-ink mb-10">Why use us?</h2>
      <div className="grid sm:grid-cols-3 gap-8">
        {REASONS.map((r) => (
          <div key={r.title} className="text-center">
            <h3 className="font-heading text-xl text-maroon mb-2">{r.title}</h3>
            <p className="text-muted">{r.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `lublaw/src/components/home/SpecialismsGrid.tsx`**

```tsx
const SPECIALISMS = [
  { title: "Drafting Of Wills", href: "/wills-estates/drafting-of-wills" },
  { title: "Trusts", href: "/wills-estates/setting-up-trusts-appointment-of-trustees" },
  { title: "Antenuptial Contracts", href: "/law-of-contract/antenuptial-contracts" },
  { title: "Conveyancing", href: "/property-law/conveyancing" },
  { title: "Deceased Estates", href: "/wills-estates/administration-of-deceased-estates" },
  { title: "Intellectual Property", href: "/intellectual-property" },
  { title: "Power of Attorney", href: "/property-law/power-of-attorney" },
  { title: "Divorces", href: "/litigation/divorces" },
];

export default function SpecialismsGrid() {
  return (
    <section className="bg-surface py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="font-heading text-3xl text-center text-ink mb-10">We specialise in</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SPECIALISMS.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="block bg-white border border-line rounded-2xl p-6 text-center hover:border-maroon hover:shadow-md transition-all"
            >
              <span className="font-heading text-ink">{s.title}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create `lublaw/src/components/home/AboutBerna.tsx`**

```tsx
export default function AboutBerna() {
  return (
    <section className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h2 className="font-heading text-3xl text-ink mb-6">About Berna Lubbe</h2>
      <p className="text-muted leading-relaxed">
        Berna founded B Lubbe & Associate Attorneys in March 1998 on the values and personal
        service that have become part of the firm&apos;s reputation over the last 20 years. Berna
        completed her B.Iuris and LLB Degrees at the University of the Free State. While
        completing her studies she worked at the Master&apos;s Office in Bloemfontein for 3 years.
        After qualifying, she began practicing in 1990 before establishing B Lubbe &amp; Associate
        Attorneys. Today, the practice comprises of five specialist attorneys and legal support
        staff under Berna&apos;s guidance and leadership.
      </p>
    </section>
  );
}
```

- [ ] **Step 5: Create `lublaw/src/components/ContactForm.tsx`**

```tsx
"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("sent");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  if (status === "sent") {
    return (
      <div className="text-center py-8">
        <p className="text-ink font-medium">Thanks — we&apos;ll be in touch soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
      <div>
        <label htmlFor="name" className="block text-sm text-ink mb-1">Name *</label>
        <input
          id="name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-maroon"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm text-ink mb-1">Email *</label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-maroon"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm text-ink mb-1">Message *</label>
        <textarea
          id="message"
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-maroon resize-y"
        />
      </div>
      {status === "error" && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-full bg-maroon text-white px-5 py-2.5 text-sm font-semibold hover:bg-maroon/90 transition-colors disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Submit"}
      </button>
    </form>
  );
}
```

- [ ] **Step 6: Create `lublaw/src/app/page.tsx`**

```tsx
import Hero from "@/components/home/Hero";
import WhyUs from "@/components/home/WhyUs";
import SpecialismsGrid from "@/components/home/SpecialismsGrid";
import AboutBerna from "@/components/home/AboutBerna";
import ContactForm from "@/components/ContactForm";

export default function HomePage() {
  return (
    <>
      <Hero />
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="font-heading text-3xl text-ink mb-6">Where people matter</h2>
        <p className="text-muted leading-relaxed">
          At B Lubbe & Associates, we understand the importance of having someone you can trust
          on your side at every important time in your life. We pride ourselves in offering our
          clients a personalised service that exceeds their expectations and delivers the best
          possible results in all legal matters.
        </p>
      </section>
      <WhyUs />
      <SpecialismsGrid />
      <AboutBerna />
      <section className="max-w-2xl mx-auto px-4 py-16">
        <h2 className="font-heading text-3xl text-center text-ink mb-8">Get in touch</h2>
        <ContactForm />
      </section>
    </>
  );
}
```

- [ ] **Step 7: Create `lublaw/src/app/contact/page.tsx`**

```tsx
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-heading text-3xl text-center text-ink mb-8">Contact Us</h1>
      <ContactForm />
    </div>
  );
}
```

- [ ] **Step 8: Verify**

```bash
cd lublaw && npm run build && npm run dev
```

Visit `http://localhost:3012` — confirm all homepage sections render, are responsive (check mobile width in devtools), and the specialisms grid links resolve (Task 6 pages must already exist). Contact form will error until Task 9 creates the API route — expected.

- [ ] **Step 9: Commit**

```bash
cd lublaw && git add -A
git commit -m "feat(lublaw): add homepage and contact page"
```

---

### Task 9: Contact form API route (Resend)

**Files:**
- Create: `lublaw/src/app/api/contact/route.ts`

**Interfaces:**
- Consumes: `ContactForm` component's fetch call to `/api/contact` (Task 8) — expects `{ name, email, message }`, returns `{ ok: boolean, error?: string }`.

- [ ] **Step 1: Write the route**

```ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  let body: { name?: string; email?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, error: "Please fill in all fields." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    console.error("[contact] RESEND_API_KEY or CONTACT_TO_EMAIL not configured");
    return NextResponse.json(
      { ok: false, error: "Contact form is not yet configured. Please email info@lublaw.co.za directly." },
      { status: 503 }
    );
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "Lublaw Website <onboarding@resend.dev>",
    to,
    replyTo: email,
    subject: `New enquiry from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
  });

  if (error) {
    console.error("[contact] Resend error:", error);
    return NextResponse.json({ ok: false, error: "Failed to send. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
```

Note: `from: "onboarding@resend.dev"` is Resend's default sandbox sender, usable without a verified domain. Once the client has a verified sending domain, change this to e.g. `"Lublaw Website <noreply@lublaw.co.za>"`.

- [ ] **Step 2: Verify without a real key (graceful failure path)**

```bash
cd lublaw && npm run dev
```

Submit the homepage contact form with `.env.local` missing `RESEND_API_KEY` — expected: form shows "Contact form is not yet configured..." error, not a crash or silent failure.

- [ ] **Step 3: Verify with a real key (if available)**

If a Resend API key is available, add it to `.env.local`, restart dev server, submit the form, confirm an email arrives at `CONTACT_TO_EMAIL`. If no key is available yet, skip this step — it's the documented pre-launch TODO from the spec, not a blocker for this task.

- [ ] **Step 4: Commit**

```bash
cd lublaw && git add -A
git commit -m "feat(lublaw): wire contact form to Resend with graceful no-key handling"
```

---

### Task 10: Admin blog CRUD

**Files:**
- Create: `lublaw/src/app/admin/layout.tsx`
- Create: `lublaw/src/components/admin/AdminSidebar.tsx`
- Create: `lublaw/src/app/admin/page.tsx`
- Create: `lublaw/src/app/admin/blog/page.tsx`
- Create: `lublaw/src/app/admin/blog/new/page.tsx`
- Create: `lublaw/src/app/admin/blog/[id]/page.tsx`
- Create: `lublaw/src/app/api/admin/upload-image/route.ts`

**Interfaces:**
- Consumes: `createClient` (server, Task 2), `createAdminClient` (Task 2, for the upload route only), `posts` table (Task 3).
- Produces: nothing consumed by later tasks (this is a leaf feature) — but the `posts` table rows it creates are read by Task 11's public blog pages.

- [ ] **Step 1: Create `lublaw/src/components/admin/AdminSidebar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminSidebar({ email }: { email?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/blog", label: "Blog" },
  ];

  return (
    <aside className="w-56 shrink-0 border-r border-line bg-surface min-h-screen p-4">
      <p className="text-xs text-muted mb-4 truncate">{email}</p>
      <nav className="space-y-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`block px-3 py-2 rounded-lg text-sm ${
              pathname === l.href ? "bg-maroon text-white" : "text-ink hover:bg-white"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <button
        onClick={handleSignOut}
        className="mt-6 text-sm text-muted hover:text-maroon"
      >
        Sign out
      </button>
    </aside>
  );
}
```

- [ ] **Step 2: Create `lublaw/src/app/admin/layout.tsx`**

```tsx
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-surface flex">
      {user && <AdminSidebar email={user.email} />}
      <div className="flex-1 min-w-0">
        <div className="max-w-4xl mx-auto px-6 py-8">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `lublaw/src/app/admin/page.tsx`**

```tsx
export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-heading text-maroon">Admin</h1>
      <p className="mt-2 text-muted">Use the Blog section to create and publish posts.</p>
    </div>
  );
}
```

- [ ] **Step 4: Create `lublaw/src/app/admin/blog/page.tsx`**

```tsx
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type Post = {
  id: string;
  title: string;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
};

export default async function AdminBlogListPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("id,title,status,published_at,created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-maroon">Blog</h1>
        <Link
          href="/admin/blog/new"
          className="rounded-full bg-maroon text-white px-4 py-2 text-sm font-semibold hover:bg-maroon/90"
        >
          New post
        </Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(posts as Post[] ?? []).map((post) => (
              <tr key={post.id} className="hover:bg-surface">
                <td className="px-6 py-4">
                  <Link href={`/admin/blog/${post.id}`} className="font-medium text-maroon hover:underline">
                    {post.title}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                      post.status === "published" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-muted">
                  {new Date(post.published_at ?? post.created_at).toLocaleDateString("en-ZA")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!posts || posts.length === 0) && (
          <p className="text-center text-muted py-12">No posts yet.</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create `lublaw/src/app/admin/blog/new/page.tsx`** (create form → redirects to the edit page)

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("posts")
      .insert({ title, slug: slugify(title), content: "" })
      .select("id")
      .single();
    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    router.push(`/admin/blog/${data.id}`);
  };

  return (
    <div>
      <h1 className="text-2xl font-heading text-maroon mb-6">New post</h1>
      <form onSubmit={handleCreate} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm text-ink mb-1">Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-maroon"
          />
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-maroon text-white px-5 py-2.5 text-sm font-semibold hover:bg-maroon/90 disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create draft"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 6: Create `lublaw/src/app/api/admin/upload-image/route.ts`**

```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ ok: false, error: "No file provided." }, { status: 400 });
  }

  const admin = createAdminClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await admin.storage
    .from("blog-images")
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ ok: false, error: uploadError.message }, { status: 500 });
  }

  const { data } = admin.storage.from("blog-images").getPublicUrl(path);
  return NextResponse.json({ ok: true, url: data.publicUrl });
}
```

- [ ] **Step 7: Create `lublaw/src/app/admin/blog/[id]/page.tsx`** (edit, publish/unpublish, delete, image upload)

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  status: "draft" | "published";
};

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("posts")
      .select("id,title,slug,excerpt,content,featured_image,status")
      .eq("id", id)
      .single()
      .then(({ data }) => setPost(data as Post));
  }, [id]);

  const handleSave = async (statusOverride?: "draft" | "published") => {
    if (!post) return;
    setSaving(true);
    setError("");
    const supabase = createClient();
    const status = statusOverride ?? post.status;
    const { error: updateError } = await supabase
      .from("posts")
      .update({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        featured_image: post.featured_image,
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
      })
      .eq("id", id);
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setPost({ ...post, status });
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    const supabase = createClient();
    await supabase.from("posts").delete().eq("id", id);
    router.push("/admin/blog");
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload-image", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);
    if (data.ok && post) {
      setPost({ ...post, featured_image: data.url });
    } else {
      setError(data.error ?? "Upload failed.");
    }
  };

  if (!post) return <p className="text-muted">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-maroon">Edit post</h1>
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
            post.status === "published" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
          }`}
        >
          {post.status}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-ink mb-1">Title</label>
          <input
            value={post.title}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block text-sm text-ink mb-1">Slug</label>
          <input
            value={post.slug}
            onChange={(e) => setPost({ ...post, slug: e.target.value })}
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block text-sm text-ink mb-1">Excerpt</label>
          <textarea
            rows={2}
            value={post.excerpt}
            onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block text-sm text-ink mb-1">Content (Markdown)</label>
          <textarea
            rows={14}
            value={post.content}
            onChange={(e) => setPost({ ...post, content: e.target.value })}
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-maroon font-mono"
          />
        </div>
        <div>
          <label className="block text-sm text-ink mb-1">Featured image</label>
          {post.featured_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.featured_image} alt="" className="w-40 h-24 object-cover rounded-lg mb-2" />
          )}
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="rounded-full bg-white border border-maroon text-maroon px-5 py-2.5 text-sm font-semibold hover:bg-surface disabled:opacity-50"
          >
            Save
          </button>
          {post.status === "draft" ? (
            <button
              onClick={() => handleSave("published")}
              disabled={saving}
              className="rounded-full bg-maroon text-white px-5 py-2.5 text-sm font-semibold hover:bg-maroon/90 disabled:opacity-50"
            >
              Publish
            </button>
          ) : (
            <button
              onClick={() => handleSave("draft")}
              disabled={saving}
              className="rounded-full bg-ink text-white px-5 py-2.5 text-sm font-semibold hover:bg-ink/90 disabled:opacity-50"
            >
              Unpublish
            </button>
          )}
          <button
            onClick={handleDelete}
            className="ml-auto rounded-full text-red-600 px-5 py-2.5 text-sm font-semibold hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Verify end-to-end**

```bash
cd lublaw && npm run build && npm run dev
```

With a real Supabase project configured (Task 3 applied, one admin user created): sign in at `/admin/login`, create a post via `/admin/blog/new`, edit its content, upload a featured image, publish it, confirm it shows in the `/admin/blog` list with a "published" badge, then delete it and confirm it disappears.

- [ ] **Step 9: Commit**

```bash
cd lublaw && git add -A
git commit -m "feat(lublaw): add admin blog CRUD with image upload"
```

---

### Task 11: Public blog pages

**Files:**
- Create: `lublaw/src/app/blog/page.tsx`
- Create: `lublaw/src/app/blog/[slug]/page.tsx`

**Interfaces:**
- Consumes: `createClient` (server, Task 2), `posts` table (Task 3, RLS already restricts to `status = 'published'` for anonymous reads).

- [ ] **Step 1: Create `lublaw/src/app/blog/page.tsx`** (paginated list, 12 per page)

```tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 12;

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const { data: posts, count } = await supabase
    .from("posts")
    .select("id,title,slug,excerpt,featured_image,published_at", { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="font-heading text-3xl text-maroon mb-10 text-center">Blog</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {(posts ?? []).map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="block border border-line rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
          >
            {post.featured_image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.featured_image} alt="" className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
              <h2 className="font-heading text-lg text-ink mb-1">{post.title}</h2>
              <p className="text-xs text-muted mb-2">
                {post.published_at && new Date(post.published_at).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}
              </p>
              <p className="text-sm text-muted line-clamp-3">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
      {(!posts || posts.length === 0) && <p className="text-center text-muted py-12">No posts yet.</p>}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/blog?page=${p}`}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                p === page ? "bg-maroon text-white" : "bg-surface text-ink hover:bg-line"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create `lublaw/src/app/blog/[slug]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReactMarkdown from "react-markdown";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("title,excerpt,content,featured_image,published_at")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) notFound();

  return (
    <article className="max-w-2xl mx-auto px-4 py-16">
      {post.featured_image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.featured_image} alt="" className="w-full h-64 object-cover rounded-2xl mb-8" />
      )}
      <h1 className="font-heading text-3xl text-maroon mb-2">{post.title}</h1>
      <p className="text-sm text-muted mb-8">
        {post.published_at && new Date(post.published_at).toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" })}
      </p>
      <div className="prose max-w-none text-ink">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
}
```

- [ ] **Step 3: Verify**

```bash
cd lublaw && npm run build && npm run dev
```

Publish a test post via `/admin/blog` (Task 10), confirm it appears on `/blog` and its detail page renders markdown correctly at `/blog/<slug>`. Confirm a draft post does NOT appear on `/blog`.

- [ ] **Step 4: Commit**

```bash
cd lublaw && git add -A
git commit -m "feat(lublaw): add public blog list and post detail pages"
```

---

### Task 12: Scrape legacy blog into an intake JSON file

**Not delegated to DeepSeek** — requires live crawling via Firecrawl tools. Execute this task directly, mirroring `dianas-bulbinella/scripts/import-legacy.mjs`'s pattern of reading from a pre-scraped local JSON file rather than crawling inline in the import script.

**Files:**
- Create: `lublaw/intake/legacy-blog/posts.json`

**Interfaces:**
- Produces: a JSON array consumed by Task 13's import script — each element: `{ title: string, slug: string, publishedAt: string (ISO), content: string (markdown), imageUrl: string | null }`.

- [ ] **Step 1: Enumerate every post URL**

Use `firecrawl_scrape` (or `firecrawl_map`, if it more cheaply lists URLs under a path) on `https://lublaw.co.za/blog-2/page/1/` through `.../page/17/` (17 listing pages, per the design spec), `formats: ["links"]`. Collect every post URL that isn't a nav/social/page-number link (post URLs follow the pattern `https://lublaw.co.za/<post-slug>/`, dated `YYYY/MM/DD` archive links can be ignored). De-duplicate the list.

- [ ] **Step 2: Scrape each post**

For each URL from Step 1, `firecrawl_scrape` with `formats: ["markdown"]`, `onlyMainContent: true`. From the result extract: title (H1 or `<title>` minus site name), publish date (shown near the top, e.g. "25 Jun 2026" — parse to ISO 8601), body content (main article text, excluding nav/footer/related-posts boilerplate), and the featured image URL (first image in the article, typically a `wp-content/uploads/...` URL).

- [ ] **Step 3: Write the results**

Write the array to `lublaw/intake/legacy-blog/posts.json`:

```json
[
  {
    "title": "One Bad Letter and Your Eviction Falls Apart",
    "slug": "one-bad-letter-and-your-eviction-falls-apart",
    "publishedAt": "2026-06-25T00:00:00.000Z",
    "content": "A tenant may be in clear breach of a lease, but that does not guarantee a successful eviction...",
    "imageUrl": "https://lublaw.co.za/wp-content/uploads/2026/06/eviction_650x300-400x250.png"
  }
]
```

(One real entry shown for format; populate with all ~150+ scraped posts.)

- [ ] **Step 4: Verify**

Confirm `lublaw/intake/legacy-blog/posts.json` is valid JSON (`node -e "JSON.parse(require('fs').readFileSync('lublaw/intake/legacy-blog/posts.json'))"` should exit 0) and its length roughly matches the ~150+ posts implied by 17 listing pages. Spot check 3 entries (including the first post scraped and the last) against the live site for title/date accuracy.

- [ ] **Step 5: Add `intake/` to `.gitignore` if it contains large scraped content not meant for version control**, or commit it if the user wants the scrape preserved as a record — default to committing it (small text/JSON, useful as an audit trail, matches `dianas-bulbinella` which committed `intake/legacy/customers.json`).

```bash
cd lublaw && git add intake/
git commit -m "feat(lublaw): add scraped legacy blog intake data"
```

---

### Task 13: Blog migration script

**Files:**
- Create: `lublaw/scripts/import-blog.mjs`
- Modify: `lublaw/package.json` (add `import-blog` / `import-blog:apply` scripts)

**Interfaces:**
- Consumes: `lublaw/intake/legacy-blog/posts.json` (Task 12), `posts` table (Task 3), `blog-images` Storage bucket (Task 3's manual setup step).

- [ ] **Step 1: Add npm scripts to `lublaw/package.json`**

```json
"import-blog": "node --env-file=.env.local scripts/import-blog.mjs",
"import-blog:apply": "node --env-file=.env.local scripts/import-blog.mjs --apply",
```

- [ ] **Step 2: Write `lublaw/scripts/import-blog.mjs`**

```js
/**
 * Import the legacy lublaw.co.za blog (scraped into intake/legacy-blog/posts.json,
 * see Task 12) into the `posts` table, uploading each featured image into the
 * `blog-images` Storage bucket first so nothing depends on the old WordPress host.
 *
 *   npm run import-blog          # dry run: reports what WOULD happen
 *   npm run import-blog:apply    # writes
 *
 * Idempotent: upserts on `slug` (unique), so a half-finished run can be re-run safely.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SERVICE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const APPLY = process.argv.includes("--apply");
const db = createClient(URL, SERVICE, { auth: { persistSession: false } });

const intakePath = join(root, "intake", "legacy-blog", "posts.json");
const posts = JSON.parse(readFileSync(intakePath, "utf8"));

console.log(`Loaded ${posts.length} posts from intake file.`);

function excerptFrom(content) {
  return content.replace(/\s+/g, " ").trim().slice(0, 200);
}

async function uploadImage(post) {
  if (!post.imageUrl) return "";
  const res = await fetch(post.imageUrl);
  if (!res.ok) {
    console.warn(`  image fetch failed (${res.status}) for ${post.slug}, skipping image`);
    return "";
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const ext = post.imageUrl.split(".").pop()?.split("?")[0] ?? "jpg";
  const path = `legacy/${post.slug}.${ext}`;

  if (!APPLY) return `[would upload to ${path}]`;

  const { error } = await db.storage.from("blog-images").upload(path, buffer, {
    contentType: res.headers.get("content-type") ?? "image/jpeg",
    upsert: true,
  });
  if (error) {
    console.warn(`  image upload failed for ${post.slug}: ${error.message}`);
    return "";
  }
  const { data } = db.storage.from("blog-images").getPublicUrl(path);
  return data.publicUrl;
}

let created = 0;
let updated = 0;
let failed = 0;

for (const post of posts) {
  const imageUrl = await uploadImage(post);

  const row = {
    title: post.title,
    slug: post.slug,
    excerpt: excerptFrom(post.content),
    content: post.content,
    featured_image: imageUrl,
    status: "published",
    published_at: post.publishedAt,
  };

  if (!APPLY) {
    console.log(`[dry run] would upsert: ${post.slug}`);
    continue;
  }

  const { error, data } = await db
    .from("posts")
    .upsert(row, { onConflict: "slug" })
    .select("id");

  if (error) {
    console.error(`  FAILED ${post.slug}: ${error.message}`);
    failed++;
  } else if (data?.length) {
    created++;
  }
}

if (APPLY) {
  console.log(`\nDone. Upserted: ${created}, failed: ${failed}, total in intake: ${posts.length}`);
} else {
  console.log(`\nDry run complete. ${posts.length} posts would be upserted. Re-run with --apply to write.`);
}
```

- [ ] **Step 3: Dry run**

```bash
cd lublaw && npm run import-blog
```

Expected: logs `[dry run] would upsert: <slug>` for every post, ending with a count matching `posts.json`'s length, no errors.

- [ ] **Step 4: Apply**

Requires: migration 0001 already run (Task 3), `blog-images` bucket created (Task 3), `.env.local` populated with real Supabase credentials.

```bash
cd lublaw && npm run import-blog:apply
```

Expected: "Done. Upserted: N, failed: 0, total in intake: N" where N matches the scraped post count.

- [ ] **Step 5: Verify against the spec's success criteria**

Query `select count(*) from posts;` in the Supabase SQL editor — confirm it matches the intake file's length. Spot-check 5 posts (including the oldest and newest by `published_at`) against the live `lublaw.co.za` site: title, date, content, and image all match. Visit `/blog` in the dev server and confirm pagination shows the full imported history.

- [ ] **Step 6: Commit**

```bash
cd lublaw && git add -A
git commit -m "feat(lublaw): add blog migration script and run full historical import"
```

---

### Task 14: Deploy readiness (no actual deploy)

**Files:**
- Create: `lublaw/README.md`
- Verify: `lublaw/.gitignore` includes `.env.local`, `node_modules`, `.next`

**Interfaces:** none — this task produces documentation only.

- [ ] **Step 1: Write `lublaw/README.md`**

```markdown
# Lublaw — B Lubbe & Associates Attorneys

Next.js rebuild of https://lublaw.co.za/. See `docs/superpowers/specs/2026-07-22-lublaw-rebuild-design.md`
at the monorepo root for the full design spec.

## Local development

    npm install
    cp .env.local.example .env.local   # fill in Supabase + Resend keys
    npm run dev                        # http://localhost:3012

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key (RLS-enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key — used only in `scripts/import-blog.mjs` and the admin image-upload API route. Never expose client-side. |
| `RESEND_API_KEY` | Contact form email delivery. Without it, the form fails gracefully with a visible error. |
| `CONTACT_TO_EMAIL` | Where contact form submissions are sent (default `info@lublaw.co.za`) |

## First-time Supabase setup

See `supabase/README.md`.

## Deployment

Not yet deployed. Intended target: Vercel, git-push auto-deploy from `main`, matching the
majority of sibling projects in this monorepo. Requires: Vercel project linked, environment
variables set in the Vercel dashboard, a verified Resend sending domain (currently using the
sandbox `onboarding@resend.dev` sender — swap in `src/app/api/contact/route.ts` once available).
```

- [ ] **Step 2: Confirm `.gitignore` correctness**

```bash
cd lublaw && cat .gitignore | grep -E "env.local|node_modules|.next"
```

Expected: all three present (created by `create-next-app` in Task 1 by default — this step only confirms, doesn't add).

- [ ] **Step 3: Full build check**

```bash
cd lublaw && npm run build && npm run lint
```

Expected: clean build, no lint errors, confirming the site is deploy-ready.

- [ ] **Step 4: Commit**

```bash
cd lublaw && git add -A
git commit -m "docs(lublaw): add README with setup and deploy-readiness notes"
```

- [ ] **Step 5: Stop here — do not run `vercel` or push to a shared remote.** Report deploy readiness to the user and let them decide when to link the Vercel project and go live, per this session's standing rule on actions visible to others.

---

## Post-plan note

Task ordering: 1→2→3→4→5 must run in sequence (each depends on the last). Task 6 depends on 5 (nav) but not on 4. Tasks 7 and 8 can run in parallel with each other once 5 is done. Task 9 depends on 8. Task 10 depends on 2, 3, 4. Task 11 depends on 3, 10 (needs at least the schema; doesn't need actual admin-created content to build, but needs it to verify). Task 12 has no code dependency (pure data gathering) but is easiest to sequence after 3 (bucket/table exist) so Task 13 can follow immediately. Task 13 depends on 3, 12. Task 14 is last.
