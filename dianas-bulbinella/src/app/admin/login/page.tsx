"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
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
              className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-ink mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-forest text-white px-5 py-2.5 text-sm font-semibold hover:bg-moss transition-colors w-full"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
