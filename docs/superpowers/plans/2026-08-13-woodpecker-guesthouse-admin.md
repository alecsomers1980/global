# Woodpecker Guesthouse — Admin Implementation Plan (Plan B)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the guesthouse owner a self-serve `/admin` panel — staff login (forgot-password, show-password, keep-signed-in, optional TOTP 2FA), rooms CRUD, and a gallery manager (multi-upload, auto-optimize, category delete, bulk delete) — wired onto the Foundation site (Plan A) without touching its public pages' behaviour except adding ISR so admin edits actually go live.

**Architecture:** Supabase Auth (cookie-based, `@supabase/ssr`) gates `/admin/*` via `src/proxy.ts` — Next.js 16 renamed `middleware.ts` to `proxy.ts`, confirmed against dianas-bulbinella's working implementation, not assumed from older training data. A `profiles` table + `is_staff()` RLS function (identical pattern to dianas-bulbinella and Aloe Signs) lets admin pages read/write `rooms`/`gallery_*` directly through the RLS-enforced browser client — no bespoke API routes for CRUD, only for the one thing RLS can't gate cleanly: image uploads to Storage (service-role client, same Blob-wrapping fix already proven on mountaincreek-lodge).

**Tech Stack:** `@supabase/ssr`, `@supabase/supabase-js` (already installed), `sharp` (new dependency, for upload optimization).

**Spec:** `docs/superpowers/specs/2026-08-13-woodpecker-guesthouse-design.md` §6. Builds on `docs/superpowers/plans/2026-08-13-woodpecker-guesthouse-foundation.md` (Plan A, already implemented).

## Global Constraints

- **Reference implementations, not invented from scratch:** this plan's auth code is adapted from dianas-bulbinella's working `/admin` (the most current pattern in the portfolio — confirmed Next 16 `proxy.ts` naming, async `cookies()`) and mountaincreek-lodge's upload route (confirmed Blob-wrap fix for the Supabase Storage Buffer-corruption gotcha). Where this plan's code differs from those originals, it's only branding/schema, never the auth or upload mechanics.
- **2FA is optional per user, not mandatory** — spec didn't request mandatory 2FA, matching the "optional unless project says mandatory" default.
- **No new admin API routes for CRUD** — `rooms`/`gallery_categories`/`gallery_images` writes go through the RLS-enforced browser client directly from admin pages (`is_staff()` policy permits it). Only Storage uploads get a route, because Storage write policy can't cleanly express "any authenticated staff member, one bucket" through client-side RLS alone the way table RLS can.
- **New staff accounts are created via the Supabase dashboard** (Authentication → Users → invite), not a custom signup flow — matches the existing Aloe Signs pattern ("admin = Andre only" precedent) and keeps scope minimal (not requested in spec §6).
- **SA English spelling**, **no fabricated content**, **explicit git add paths only** — same as Plan A's Global Constraints.
- **No test framework** — same house convention as Plan A: `npm run build` + running the dev server is the verification method; `node --test` only for pure-logic helpers.

---

### Task 1: Auth Schema Migration

**Files:**
- Create: `supabase/migrations/0002_admin_auth.sql`

**Interfaces:**
- Produces: `public.profiles(id, email, role, created_at)`, `public.is_staff(): boolean`, `on_auth_user_created` trigger, staff-write RLS policies on `rooms`/`gallery_categories`/`gallery_images`, and the `site-media` public Storage bucket.

- [ ] **Step 1: Write the migration**

```sql
-- Woodpecker Guesthouse — admin auth (staff profiles, is_staff(), staff-write RLS).

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  role       text not null default 'staff' check (role in ('admin', 'staff')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "read own profile" on public.profiles
  for select using (auth.uid() = id);

-- helper: is the current auth user an admin or staff?
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'staff')
  );
$$;

-- auto-create a profile row (role defaults to 'staff') whenever a new
-- Supabase Auth user is created — promote to 'admin' manually in the table.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- staff-write policies on the tables Foundation (0001_init.sql) already made
-- public-read. Public-read policies from 0001 are untouched.
create policy "staff write rooms" on public.rooms
  for all using (public.is_staff()) with check (public.is_staff());
create policy "staff write gallery categories" on public.gallery_categories
  for all using (public.is_staff()) with check (public.is_staff());
create policy "staff write gallery images" on public.gallery_images
  for all using (public.is_staff()) with check (public.is_staff());

-- public bucket for room/gallery photos — service-role uploads bypass RLS,
-- and a public bucket serves reads without needing storage RLS policies.
insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do nothing;
```

- [ ] **Step 2: Run the migration**

Run in the Supabase SQL editor, after `0001_init.sql`. Verify: `select proname from pg_proc where proname = 'is_staff';` returns one row; `select * from storage.buckets where id = 'site-media';` returns one row with `public = true`.

- [ ] **Step 3: Promote the first admin account**

After the guesthouse owner's account is created via the Supabase dashboard (Authentication → Users → Invite), run:
`update public.profiles set role = 'admin' where email = 'owner@example.com';` (real email once known — every other account defaults to `'staff'`, which is enough to pass `is_staff()`).

- [ ] **Step 4: Commit**

```bash
git add woodpecker-guesthouse/supabase/migrations/0002_admin_auth.sql
git commit -m "feat(woodpecker-guesthouse): add admin auth schema (profiles, is_staff, staff-write RLS)"
```

---

### Task 2: Supabase Client Helpers + Auth Utilities

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/admin.ts`
- Create: `src/lib/auth.ts`

**Interfaces:**
- Produces: `createClient(persist?: boolean)` (browser, cookie-based), `createClient(): Promise<SupabaseClient>` (server, async `cookies()`), `createAdminClient()` (service-role, Storage only), `aalFromAccessToken(token)`, `hasVerifiedFactor(user)`. Task 3 (`proxy.ts`) and every admin page consume these.

- [ ] **Step 1: Create `src/lib/supabase/client.ts`**

```ts
import { createBrowserClient } from "@supabase/ssr";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

