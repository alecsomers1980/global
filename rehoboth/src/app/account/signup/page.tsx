"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";
import { Header } from "@/components/layout/Header";
import { PageBanner } from "@/components/layout/PageBanner";
import { Footer } from "@/components/layout/Footer";
import { PasswordInput } from "@/components/form/PasswordInput";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const { error } = await getBrowserClient().auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/account/login`,
        },
      });

      if (error) {
        setError(error.message);
        setBusy(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("We could not create your account just now. Please try again.");
      setBusy(false);
    }
  }

  return (
    <>
      <Header />
      <PageBanner eyebrow="Your account" title="Create an account" />
      <main className="mx-auto w-full max-w-[440px] px-6 py-16">
        <p className=" text-[15px] leading-relaxed text-ink-soft">
          An account is optional — you are welcome to check out as a guest — but it
          keeps your order history in one place.
        </p>

        {success ? (
          <div className="mt-8 border-l-2 border-brand bg-surface p-4 text-[15px] text-ink-soft">
            Thank you. Check your email and confirm your address, then you can sign
            in.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-[13px] uppercase tracking-[0.08em] text-ink-mute">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="min-h-[48px] border border-hairline bg-white px-4 text-[15px] text-ink focus:border-brand focus:outline-none"
              />
            </div>

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
              autoComplete="new-password"
            />

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
              {busy ? "Creating…" : "Create account"}
            </button>
          </form>
        )}

        <p className="mt-6 text-[14px] text-ink-soft">
          Already have an account?{" "}
          <Link href="/account/login" className="text-ink-soft underline hover:text-brand">
            Sign in
          </Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
