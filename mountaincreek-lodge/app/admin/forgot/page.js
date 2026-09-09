"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/components/admin/ui/Card";
import Button from "@/components/admin/ui/Button";
import FieldLabel from "@/components/admin/ui/FieldLabel";
import TextInput from "@/components/admin/ui/TextInput";

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

        <Card>
          {sent ? (
            <p className="text-white/70 text-sm text-center">
              If that email matches our admin account, a reset link is on its
              way. Check your inbox.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <FieldLabel>Admin Email</FieldLabel>
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                className="mb-4"
                placeholder="you@example.com"
              />
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "SENDING…" : "SEND RESET LINK"}
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center mt-6">
          <Link href="/admin" className="text-white/40 hover:text-white/70 text-sm transition-colors">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
