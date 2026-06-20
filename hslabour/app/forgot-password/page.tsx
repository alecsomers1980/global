"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { requestPasswordReset } from "@/app/auth/actions";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);

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
          Reset your password
        </h1>
        <p className="text-sm text-slate-600 text-center mb-6">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {state?.success ? (
          <div className="rounded border border-green/30 bg-mint p-3 text-sm text-navy">
            {state.message}
          </div>
        ) : (
          <>
            {state?.error && (
              <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800 mb-4">
                {state.error}
              </div>
            )}
            <form action={action} className="space-y-4">
              <div>
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
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
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded bg-green px-6 py-3 text-sm font-semibold text-navy hover:bg-green-dark disabled:opacity-60"
              >
                {pending ? "Sending…" : "Send reset link"}
              </button>
            </form>
          </>
        )}

        <p className="mt-6 text-sm text-slate-600 text-center">
          <Link href="/login" className="font-semibold text-green-dark hover:text-green">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
