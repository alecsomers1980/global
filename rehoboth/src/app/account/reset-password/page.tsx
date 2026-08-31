"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { getBrowserClient } from "@/lib/supabase/browser";
import { Header } from "@/components/layout/Header";
import { PageBanner } from "@/components/layout/PageBanner";
import { Footer } from "@/components/layout/Footer";
import { PasswordInput } from "@/components/form/PasswordInput";

/**
 * Where the emailed reset link lands.
 *
 * Supabase puts the recovery token in the URL fragment and supabase-js consumes
 * it to open a short-lived session. The listener and the getSession() call are
 * both needed: the PASSWORD_RECOVERY event can fire before the listener
 * attaches, and then only getSession() sees it.
 */
export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;

    (async () => {
      try {
        const supabase = getBrowserClient();
        const {
          data: { subscription: sub },
        } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "PASSWORD_RECOVERY" || session) setReady(true);
        });
        subscription = sub;

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) setReady(true);
      } catch {
        setError("We could not check that reset link. Please request a new one.");
      }
    })();

    return () => subscription?.unsubscribe();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");

    if (password !== confirm) {
      setError("Those passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Please use at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await getBrowserClient().auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setSubmitted(true);
    } catch {
      setError("We could not change your password just now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <PageBanner eyebrow="Your account" title="Choose a new password" />
      <main className="mx-auto w-full max-w-[440px] px-6 py-16">
        {!ready && !error ? (
          <div className="border-l-2 border-brand bg-surface p-4 text-[15px] text-ink-soft">
            Checking your reset link…
          </div>
        ) : error && !ready ? (
          <p role="alert" className="border-l-2 border-red-700 bg-red-50 p-3 text-[14px] text-red-800">
            {error}
          </p>
        ) : submitted ? (
          <div className="border-l-2 border-brand bg-surface p-4 text-[15px] text-ink-soft">
            Your password is changed.{" "}
            <Link href="/account/login" className="text-ink-soft underline hover:text-brand">
              Sign in
            </Link>
          </div>
        ) : (
          <>
            <form className=" flex flex-col gap-5" onSubmit={handleSubmit}>
              {error && (
                <p role="alert" className="border-l-2 border-red-700 bg-red-50 p-3 text-[14px] text-red-800">
                  {error}
                </p>
              )}

              <PasswordInput id="password" name="password" label="New password" autoComplete="new-password" />
              <PasswordInput id="confirm" name="confirm" label="Confirm new password" autoComplete="new-password" />

              <button
                type="submit"
                disabled={loading}
                className="flex min-h-[54px] w-full items-center justify-center bg-brand px-10 text-sm uppercase tracking-[0.06em] text-brand-ink hover:bg-brand-deep disabled:opacity-60"
              >
                {loading ? "Saving…" : "Save new password"}
              </button>
            </form>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
