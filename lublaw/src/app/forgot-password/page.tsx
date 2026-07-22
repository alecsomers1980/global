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
