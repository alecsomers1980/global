"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** Second factor at sign-in: enter the 6-digit TOTP code. proxy.ts sends staff
 *  here whenever they have 2FA enabled but haven't cleared it this session. */
export default function AdminVerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const supabase = createClient();

    const factors = await supabase.auth.mfa.listFactors();
    if (factors.error) {
      setError(factors.error.message);
      setBusy(false);
      return;
    }
    const totp = factors.data.totp[0];
    if (!totp) {
      setError("No authenticator is set up on this account.");
      setBusy(false);
      return;
    }

    const challenge = await supabase.auth.mfa.challenge({ factorId: totp.id });
    if (challenge.error) {
      setError(challenge.error.message);
      setBusy(false);
      return;
    }

    const verify = await supabase.auth.mfa.verify({
      factorId: totp.id,
      challengeId: challenge.data.id,
      code: code.trim(),
    });
    setBusy(false);
    if (verify.error) {
      setError(verify.error.message);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  const signOut = async () => {
    await createClient().auth.signOut();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="bg-paper border border-line rounded-2xl p-8 w-full max-w-sm shadow-sm space-y-4"
      >
        <h1 className="text-lg font-semibold text-ink">Two-factor verification</h1>
        <p className="text-sm text-muted">
          Enter the 6-digit code from your authenticator app.
        </p>
        <input
          className="rounded-xl border border-line bg-white px-4 py-3 text-center text-2xl tracking-[0.4em] text-ink w-full outline-none focus:border-forest"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        />
        <button
          type="submit"
          disabled={busy || code.length !== 6}
          className="rounded-full bg-forest text-white px-5 py-2.5 text-sm font-semibold hover:bg-moss transition-colors w-full disabled:opacity-50"
        >
          {busy ? "Verifying…" : "Verify"}
        </button>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
        <button
          type="button"
          onClick={signOut}
          className="text-sm text-muted hover:text-forest w-full text-center"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
