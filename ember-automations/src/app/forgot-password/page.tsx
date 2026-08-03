"use client";
import { useState } from "react";
import { browserClient } from "@/lib/supabaseBrowser";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const { error } = await browserClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password`,
    });
    setBusy(false);
    // Don't reveal whether the address exists — always show the same result.
    if (error && !/rate/i.test(error.message)) setErr(error.message);
    else setSent(true);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={submit} className="glass p-8 w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold">Reset your password</h1>
        {sent ? (
          <p className="text-[#6b6b8a]">
            If that email has an account, a reset link is on its way. The link expires shortly —
            open it on this device.
          </p>
        ) : (
          <>
            <p className="text-[#6b6b8a] text-sm">
              We&apos;ll email you a link to set a new password.
            </p>
            <input
              className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-[#e2e2f0]"
              type="email"
              placeholder="you@email.com"
              autoComplete="username"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button
              type="submit"
              disabled={busy}
              className="bg-ember-500 text-[#0a0a0f] font-semibold px-4 py-2 rounded-lg w-full disabled:opacity-50"
            >
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </>
        )}
        {err && <p className="text-ember-500 text-sm">{err}</p>}
        <a href="/login" className="block text-sm text-[#6b6b8a] hover:text-ember-500 text-center">
          Back to sign in
        </a>
      </form>
    </main>
  );
}
