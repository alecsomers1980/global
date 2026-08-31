"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { getBrowserClient } from "@/lib/supabase/browser";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // The returned error is deliberately ignored. Supabase reports whether an
      // address exists, and surfacing that here would turn this form into a way
      // to test which of your customers' emails are registered.
      await getBrowserClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/account/reset-password`,
      });
      setSubmitted(true);
    } catch {
      setError("We could not send that just now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[440px] px-6 py-20">
        <h1 className="font-display text-4xl text-ink">Reset your password</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
          Give us the email you signed up with and we will send you a link.
        </p>

        {submitted ? (
          <div className="mt-8 border-l-2 border-brand bg-surface p-4 text-[15px] text-ink-soft">
            If that address has an account with us, a reset link is on its way.
          </div>
        ) : (
          <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit}>
            {error && (
              <p role="alert" className="border-l-2 border-red-700 bg-red-50 p-3 text-[14px] text-red-800">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-[13px] uppercase tracking-[0.08em] text-ink-mute">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-[48px] border border-hairline bg-white px-4 text-[15px] text-ink focus:border-brand focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-[54px] w-full items-center justify-center bg-brand px-10 text-sm uppercase tracking-[0.06em] text-brand-ink hover:bg-brand-deep disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-6">
          <Link href="/account/login" className="text-[14px] text-ink-soft underline hover:text-brand">
            Back to sign in
          </Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
