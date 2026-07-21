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

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Password gets us to aal1. If this account has a TOTP factor we must still
    // pass it before the admin area will let us in (proxy.ts enforces this too).
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
        <h1 className="text-xl font-semibold text-ink text-center">
          Diana&apos;s Bulbinella
        </h1>
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
              className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
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
                className="accent-forest"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
              />
              Keep me signed in
            </label>
            <Link href="/forgot-password" className="text-forest hover:underline">
              Forgot password?
            </Link>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-forest text-white px-5 py-2.5 text-sm font-semibold hover:bg-moss transition-colors w-full disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
