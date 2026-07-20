"use client";
import { useState } from "react";
import { browserClient } from "@/lib/supabaseBrowser";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const signIn = async () => {
    setErr(null);
    const { error } = await browserClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/admin` },
    });
    if (error) setErr(error.message);
    else setSent(true);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="glass p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4">Admin sign-in</h1>
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
