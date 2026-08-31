"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";
import { Header } from "@/components/layout/Header";
import { PageBanner } from "@/components/layout/PageBanner";
import { Footer } from "@/components/layout/Footer";
import { PasswordInput } from "@/components/form/PasswordInput";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const remember = formData.get("remember") === "on";

    try {
      // Constructed here, never during render — it throws when env is unset.
      const { error } = await getBrowserClient().auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setBusy(false);
        return;
      }

      // supabase-js persists the session to localStorage regardless, so this
      // flag is what a sign-out-on-close hook would read. Nothing more.
      if (remember) {
        window.sessionStorage.removeItem("reh-session-only");
      } else {
        window.sessionStorage.setItem("reh-session-only", "1");
      }

      router.push("/account/orders");
      router.refresh();
    } catch {
      setError("We could not sign you in just now. Please try again.");
      setBusy(false);
    }
  }

  return (
    <>
      <Header />
      <PageBanner eyebrow="Your account" title="Welcome back" />
      <main className="mx-auto w-full max-w-[440px] px-6 py-16">

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-[13px] uppercase tracking-[0.08em] text-ink-mute">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="min-h-[48px] border border-hairline bg-white px-4 text-[15px] text-ink focus:border-brand focus:outline-none"
            />
          </div>

          <PasswordInput
            id="password"
            name="password"
            label="Password"
            autoComplete="current-password"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-[14px] text-ink-soft">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                defaultChecked
                className="h-4 w-4"
              />
              Keep me signed in
            </label>
            <Link
              href="/account/forgot-password"
              className="text-[14px] text-ink-soft underline hover:text-brand"
            >
              Forgot your password?
            </Link>
          </div>

          {error && (
            <div role="alert" className="border-l-2 border-red-700 bg-red-50 p-3 text-[14px] text-red-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex min-h-[54px] w-full items-center justify-center bg-brand px-10 text-sm uppercase tracking-[0.06em] text-brand-ink hover:bg-brand-deep disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-[14px] text-ink-soft">
          New here?{" "}
          <Link href="/account/signup" className="text-ink-soft underline hover:text-brand">
            Create an account
          </Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
