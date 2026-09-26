"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { browserClient } from "@/lib/supabaseBrowser";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [checked, setChecked] = useState(false);
  const clientRef = useRef<ReturnType<typeof browserClient> | null>(null);

  useEffect(() => {
    const supabase = browserClient();
    clientRef.current = supabase;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      }
      setChecked(true);
    }).catch(() => {
      setChecked(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password.length < 10) {
      setErr("Use at least 10 characters.");
      return;
    }
    if (password !== confirm) {
      setErr("The two passwords do not match.");
      return;
    }
    setErr(null);
    setBusy(true);

    const supabase = clientRef.current;
    if (!supabase) {
      setErr("Client not initialized.");
      setBusy(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErr(error.message);
      setBusy(false);
    } else {
      setDone(true);
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="glass p-8 w-full max-w-sm">
        {done ? (
          <>
            <h1 className="text-xl font-bold mb-4">Password updated</h1>
            <p className="text-[#6b6b8a] mb-4">You can use it to sign in now.</p>
            <a
              href="/admin"
              className="bg-ember-500 text-[#0a0a0f] font-semibold px-4 py-2 rounded-lg w-full block text-center"
            >
              Go to the admin
            </a>
          </>
        ) : ready ? (
          <>
            <h1 className="text-xl font-bold mb-4">Set a new password</h1>
            <form onSubmit={handleSubmit}>
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 mb-3"
                required
              />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 mb-3"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-sm text-[#6b6b8a] underline mb-3"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
              <p className="text-[#6b6b8a] text-sm mb-4">At least 10 characters.</p>
              {err && <p className="text-ember-500 text-sm mt-3">{err}</p>}
              <button
                type="submit"
                disabled={busy}
                className="bg-ember-500 text-[#0a0a0f] font-semibold px-4 py-2 rounded-lg w-full"
              >
                {busy ? "Saving…" : "Save password"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold mb-4">Set a new password</h1>
            <p className="text-[#6b6b8a]">Checking your link…</p>
            {checked && (
              <p className="text-[#6b6b8a] text-sm mt-3">
                If this does not move on, the link may have expired &mdash; request a new one from the sign-in page.
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}

