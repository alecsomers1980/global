"use client";
import { useEffect, useRef, useState } from "react";
import { browserClient } from "@/lib/supabaseBrowser";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [next, setNext] = useState("/admin");
  const [connected, setConnected] = useState(false);
  const supabaseRef = useRef<ReturnType<typeof browserClient> | null>(null);

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

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    const supabase = supabaseRef.current;
    if (!supabase) return;

    setErr(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/login?next=${encodeURIComponent(next)}` },
    });
    if (error) setErr(error.message);
    else setSent(true);
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
        {sent ? (
          <p className="text-[#6b6b8a]">Check your email for the sign-in link.</p>
        ) : (
          <>
            <input
              className="w-full bg-dark-500 border border-[#2a2a3d] rounded-lg px-3 py-2 mb-3"
              placeholder="you@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button
              className="bg-ember-500 text-[#0a0a0f] font-semibold px-4 py-2 rounded-lg w-full"
              onClick={signIn}
            >
              Send magic link
            </button>
            {err && <p className="text-ember-500 text-sm mt-3">{err}</p>}
          </>
        )}
      </div>
    </main>
  );
}

