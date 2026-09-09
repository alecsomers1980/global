"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Card from "@/components/admin/ui/Card";
import Button from "@/components/admin/ui/Button";
import FieldLabel from "@/components/admin/ui/FieldLabel";
import TextInput from "@/components/admin/ui/TextInput";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <p className="text-red-400 text-sm text-center">
        This reset link is missing its token. Please request a new one.
      </p>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <p className="text-white/70 text-sm mb-6">
          Your password has been updated.
        </p>
        <Link
          href="/admin"
          className="inline-block bg-[#C07750] text-white px-8 py-3 rounded-lg font-semibold tracking-wider text-sm hover:bg-[#a8654a] transition-colors"
        >
          SIGN IN
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldLabel>New Password</FieldLabel>
      <div className="relative mb-4">
        <TextInput
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          className="pr-16"
        />
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          className="absolute inset-y-0 right-0 px-4 text-white/40 hover:text-white/70 text-xs uppercase tracking-wider transition-colors"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      <FieldLabel>Confirm New Password</FieldLabel>
      <TextInput
        type={showPassword ? "text" : "password"}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        autoComplete="new-password"
        className="mb-4"
      />

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "UPDATING…" : "UPDATE PASSWORD"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-white text-3xl font-serif mb-2">
            Mountain Creek Lodge
          </h1>
          <p className="text-white/40 text-sm tracking-wider uppercase">
            Set New Password
          </p>
        </div>

        <Card>
          <Suspense fallback={<p className="text-white/40 text-sm text-center">Loading...</p>}>
            <ResetPasswordForm />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
