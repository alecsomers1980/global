"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/admin/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } finally {
      setSubmitting(false);
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-white text-3xl font-serif mb-2">
            Mountain Creek Lodge
          </h1>
          <p className="text-white/40 text-sm tracking-wider uppercase">
            Reset Admin Password
          </p>
        </div>

        <div className="bg-[#1a1d27] p-8 rounded-xl border border-white/5">
          {sent ? (
            <p className="text-white/70 text-sm text-center">
              If that email matches our admin account, a reset link is on its
              way. Check your inbox.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg mb-4 focus:outline-none focus:border-[#C07750] transition-colors"
                placeholder="you@example.com"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#C07750] text-white py-3 rounded-lg font-semibold tracking-wider text-sm hover:bg-[#a8654a] transition-colors disabled:opacity-60"
              >
                {submitting ? "SENDING…" : "SEND RESET LINK"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-6">
          <Link href="/admin" className="text-white/40 hover:text-white/70 text-sm transition-colors">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
