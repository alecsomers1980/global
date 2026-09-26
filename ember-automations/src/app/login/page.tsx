"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { browserClient, shortenAuthCookies } from "@/lib/supabaseBrowser";
import { SHORT_SESSION_COOKIE, SHORT_SESSION_SECONDS } from "@/lib/admin";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [mode, setMode] = useState<"password" | "link">("password");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [next, setNext] = useState("/admin");
  const [connected, setConnected] = useState(false);
  const supabaseRef = useRef<ReturnType<typeof browserClient> | null>(null);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextParam = params.get("next");
    let resolvedNext = "/admin";
    if (nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")) {
      resolvedNext = nextParam;
    }
    const hasExplicitNext = Boolean(
      nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//"),
    );
    setNext(resolvedNext);

    const supabase = browserClient();
    supabaseRef.current = supabase;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return;

      if (event === "SIGNED_IN" && session) {
        if (hasExplicitNext || session.user.app_metadata?.role !== "client") {
          window.location.assign(resolvedNext);
        } else {
          setConnected(true);
        }
      }
    });

    subscriptionRef.current = subscription;
    return () => subscription.unsubscribe();
  }, []);

  function client() {
    return browserClient();
  }

  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    setNotice(null);
    setBusy(true);
    try {
      // The listener was registered with a default, long-lived client; leaving it
      // attached lets it re-persist the session and undo the shorter cookie that
      // "keep me signed in" unticked asks for. Stand it down and redirect here.
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;

      // The middleware reads this on every request and keeps the session short.
      document.cookie = keepSignedIn
        ? `${SHORT_SESSION_COOKIE}=; path=/; max-age=0`
        : `${SHORT_SESSION_COOKIE}=1; path=/; max-age=${SHORT_SESSION_SECONDS}`;

      const supabase = client();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setErr(error.message);
      } else {
        if (!keepSignedIn) shortenAuthCookies(SHORT_SESSION_SECONDS);
        window.location.assign(next);
        return;
      }
    } finally {
      setBusy(false);
    }
  };

  const sendMagicLink = async () => {
    setErr(null);
    setNotice(null);
    setBusy(true);
    try {
      const supabase = client();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${location.origin}/login?next=${encodeURIComponent(next)}` },
      });
      if (error) setErr(error.message);
      else setSent(true);
    } finally {
      setBusy(false);
    }
  };

  const forgotPassword = async () => {
    setErr(null);
    setNotice(null);
    if (!email) {
      setErr("Enter your email address first, then press Forgot password.");
      return;
    }
    const supabase = client();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/reset`,
    });
    if (error) setErr(error.message);
    else setNotice("Check your email for a link to set a new password.");
  };

  if (connected) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="glass p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold mb-4">You&rsquo;re signed in</h1>
          <p className="text-[#6b6b8a]">Go back to Claude and finish adding the Ember connector. If you weren&rsquo;t adding a connector, you can close this tab.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="glass p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4">Sign in</h1>

        {mode === "password" ? (
          <>
            <form onSubmit={handlePasswordSubmit}>
              <input
                className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 mb-3"
                type="email"
                autoComplete="email"
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <div className="relative mb-3">
                <input
                  className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 pr-16"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#6b6b8a] underline"
                  onClick={() => setShowPassword(prev => !prev)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <label className="flex items-center gap-2 text-sm text-[#6b6b8a]">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={e => setKeepSignedIn(e.target.checked)}
                  className="accent-ember-500"
                />
                Keep me signed in
              </label>
              <p className="text-xs text-[#6b6b8a] mt-1 mb-3">
                Unticked, you&rsquo;ll be signed out after 8 hours.
              </p>
              <button
                type="submit"
                className="bg-ember-500 text-[#0a0a0f] font-semibold px-4 py-2 rounded-lg w-full disabled:opacity-60"
                disabled={busy}
              >
                {busy ? "Signing in…" : "Sign in"}
              </button>
              <button
                type="button"
                className="text-sm text-[#6b6b8a] underline mt-3"
                onClick={forgotPassword}
              >
                Forgot password?
              </button>
              {err && <p className="text-ember-500 text-sm mt-3">{err}</p>}
              {notice && <p className="text-[#6b6b8a] text-sm mt-3">{notice}</p>}
            </form>
            <button
              type="button"
              className="text-sm text-[#6b6b8a] underline mt-4"
              onClick={() => {
                setMode("link");
                setErr(null);
                setNotice(null);
                setSent(false);
              }}
            >
              Email me a sign-in link instead
            </button>
          </>
        ) : (
          <>
            {sent ? (
              <p className="text-[#6b6b8a]">Check your email for the sign-in link.</p>
            ) : (
              <>
                <input
                  className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 mb-3"
                  type="email"
                  autoComplete="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <button
                  type="button"
                  className="bg-ember-500 text-[#0a0a0f] font-semibold px-4 py-2 rounded-lg w-full disabled:opacity-60"
                  onClick={sendMagicLink}
                  disabled={busy}
                >
                  {busy ? "Sending…" : "Send magic link"}
                </button>
              </>
            )}
            {err && <p className="text-ember-500 text-sm mt-3">{err}</p>}
            {notice && <p className="text-[#6b6b8a] text-sm mt-3">{notice}</p>}
            <button
              type="button"
              className="text-sm text-[#6b6b8a] underline mt-4"
              onClick={() => {
                setMode("password");
                setErr(null);
                setNotice(null);
                setSent(false);
              }}
            >
              Use a password instead
            </button>
          </>
        )}
      </div>
    </main>
  );
}

