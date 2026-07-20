"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/auth/PasswordInput";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // If a session exists, they are signed in immediately (no email confirmation)
      if (data.session) {
        router.push("/account");
        router.refresh();
      } else {
        // Email confirmation required
        setSuccess(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-6 py-16">
        <div className="bg-paper border border-line rounded-2xl p-8 shadow-sm text-center">
          <h1 className="text-2xl font-serif text-ink mb-4">Create your account</h1>
          <p className="text-muted mb-6">
            Check your email to confirm your account.
          </p>
          <Link
            href="/login"
            className="text-forest hover:underline text-sm font-medium"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="bg-paper border border-line rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-serif text-ink mb-6">Create your account</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="fullName" className="block text-sm text-ink mb-1">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-ink mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-ink mb-1">
              Password
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
            />
          </div>

          <div className="flex items-start gap-3">
            <input
              id="marketingOptIn"
              type="checkbox"
              checked={marketingOptIn}
              onChange={(e) => setMarketingOptIn(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-line text-forest focus:ring-forest"
            />
            <label htmlFor="marketingOptIn" className="text-sm text-ink">
              Email me occasional offers
            </label>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-forest text-white px-5 py-2.5 text-sm font-semibold hover:bg-moss transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-forest hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