/**
 * Browser Supabase client (anon key, RLS-enforced). For client components.
 *
 * `persist` drives "keep me signed in":
 *  - true  → cookie lives 30 days, survives a browser restart
 *  - false → session cookie, cleared when the browser closes
 * Omitted (undefined) leaves the existing cookie lifetime alone — what every
 * page other than the login screen wants.
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

- [ ] **Step 2: Create `src/lib/supabase/server.ts`**

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Server-side Supabase client (RLS-enforced, uses the anon key + the user's
 *  session cookies). Next 16: cookies() is async. */
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

- [ ] **Step 3: Create `src/lib/supabase/admin.ts`**

```ts
import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/** Service-role client — bypasses RLS entirely. Only ever import this from
 *  API routes that do their own auth check first (see the upload route in
 *  Task 9). Never expose to a Client Component. */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
```

- [ ] **Step 4: Create `src/lib/auth.ts`**

```ts
import type { User } from "@supabase/supabase-js";

/** Assurance level carried in the Supabase access token. aal2 = MFA satisfied. */
export type Aal = "aal1" | "aal2";

/**
 * Read the `aal` claim straight off the access token. Supabase puts it in the
 * JWT payload; decoding is enough because the token's authenticity is already
 * established by getUser() before we ever call this.
 */
export function aalFromAccessToken(accessToken: string | undefined): Aal {
  if (!accessToken) return "aal1";
  try {
    const payload = accessToken.split(".")[1];
    if (!payload) return "aal1";
    const json = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
    return json.aal === "aal2" ? "aal2" : "aal1";
  } catch {
    return "aal1";
  }
}

/** True once the user has a TOTP factor they've actually completed enrolment on. */
export function hasVerifiedFactor(user: User | null): boolean {
  return !!user?.factors?.some((f) => f.status === "verified");
}
```

- [ ] **Step 5: Add the `server-only` dependency**

`src/lib/supabase/admin.ts` imports `server-only` to hard-fail the build if it's ever pulled into client code. Add it to `package.json` dependencies: `"server-only": "^0.0.1"`. Run: `npm install`.

- [ ] **Step 6: Verify**

Run: `npm run build` — expect success (these files aren't imported anywhere yet, so this only checks they type-check standalone).

- [ ] **Step 7: Commit**

```bash
git add woodpecker-guesthouse/src/lib/supabase/client.ts woodpecker-guesthouse/src/lib/supabase/server.ts woodpecker-guesthouse/src/lib/supabase/admin.ts woodpecker-guesthouse/src/lib/auth.ts woodpecker-guesthouse/package.json woodpecker-guesthouse/package-lock.json
git commit -m "feat(woodpecker-guesthouse): add Supabase auth client helpers"
```

---

### Task 3: Proxy Gate

**Files:**
- Create: `src/proxy.ts`

**Interfaces:**
- Consumes: `aalFromAccessToken`, `hasVerifiedFactor` (Task 2).

- [ ] **Step 1: Write `src/proxy.ts`**

> **Correction (found during implementation):** `createServerClient()` throws synchronously ("Your project's URL and Key are required") when Supabase env vars are unset — confirmed by running it. `proxy.ts`'s matcher covers nearly every route, so this isn't just an `/admin` problem like Foundation's data-layer guard was: without a live Supabase project, **the entire public site 500s on every request**. Added an early guard: no Supabase configured → pass public pages through untouched, send `/admin/*` straight to `/admin/login` instead of crashing.

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { aalFromAccessToken, hasVerifiedFactor } from "@/lib/auth";

/** Next 16 renamed `middleware.ts` → `proxy.ts`. Refreshes the Supabase auth
 *  session on every matched request and gates the /admin (staff-only) area. */
export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const path = request.nextUrl.pathname;
  const isAdmin = path.startsWith("/admin");
  const isAdminLogin = path === "/admin/login";

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isAdmin && !isAdminLogin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminVerify = path === "/admin/verify";

  const redirectTo = (pathname: string, withNext = false) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = "";
    if (withNext) url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  };

  let role: string | null = null;
  if (user && (isAdmin || isAdminLogin)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? null;
  }
  const isStaff = role === "admin" || role === "staff";

  if (isAdmin && !isAdminLogin) {
    if (!user) return redirectTo("/admin/login", true);
    if (!isStaff) return redirectTo("/");
  }
  if (isAdminLogin && user && isStaff) {
    return redirectTo("/admin");
  }

  // Optional 2FA: once a staff member has enrolled a TOTP factor, every admin
  // page (except the verify screen itself) requires a fresh aal2 session.
  if (isStaff && hasVerifiedFactor(user)) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const aal = aalFromAccessToken(session?.access_token);
    if (isAdmin && !isAdminLogin && !isAdminVerify && aal !== "aal2") {
      return redirectTo("/admin/verify");
    }
    if (isAdminVerify && aal === "aal2") {
      return redirectTo("/admin");
    }
  } else if (isAdminVerify && isStaff) {
    return redirectTo("/admin");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:mp4|png|jpg|jpeg|webp|svg|ico)$).*)"],
};
```

- [ ] **Step 2: Verify**

Run: `npm run build`. With no live Supabase project yet, `supabase.auth.getUser()` will return `{ user: null }` (network error surfaces as no session, not a crash — the Supabase client itself doesn't throw here since `client.ts`/`server.ts` always receive a URL/key, unlike Foundation's unconfigured-guard case). Confirm `npm run dev`, visiting `/admin`, redirects to `/admin/login`.

- [ ] **Step 3: Commit**

```bash
git add woodpecker-guesthouse/src/proxy.ts
git commit -m "feat(woodpecker-guesthouse): add proxy gate for /admin"
```

---

### Task 4: PasswordInput + Admin Login Page

**Files:**
- Create: `src/components/auth/PasswordInput.tsx`
- Create: `src/app/admin/login/page.tsx`

**Interfaces:**
- Consumes: `createClient` (Task 2, browser).
- Produces: `<PasswordInput value id onChange autoComplete? placeholder? />` — reused by Tasks 5 and 6.

- [ ] **Step 1: Create `PasswordInput.tsx`**

```tsx
"use client";
import { useState } from "react";

