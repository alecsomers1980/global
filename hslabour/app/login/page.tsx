"use client";

import { useActionState, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "@/app/auth/actions";

function LoginInner() {
  const searchParams = useSearchParams();
  const authError = searchParams.get("error") === "auth";
  const [state, action, pending] = useActionState(signIn, undefined);
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="min-h-screen bg-mint flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <Image
          src="/images/HSL-Logo-112x112.png"
          alt="H&S Labour Logo"
          width={64}
          height={64}
          className="mx-auto mb-6"
        />

        <h1 className="text-2xl font-bold text-navy text-center mb-1">
          Log in
        </h1>
        <p className="text-sm text-slate-600 text-center mb-6">
          Access your affiliate dashboard.
        </p>

        {authError && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800 mb-4">
            Your sign-in link was invalid or expired. Please try again.
          </div>
        )}

        {state?.error && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800 mb-4">
            {state.error}
          </div>
        )}

        <form action={action} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded border border-slate-300 px-3 py-2 text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPw ? "text" : "password"}
                required
                className="w-full rounded border border-slate-300 px-3 py-2 pr-10 text-ink outline-none focus:border-green focus:ring-2 focus:ring-green/40"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-navy"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600">
              <input
                type="checkbox"
                name="remember"
                defaultChecked
                className="h-4 w-4"
              />
              Keep me logged in
            </label>
            <Link
              href="/forgot-password"
              className="font-semibold text-green-dark hover:text-green"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded bg-green px-6 py-3 text-sm font-semibold text-navy hover:bg-green-dark disabled:opacity-60"
          >
            {pending ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600 text-center">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-green-dark hover:text-green"
          >
            Apply to join
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}