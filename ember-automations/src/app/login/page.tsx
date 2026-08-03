"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { browserClient } from "@/lib/supabaseBrowser";
import PasswordInput from "@/components/PasswordInput";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);

    const supabase = browserClient(keepSignedIn);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }

    // Password gets us to aal1. If a TOTP factor exists we must still pass it.
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    setBusy(false);
    if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
      router.push("/login/mfa");
    } else {
      router.push("/admin");
    }
  };

  const sendMagicLink = async () => {
    setErr(null);
    if (!email) { setErr("Enter your email first."); return; }
    setBusy(true);
    const { error } = await browserClient(keepSignedIn).auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/admin` },
    });
    setBusy(false);
    if (error) setErr(error.message);
    else setLinkSent(true);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={signIn} className="glass p-8 w-full max-w-sm space-y-4">
        <div>
          <p className="uppercase tracking-widest text-xs text-ember-500 font-semibold">
            Ember Automations
          </p>
          <h1 className="text-xl font-bold mt-1">Admin sign-in</h1>
        </div>

        {linkSent ? (
          <p className="text-[#6b6b8a]">Check your email for the sign-in link.</p>
        ) : (
          <>
            <input
              className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 text-[#e2e2f0]"
              type="email"
              placeholder="you@email.com"
              autoComplete="username"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <PasswordInput value={password} onChange={setPassword} />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-[#6b6b8a] cursor-pointer">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={e => setKeepSignedIn(e.target.checked)}
                />
                Keep me signed in
              </label>
              <a href="/forgot-password" className="text-ember-500 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="bg-ember-500 hover:bg-ember-600 text-[#0a0a0f] font-semibold px-4 py-2 rounded-lg w-full disabled:opacity-50"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>

            <div className="pt-2 border-t border-[#2a2a3d]">
              <button
                type="button"
                onClick={sendMagicLink}
                disabled={busy}
                className="text-sm text-[#6b6b8a] hover:text-ember-500 w-full text-center disabled:opacity-50"
              >
                or email me a sign-in link
              </button>
            </div>
          </>
        )}

        {err && <p className="text-ember-500 text-sm">{err}</p>}
      </form>
    </main>
  );
}