/**
 * Password field with a reveal toggle. Standing rule for every login in these
 * projects: forgot-password + show-password + keep-signed-in (+ optional 2FA).
 */
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
        className="rounded-xl border border-line bg-white px-4 py-2.5 pr-16 text-sm w-full outline-none focus:border-terracotta"
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
        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-terracotta px-2 py-1"
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/app/admin/login/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/auth/PasswordInput";

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
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    setLoading(false);
    if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
      router.push("/admin/verify");
      return;
    }
    router.push(searchParams.get("next") ?? "/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="bg-paper border border-line rounded-2xl p-8 w-full max-w-sm shadow-sm">
        <h1 className="font-display text-xl text-ink text-center">Woodpecker Guesthouse</h1>
        <p className="text-sm text-muted text-center mt-1">Admin</p>
        <p className="text-xs text-muted text-center mt-4">Staff sign-in</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-ink mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-ink mb-1" htmlFor="password">
              Password
            </label>
            <PasswordInput id="password" value={password} onChange={setPassword} />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted cursor-pointer">
              <input
                type="checkbox"
                className="accent-terracotta"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
              />
              Keep me signed in
            </label>
            <Link href="/forgot-password" className="text-terracotta hover:underline">
              Forgot password?
            </Link>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-terracotta text-white px-5 py-2.5 text-sm font-semibold hover:bg-terracotta-deep transition-colors w-full disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npm run build`. In `npm run dev`, visit `/admin/login` and confirm the form renders (submitting without a live Supabase project will show a Supabase network error, which is expected until Task 1's migration runs against a real project).

- [ ] **Step 4: Commit**

```bash
git add woodpecker-guesthouse/src/components/auth/PasswordInput.tsx woodpecker-guesthouse/src/app/admin/login/page.tsx
git commit -m "feat(woodpecker-guesthouse): add admin login page"
```

---

### Task 5: Forgot Password + Reset Password Pages

**Files:**
- Create: `src/app/forgot-password/page.tsx`
- Create: `src/app/reset-password/page.tsx`

**Interfaces:**
- Consumes: `createClient` (Task 2, browser), `<PasswordInput />` (Task 4).

- [ ] **Step 1: Create `forgot-password/page.tsx`**

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
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      // Supabase doesn't reveal if the email exists, so we always show success
      if (resetError) setError(resetError.message);
      else setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="max-w-md mx-auto px-6 py-16">
        <div className="bg-paper border border-line rounded-2xl p-8 shadow-sm text-center">
          <h1 className="font-display text-2xl text-ink mb-4">Reset your password</h1>
          <p className="text-muted mb-6">If that email exists, we&apos;ve sent a reset link.</p>
          <Link href="/admin/login" className="text-terracotta hover:underline text-sm font-medium">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="bg-paper border border-line rounded-2xl p-8 shadow-sm">
        <h1 className="font-display text-2xl text-ink mb-6">Reset your password</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm text-ink mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
              required
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-terracotta text-white px-5 py-2.5 text-sm font-semibold hover:bg-terracotta-deep transition-colors disabled:opacity-50"
          >
            {loading ? "Sending link..." : "Send reset link"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          Remember your password?{" "}
          <Link href="/admin/login" className="text-terracotta hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `reset-password/page.tsx`**

```tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/auth/PasswordInput";

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
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) setError(updateError.message);
      else setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="max-w-md mx-auto px-6 py-16">
        <div className="bg-paper border border-line rounded-2xl p-8 shadow-sm text-center">
          <h1 className="font-display text-2xl text-ink mb-4">Choose a new password</h1>
          <p className="text-muted">Open the reset link from your email to continue.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-6 py-16">
        <div className="bg-paper border border-line rounded-2xl p-8 shadow-sm text-center">
          <h1 className="font-display text-2xl text-ink mb-4">Password updated</h1>
          <p className="text-muted mb-6">Your password has been changed successfully.</p>
          <button
            onClick={() => {
              router.push("/admin");
              router.refresh();
            }}
            className="rounded-full bg-terracotta text-white px-5 py-2.5 text-sm font-semibold hover:bg-terracotta-deep transition-colors"
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
        <h1 className="font-display text-2xl text-ink mb-6">Choose a new password</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="new-password" className="block text-sm text-ink mb-1">
              New password
            </label>
            <PasswordInput id="new-password" value={password} onChange={setPassword} autoComplete="new-password" />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm text-ink mb-1">
              Confirm password
            </label>
            <PasswordInput
              id="confirm-password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-terracotta text-white px-5 py-2.5 text-sm font-semibold hover:bg-terracotta-deep transition-colors disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npm run build`. In `npm run dev`, visit `/forgot-password` and confirm the form renders; visit `/reset-password` directly (no recovery session) and confirm it shows the "open the reset link" state, not a crash.

- [ ] **Step 4: Commit**

```bash
git add woodpecker-guesthouse/src/app/forgot-password woodpecker-guesthouse/src/app/reset-password
git commit -m "feat(woodpecker-guesthouse): add forgot/reset password pages"
```

---

### Task 6: Optional 2FA (Security Enrolment + Verify Challenge)

**Files:**
- Create: `src/app/admin/security/page.tsx`
- Create: `src/app/admin/verify/page.tsx`

**Interfaces:**
- Consumes: `createClient` (Task 2, browser).

