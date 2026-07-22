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
