"use client";
import { useState, useEffect } from "react";
import { browserClient } from "@/lib/supabaseBrowser";
import PasswordInput from "@/components/PasswordInput";

export default function ResetPassword() {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Supabase turns the recovery link into a session on load; wait for it.
  useEffect(() => {
    const supabase = browserClient();
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (pw.length < 10) { setErr("Use at least 10 characters."); return; }
    if (pw !== pw2) { setErr("Passwords don't match."); return; }
    setBusy(true);
    const { error } = await browserClient().auth.updateUser({ password: pw });
    setBusy(false);
    if (error) setErr(error.message);
    else setDone(true);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={submit} className="glass p-8 w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold">Set a new password</h1>

        {done ? (
          <>
            <p className="text-[#6b6b8a]">Password updated.</p>
            <a
              href="/login"
              className="bg-ember-500 text-[#0a0a0f] font-semibold px-4 py-2 rounded-lg w-full block text-center"
            >
              Sign in
            </a>
          </>
        ) : !ready ? (
          <p className="text-[#6b6b8a]">
            Open this page from the reset link in your email. If you got here directly,
            request a new link.
          </p>
        ) : (
          <>
            <PasswordInput
              value={pw}
              onChange={setPw}
              placeholder="New password"
              autoComplete="new-password"
            />
            <PasswordInput
              value={pw2}
              onChange={setPw2}
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
            <p className="text-xs text-[#6b6b8a]">At least 10 characters.</p>
            <button
              type="submit"
              disabled={busy}
              className="bg-ember-500 text-[#0a0a0f] font-semibold px-4 py-2 rounded-lg w-full disabled:opacity-50"
            >
              {busy ? "Saving…" : "Update password"}
            </button>
          </>
        )}
        {err && <p className="text-ember-500 text-sm">{err}</p>}
      </form>
    </main>
  );
}