- [ ] **Step 1: Create `admin/security/page.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Factor = { id: string; status: string; friendly_name?: string };

/** Optional two-factor for staff. Enable it here with Google Authenticator (or
 *  any TOTP app); once enabled, proxy.ts requires the code at every sign-in. */
export default function AdminSecurityPage() {
  const router = useRouter();
  const [factors, setFactors] = useState<Factor[]>([]);
  const [qr, setQr] = useState("");
  const [secret, setSecret] = useState("");
  const [factorId, setFactorId] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await createClient().auth.mfa.listFactors();
    setFactors((data?.totp ?? []) as Factor[]);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const startEnrol = async () => {
    setError("");
    setBusy(true);
    const { data, error } = await createClient().auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `Authenticator ${new Date().toISOString().slice(0, 10)}`,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setFactorId(data.id);
    setQr(data.totp.qr_code);
    setSecret(data.totp.secret);
  };

  const cancelEnrol = async () => {
    if (factorId) await createClient().auth.mfa.unenroll({ factorId });
    setQr("");
    setSecret("");
    setCode("");
    setFactorId("");
  };

  const confirmEnrol = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const supabase = createClient();
    const challenge = await supabase.auth.mfa.challenge({ factorId });
    if (challenge.error) {
      setError(challenge.error.message);
      setBusy(false);
      return;
    }
    const verify = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code: code.trim(),
    });
    setBusy(false);
    if (verify.error) {
      setError(verify.error.message);
      return;
    }
    setQr("");
    setSecret("");
    setCode("");
    setFactorId("");
    await load();
    router.refresh();
  };

  const disable = async (id: string) => {
    setError("");
    setBusy(true);
    const { error } = await createClient().auth.mfa.unenroll({ factorId: id });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    await load();
    router.refresh();
  };

  const verified = factors.filter((f) => f.status === "verified");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Security</h1>
        <p className="mt-1 text-sm text-muted">
          Two-factor authentication (optional). Use Google Authenticator, Authy, 1Password or any TOTP app. Once
          enabled, you&apos;ll enter a 6-digit code each time you sign in.
        </p>
      </div>

      <div className="rounded-xl border border-line bg-white p-6 space-y-5 max-w-lg">
        {loading ? (
          <p className="text-muted">Loading…</p>
        ) : verified.length > 0 && !qr ? (
          <div className="space-y-4">
            <p className="text-olive-deep font-medium">✓ Two-factor is active on this account.</p>
            {verified.map((f) => (
              <div key={f.id} className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted">{f.friendly_name || "Authenticator"} — verified</span>
                <button
                  onClick={() => disable(f.id)}
                  disabled={busy}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Disable
                </button>
              </div>
            ))}
            <p className="text-xs text-muted">
              Lost your phone? Disable here, then set it up again — or remove the factor from the Supabase dashboard
              (Authentication → Users).
            </p>
          </div>
        ) : qr ? (
          <form onSubmit={confirmEnrol} className="space-y-4">
            <p className="text-sm text-ink">1. Scan this QR code in your authenticator app:</p>
            {/* Supabase returns an SVG data URL */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="Two-factor QR code" className="bg-white p-3 rounded-lg border border-line w-48 h-48" />
            <div>
              <p className="text-sm text-ink mb-1">
                Can&apos;t scan? Enter this key manually — <strong>save it in your password manager</strong>, it&apos;s
                how you recover on a new phone:
              </p>
              <code className="block bg-surface border border-line rounded-lg px-3 py-2 text-xs break-all">
                {secret}
              </code>
            </div>
            <div>
              <p className="text-sm text-ink mb-1">2. Enter the 6-digit code it shows:</p>
              <input
                className="rounded-xl border border-line bg-white px-4 py-2.5 text-center text-2xl tracking-[0.4em] text-ink w-full outline-none focus:border-terracotta"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={busy || code.length !== 6}
                className="rounded-lg bg-terracotta px-4 py-2 text-sm font-medium text-white hover:bg-terracotta-deep disabled:opacity-50"
              >
                {busy ? "Verifying…" : "Enable two-factor"}
              </button>
              <button
                type="button"
                onClick={cancelEnrol}
                className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-surface"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted">
              Two-factor isn&apos;t set up yet. Add it for stronger protection of the admin area.
            </p>
            <button
              onClick={startEnrol}
              disabled={busy}
              className="rounded-lg bg-terracotta px-4 py-2 text-sm font-medium text-white hover:bg-terracotta-deep disabled:opacity-50"
            >
              {busy ? "Preparing…" : "Set up two-factor"}
            </button>
          </div>
        )}
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `admin/verify/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** Second factor at sign-in: enter the 6-digit TOTP code. proxy.ts sends staff
 *  here whenever they have 2FA enabled but haven't cleared it this session. */
