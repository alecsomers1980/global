"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabaseBrowser";

export default function MfaChallenge() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const supabase = browserClient();

    const factors = await supabase.auth.mfa.listFactors();
    if (factors.error) { setErr(factors.error.message); setBusy(false); return; }

    const totp = factors.data.totp[0];
    if (!totp) { setErr("No authenticator is set up on this account."); setBusy(false); return; }

    const challenge = await supabase.auth.mfa.challenge({ factorId: totp.id });
    if (challenge.error) { setErr(challenge.error.message); setBusy(false); return; }

    const verify = await supabase.auth.mfa.verify({
      factorId: totp.id,
      challengeId: challenge.data.id,
      code: code.trim(),
    });
    setBusy(false);
    if (verify.error) { setErr(verify.error.message); return; }

    router.push("/admin");
    router.refresh();
  };

  const signOut = async () => {
    await browserClient().auth.signOut();
    router.push("/login");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={submit} className="glass p-8 w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold">Two-factor verification</h1>
        <p className="text-[#6b6b8a] text-sm">
          Enter the 6-digit code from your authenticator app.
        </p>
        <input
          className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-center text-2xl tracking-[0.4em] text-[#e2e2f0]"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
        />
        <button
          type="submit"
          disabled={busy || code.length !== 6}
          className="bg-ember-500 text-[#0a0a0f] font-semibold px-4 py-2 rounded-lg w-full disabled:opacity-50"
        >
          {busy ? "Verifying…" : "Verify"}
        </button>
        {err && <p className="text-ember-500 text-sm">{err}</p>}
        <button
          type="button"
          onClick={signOut}
          className="text-sm text-[#6b6b8a] hover:text-ember-500 w-full text-center"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