export default function AdminVerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const supabase = createClient();

    const factors = await supabase.auth.mfa.listFactors();
    if (factors.error) {
      setError(factors.error.message);
      setBusy(false);
      return;
    }
    const totp = factors.data.totp[0];
    if (!totp) {
      setError("No authenticator is set up on this account.");
      setBusy(false);
      return;
    }

    const challenge = await supabase.auth.mfa.challenge({ factorId: totp.id });
    if (challenge.error) {
      setError(challenge.error.message);
      setBusy(false);
      return;
    }

    const verify = await supabase.auth.mfa.verify({
      factorId: totp.id,
      challengeId: challenge.data.id,
      code: code.trim(),
    });
    setBusy(false);
    if (verify.error) {
      setError(verify.error.message);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  const signOut = async () => {
    await createClient().auth.signOut();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="bg-paper border border-line rounded-2xl p-8 w-full max-w-sm shadow-sm space-y-4"
      >
        <h1 className="text-lg font-semibold text-ink">Two-factor verification</h1>
        <p className="text-sm text-muted">Enter the 6-digit code from your authenticator app.</p>
        <input
          className="rounded-xl border border-line bg-white px-4 py-3 text-center text-2xl tracking-[0.4em] text-ink w-full outline-none focus:border-terracotta"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        />
        <button
          type="submit"
          disabled={busy || code.length !== 6}
          className="rounded-full bg-terracotta text-white px-5 py-2.5 text-sm font-semibold hover:bg-terracotta-deep transition-colors w-full disabled:opacity-50"
        >
          {busy ? "Verifying…" : "Verify"}
        </button>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        <button
          type="button"
          onClick={signOut}
          className="text-sm text-muted hover:text-terracotta w-full text-center"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npm run build`. Full MFA flow can only be exercised once Task 1's migration runs against a live Supabase project and a staff account signs in — note as a deploy-time follow-up, same as Foundation's keep-alive workflow.

- [ ] **Step 4: Commit**

```bash
git add woodpecker-guesthouse/src/app/admin/security woodpecker-guesthouse/src/app/admin/verify
git commit -m "feat(woodpecker-guesthouse): add optional 2FA enrolment and verify pages"
```

---

### Task 7: Admin Shell (Layout, Sidebar, Dashboard)

**Files:**
- Create: `src/components/admin/AdminSidebar.tsx`
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`

**Interfaces:**
- Consumes: `createClient` (Task 2, server).

- [ ] **Step 1: Create `AdminSidebar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/rooms", label: "Rooms" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/security", label: "Security" },
];

export default function AdminSidebar({ email }: { email?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const signOut = async () => {
    await createClient().auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="w-56 shrink-0 border-r border-line bg-paper min-h-screen p-6 flex flex-col">
      <p className="font-display text-lg text-ink mb-1">Woodpecker</p>
      <p className="text-xs text-muted mb-8 truncate">{email}</p>
      <nav className="flex-1 space-y-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
              pathname === item.href ? "bg-terracotta text-white" : "text-ink hover:bg-surface"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <button
        onClick={signOut}
        className="text-sm text-muted hover:text-terracotta text-left px-3 py-2"
      >
        Sign out
      </button>
    </aside>
  );
}
```

- [ ] **Step 2: Create `admin/layout.tsx`**

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
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `admin/page.tsx`**

```tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const [{ count: roomCount }, { count: imageCount }] = await Promise.all([
    supabase.from("rooms").select("*", { count: "exact", head: true }),
    supabase.from("gallery_images").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-ink">Dashboard</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/admin/rooms" className="rounded-xl border border-line bg-white p-6 hover:shadow-md transition-shadow">
          <p className="text-3xl font-display text-ink">{roomCount ?? 0}</p>
          <p className="text-muted text-sm mt-1">Rooms</p>
        </Link>
        <Link href="/admin/gallery" className="rounded-xl border border-line bg-white p-6 hover:shadow-md transition-shadow">
          <p className="text-3xl font-display text-ink">{imageCount ?? 0}</p>
          <p className="text-muted text-sm mt-1">Gallery images</p>
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify**

Run: `npm run build`. In `npm run dev`, since there's no session, `/admin` redirects to `/admin/login` via `proxy.ts` — confirms the whole chain (Task 3 → Task 7) is wired correctly even without a live Supabase project yet.

- [ ] **Step 5: Commit**

```bash
git add woodpecker-guesthouse/src/components/admin/AdminSidebar.tsx woodpecker-guesthouse/src/app/admin/layout.tsx woodpecker-guesthouse/src/app/admin/page.tsx
git commit -m "feat(woodpecker-guesthouse): add admin shell (layout, sidebar, dashboard)"
```

---

### Task 8: Rooms Admin — Data Layer + Pages

**Files:**
- Create: `src/lib/admin/rooms.ts`
- Create: `src/app/admin/rooms/page.tsx`
- Create: `src/app/admin/rooms/[id]/page.tsx`

**Interfaces:**
- Consumes: `createClient` (Task 2, browser), `Room` type (Foundation `src/lib/types.ts`).
- Produces: `getAllRoomsAdmin(): Promise<Room[]>` (includes unpublished, unlike the public `getRooms()`), `updateRoom(id, patch: Partial<Room>): Promise<void>`.

- [ ] **Step 1: Create `src/lib/admin/rooms.ts`**

```ts
import { createClient } from "@/lib/supabase/client";
import type { Room } from "@/lib/types";

/** Admin read: ALL rooms including unpublished (RLS: is_staff() allows this;
 *  the public getRooms() in lib/rooms.ts only ever sees published: true). */
export async function getAllRoomsAdmin(): Promise<Room[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("rooms").select("*").order("sort_order", { ascending: true });
  if (error) {
    console.error("[admin/rooms] getAllRoomsAdmin failed:", error.message);
    return [];
  }
  return data as Room[];
}

export async function getRoomByIdAdmin(id: string): Promise<Room | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("rooms").select("*").eq("id", id).single();
  if (error || !data) return null;
  return data as Room;
}

export async function updateRoom(id: string, patch: Partial<Room>): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("rooms").update(patch).eq("id", id);
  return { error: error?.message ?? null };
}
```

- [ ] **Step 2: Create `admin/rooms/page.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllRoomsAdmin } from "@/lib/admin/rooms";
import type { Room } from "@/lib/types";

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllRoomsAdmin().then((r) => {
      setRooms(r);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-ink">Rooms</h1>
      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <div className="rounded-xl border border-line bg-white divide-y divide-line">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/admin/rooms/${room.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-surface transition-colors"
            >
              <div>
                <p className="text-ink font-medium">{room.name}</p>
                <p className="text-muted text-xs">{room.slug}</p>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  room.published ? "bg-olive/15 text-olive-deep" : "bg-sand/50 text-muted"
                }`}
              >
                {room.published ? "Published" : "Draft"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create `admin/rooms/[id]/page.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getRoomByIdAdmin, updateRoom } from "@/lib/admin/rooms";
import type { Room } from "@/lib/types";

export default function AdminRoomEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getRoomByIdAdmin(params.id).then(setRoom);
  }, [params.id]);

  if (!room) return <p className="text-muted">Loading…</p>;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    const { error: updateError } = await updateRoom(room.id, {
      name: room.name,
      description: room.description,
      bed_type: room.bed_type,
      bedrooms: room.bedrooms,
      bathrooms: room.bathrooms,
      max_guests: room.max_guests,
      rate_from: room.rate_from,
      hero_image: room.hero_image,
      published: room.published,
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
      <h1 className="font-display text-2xl text-ink">{room.name}</h1>
      <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-line bg-white p-6">
        <div>
          <label className="block text-sm text-ink mb-1">Name</label>
          <input
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
            value={room.name}
            onChange={(e) => setRoom({ ...room, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-ink mb-1">Description</label>
          <textarea
            rows={4}
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta resize-y"
            value={room.description}
            onChange={(e) => setRoom({ ...room, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-ink mb-1">Bed type</label>
            <input
              className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
              value={room.bed_type}
              onChange={(e) => setRoom({ ...room, bed_type: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-ink mb-1">Rate from (ZAR/night)</label>
            <input
              type="number"
              step="0.01"
              className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
              value={room.rate_from ?? ""}
              onChange={(e) => setRoom({ ...room, rate_from: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-ink mb-1">Bedrooms</label>
            <input
              type="number"
              className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
              value={room.bedrooms}
              onChange={(e) => setRoom({ ...room, bedrooms: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm text-ink mb-1">Bathrooms</label>
            <input
              type="number"
              className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
              value={room.bathrooms}
              onChange={(e) => setRoom({ ...room, bathrooms: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm text-ink mb-1">Max guests</label>
            <input
              type="number"
              className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
              value={room.max_guests}
              onChange={(e) => setRoom({ ...room, max_guests: Number(e.target.value) })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-ink mb-1">Hero image URL</label>
          <input
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
            placeholder="Uploaded via the Gallery admin, or paste a site-media URL"
            value={room.hero_image ?? ""}
            onChange={(e) => setRoom({ ...room, hero_image: e.target.value || null })}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
          <input
            type="checkbox"
            className="accent-terracotta"
            checked={room.published}
            onChange={(e) => setRoom({ ...room, published: e.target.checked })}
          />
          Published (visible on the public site)
        </label>

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

- [ ] **Step 4: Verify**

Run: `npm run build`. Full CRUD can only be exercised against a live Supabase project — note as a deploy-time follow-up, consistent with every other Supabase-dependent piece in this plan and Plan A.

- [ ] **Step 5: Commit**

```bash
git add woodpecker-guesthouse/src/lib/admin/rooms.ts woodpecker-guesthouse/src/app/admin/rooms
git commit -m "feat(woodpecker-guesthouse): add rooms admin CRUD"
```

---

### Task 9: Upload API Route

**Files:**
- Create: `src/app/api/admin/upload/route.ts`

**Interfaces:**
- Consumes: `createClient` (Task 2, server, for the auth check), `createAdminClient` (Task 2, service-role).
- Produces: `POST /api/admin/upload` (multipart form: `file`, `folder`) → `{ url: string }`. Consumed by Task 10's GalleryManager and reusable from the rooms editor for hero images.

- [ ] **Step 1: Write the route**

```ts
import sharp from "sharp";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "site-media";
const MAX_DIMENSION = 2400;

export async function POST(request: Request) {
  // Auth check with the RLS-aware server client — is_staff() gates this the
  // same way it gates table writes, even though Storage itself is bypassed
  // below via the service-role client.
  const supabase = await createClient();
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

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) || "misc";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  let body: File | Blob = file;
  let contentType = file.type || "application/octet-stream";
  let safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");

  if (contentType.startsWith("image/") && contentType !== "image/svg+xml") {
    const input = Buffer.from(await file.arrayBuffer());
    const optimized = await sharp(input)
      .rotate()
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    contentType = "image/webp";
    safeName = safeName.replace(/\.[^.]+$/, "") + ".webp";
    // Wrap in a Blob: a raw Node Buffer gets UTF-8 stringified (and corrupted)
    // by the fetch implementation in Vercel's production runtime. Confirmed
    // gotcha from mountaincreek-lodge — verified working with this fix.
    body = new Blob([optimized], { type: contentType });
  }

  const path = `${folder}/${Date.now()}-${safeName}`;
  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, body, {
    contentType,
    upsert: false,
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
```

- [ ] **Step 2: Add the `sharp` dependency**

Add to `package.json` dependencies: `"sharp": "^0.35.3"` (same version pinned on mountaincreek-lodge). Run: `npm install`.

- [ ] **Step 3: Verify**

Run: `npm run build`. Confirm `POST /api/admin/upload` with no session returns 401 (test with `curl -X POST http://localhost:3000/api/admin/upload` — no `file` field, no auth — expect 401 before the 400 "No file" check is even reached, since auth is checked first).

- [ ] **Step 4: Commit**

```bash
git add woodpecker-guesthouse/src/app/api/admin/upload/route.ts woodpecker-guesthouse/package.json woodpecker-guesthouse/package-lock.json
git commit -m "feat(woodpecker-guesthouse): add admin upload API route"
```

---

### Task 10: Gallery Admin

**Files:**
- Create: `src/lib/admin/gallery.ts`
- Create: `src/components/admin/GalleryManager.tsx`
- Create: `src/app/admin/gallery/page.tsx`

**Interfaces:**
- Consumes: `createClient` (Task 2, browser), `POST /api/admin/upload` (Task 9), `GalleryCategory`/`GalleryImage` types (Foundation).
- Ships all four pieces of the standing gallery-admin standard: multi-upload, auto-optimize (via the upload route), category delete (fallback to Uncategorized), bulk image delete.

- [ ] **Step 1: Create `src/lib/admin/gallery.ts`**

```ts
import { createClient } from "@/lib/supabase/client";
import type { GalleryCategory, GalleryImage } from "@/lib/types";

export async function getCategories(): Promise<GalleryCategory[]> {
  const supabase = createClient();
  const { data } = await supabase.from("gallery_categories").select("*").order("sort_order");
  return (data as GalleryCategory[]) ?? [];
}

export async function getImages(): Promise<GalleryImage[]> {
  const supabase = createClient();
  const { data } = await supabase.from("gallery_images").select("*").order("sort_order");
  return (data as GalleryImage[]) ?? [];
}

export async function addCategory(name: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("gallery_categories").insert({ name });
}

export async function updateCategory(id: string, name: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("gallery_categories").update({ name }).eq("id", id);
}

/** category_id → null on every image in this category (ON DELETE SET NULL on
 *  the FK already does this at the DB level; deleting explicitly here too
 *  keeps the in-memory UI state consistent without a full reload). */
export async function deleteCategory(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("gallery_categories").delete().eq("id", id);
}

export async function addImage(src: string, categoryId: string | null): Promise<void> {
  const supabase = createClient();
  await supabase.from("gallery_images").insert({ src, category_id: categoryId });
}

export async function updateImageCategory(id: string, categoryId: string | null): Promise<void> {
  const supabase = createClient();
  await supabase.from("gallery_images").update({ category_id: categoryId }).eq("id", id);
}

export async function deleteImage(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("gallery_images").delete().eq("id", id);
}

export async function uploadFiles(
  files: File[],
  folder: string
): Promise<{ urls: string[]; errors: string[] }> {
  const urls: string[] = [];
  const errors: string[] = [];
  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) errors.push(`${file.name}: ${data.error ?? "upload failed"}`);
    else urls.push(data.url);
  }
  return { urls, errors };
}
```

- [ ] **Step 2: Create `GalleryManager.tsx`**

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getImages,
  addImage,
  updateImageCategory,
  deleteImage,
  uploadFiles,
} from "@/lib/admin/gallery";
import type { GalleryCategory, GalleryImage } from "@/lib/types";

export default function GalleryManager() {
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [newImageCategoryId, setNewImageCategoryId] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [cats, imgs] = await Promise.all([getCategories(), getImages()]);
    setCategories(cats);
    setImages(imgs);
  }

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    await addCategory(name);
    setNewCategoryName("");
    await loadData();
  };

  const startEditingCategory = (cat: GalleryCategory) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleSaveCategoryEdit = async () => {
    const name = editingName.trim();
    if (!name || !editingId) return;
    await updateCategory(editingId, name);
    setEditingId(null);
    await loadData();
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Delete this category? Images move to Uncategorized.")) return;
    await deleteCategory(id);
    await loadData();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    setUploadError("");
    try {
      const { urls, errors } = await uploadFiles(files, "gallery");
      for (const url of urls) {
        await addImage(url, newImageCategoryId || null);
      }
      await loadData();
      if (errors.length > 0) setUploadError(errors.join("; "));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => setSelectedIds(new Set(filteredImages.map((img) => img.id)));
  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} image(s)?`)) return;
    await Promise.all(Array.from(selectedIds).map((id) => deleteImage(id)));
    setSelectedIds(new Set());
    await loadData();
  };

  const filteredImages =
    selectedFilter === "all" ? images : images.filter((img) => img.category_id === selectedFilter);

  return (
    <>
      <div className="rounded-xl border border-line bg-white p-6">
        <h2 className="font-display text-lg text-ink mb-4">Categories</h2>
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="New category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
            className="flex-1 rounded-lg border border-line px-4 py-2.5 text-sm outline-none focus:border-terracotta"
          />
          <button
            onClick={handleAddCategory}
            className="bg-terracotta text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-terracotta-deep transition-colors whitespace-nowrap"
          >
            + Add Category
          </button>
        </div>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 bg-surface rounded-lg px-4 py-2.5">
              {editingId === cat.id ? (
                <>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveCategoryEdit()}
                    className="flex-1 rounded border border-line px-3 py-1.5 text-sm outline-none focus:border-terracotta"
                    autoFocus
                  />
                  <button onClick={handleSaveCategoryEdit} className="text-terracotta hover:underline text-sm px-2">
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-muted hover:text-ink px-2 text-sm">
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span
                    className="flex-1 text-ink cursor-pointer select-none"
                    onClick={() => startEditingCategory(cat)}
                    title="Click to rename"
                  >
                    {cat.name}
                  </span>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-red-400 hover:text-red-600 px-3 transition-colors"
                    title="Delete category"
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-white p-6 mt-8">
        <h2 className="font-display text-lg text-ink mb-1">Images</h2>
        <p className="text-muted text-sm mb-6">{images.length} images</p>

        <div className="flex items-center gap-3 mb-4">
          <select
            value={newImageCategoryId}
            onChange={(e) => setNewImageCategoryId(e.target.value)}
            className="rounded-lg border border-line px-4 py-2.5 text-sm outline-none focus:border-terracotta"
          >
            <option value="">Uncategorized</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            className="text-sm text-muted file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:bg-terracotta file:text-white file:font-semibold file:text-sm file:cursor-pointer hover:file:bg-terracotta-deep disabled:opacity-60"
          />
          {uploading && <span className="text-muted text-xs">Uploading…</span>}
        </div>
        {uploadError && <p className="text-red-600 text-xs mb-4">{uploadError}</p>}

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              selectedFilter === "all" ? "bg-terracotta text-white border-terracotta" : "border-line text-muted"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedFilter(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                selectedFilter === cat.id ? "bg-terracotta text-white border-terracotta" : "border-line text-muted"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 mb-4">
          <button onClick={selectAllVisible} className="text-muted hover:text-ink text-xs font-semibold">
            Select All
          </button>
          {selectedIds.size > 0 && (
            <>
              <button onClick={clearSelection} className="text-muted hover:text-ink text-xs font-semibold">
                Clear ({selectedIds.size})
              </button>
              <button
                onClick={handleBulkDelete}
                className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors"
              >
                Delete Selected ({selectedIds.size})
              </button>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredImages.map((image) => {
            const selected = selectedIds.has(image.id);
            return (
              <div
                key={image.id}
                className={`relative aspect-square rounded-lg overflow-hidden border ${
                  selected ? "border-terracotta ring-2 ring-terracotta" : "border-line"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.src} alt={image.alt} className="absolute inset-0 w-full h-full object-cover" />
                <label className="absolute top-2 left-2 w-7 h-7 flex items-center justify-center bg-black/60 rounded-full cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleSelect(image.id)}
                    className="w-4 h-4 accent-terracotta"
                  />
                </label>
                <button
                  onClick={async () => {
                    await deleteImage(image.id);
                    await loadData();
                  }}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors"
                >
                  ✕
                </button>
                <div className="absolute bottom-2 left-2 right-2">
                  <select
                    value={image.category_id ?? ""}
                    onChange={async (e) => {
                      await updateImageCategory(image.id, e.target.value || null);
                      await loadData();
                    }}
                    className="w-full bg-black/60 border-0 text-white text-xs px-2 py-1 rounded"
                  >
                    <option value="">Uncategorized</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Create `admin/gallery/page.tsx`**

```tsx
import GalleryManager from "@/components/admin/GalleryManager";

export default function AdminGalleryPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-ink">Gallery</h1>
      <GalleryManager />
    </div>
  );
}
```

- [ ] **Step 4: Verify**

Run: `npm run build`. Full upload/CRUD flow needs a live Supabase project + storage bucket (Task 1) — note as a deploy-time follow-up. Per the standing rule, re-verify the upload path against the **production** deploy specifically (not just localhost) once live, since the Buffer/Blob corruption bug is invisible in dev.

- [ ] **Step 5: Commit**

```bash
git add woodpecker-guesthouse/src/lib/admin/gallery.ts woodpecker-guesthouse/src/components/admin/GalleryManager.tsx woodpecker-guesthouse/src/app/admin/gallery
git commit -m "feat(woodpecker-guesthouse): add gallery admin (multi-upload, optimize, category/bulk delete)"
```

---

### Task 11: ISR on Public Pages + README Updates

Foundation's data-driven public pages (`/`, `/accommodation`, `/accommodation/[slug]`, `/gallery`) have no `revalidate` export, so once deployed they're fully static — generated once at build time and never refreshed until the next redeploy. Without this, every admin edit in Tasks 8 and 10 would be invisible on the live site until the next `git push`. This wasn't caught in Plan A because Plan A had no writer to make the gap observable.

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/accommodation/page.tsx`
- Modify: `src/app/accommodation/[slug]/page.tsx`
- Modify: `src/app/gallery/page.tsx`
- Modify: `README.md`

- [ ] **Step 1: Add `export const revalidate = 60;` to each of the four pages**

Add this line directly under the existing imports (before the `metadata` export) in each file:

```ts
export const revalidate = 60; // ISR: admin edits go live within a minute, no redeploy needed
```

- [ ] **Step 2: Update `README.md`** — add a new section after "Deploy"

```md
## Admin panel

`/admin` — staff sign-in (Supabase Auth), rooms CRUD, gallery manager (multi-upload with auto-optimize).

- **First admin account:** create the user via the Supabase dashboard (Authentication → Users → Invite), then run
  `update public.profiles set role = 'admin' where email = '...';` in the SQL editor. Every other invited account
  defaults to `role = 'staff'`, which is enough to sign in and edit content.
- **Optional 2FA:** staff can enable TOTP at `/admin/security`. Not required unless you want to make it mandatory later.
- **Public pages use ISR** (`revalidate = 60`) — admin edits appear on the live site within about a minute, no
  redeploy required.
```

- [ ] **Step 3: Verify**

Run: `npm run build` — confirm the four routes still build and are now marked with a revalidate interval (Next prints `(ISR)` next to routes using `revalidate`, not `(Static)`, in the build output).

- [ ] **Step 4: Commit**

```bash
git add woodpecker-guesthouse/src/app/page.tsx woodpecker-guesthouse/src/app/accommodation/page.tsx "woodpecker-guesthouse/src/app/accommodation/[slug]/page.tsx" woodpecker-guesthouse/src/app/gallery/page.tsx woodpecker-guesthouse/README.md
git commit -m "fix(woodpecker-guesthouse): add ISR to public pages so admin edits go live"
```

---

## Plan Self-Review Notes

- **Spec coverage:** §6 (Admin & Content Management) → Tasks 1–10 cover every listed piece: staff login with all 4 standard requirements (Task 4/5/6), rooms admin (Task 8), gallery admin with all 4 standard requirements (Task 10 — multi-upload ✓, auto-optimize ✓ via Task 9's sharp pipeline, category delete ✓, bulk delete ✓).
- **Placeholder scan:** none — the only "TODO"-flavoured item is the intentionally-deferred live-Supabase verification, disclosed per task, matching Plan A's pattern for the same underlying gap (no Supabase project provisioned yet).
- **Type consistency:** `Room`/`GalleryCategory`/`GalleryImage` types are Foundation's (`src/lib/types.ts`), unchanged — admin functions consume the same shapes the public site already renders, so there's no drift between what staff edit and what the public site reads.
- **Blog nav link** (Header, Foundation Task 5) still points to `/blog`, which 404s until Plan C — unchanged from Plan A, not this plan's concern.
