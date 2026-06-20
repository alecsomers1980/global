"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { updatePassword } from "@/app/auth/actions";

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState(updatePassword, undefined);
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
          Choose a new password
        </h1>
        <p className="text-sm text-slate-600 text-center mb-6">
          Enter a new password for your account.
        </p>

        {state?.error && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800 mb-4">
            {state.error}
          </div>
        )}

        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              New password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPw ? "text" : "password"}
                required
                minLength={8}
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
            <p className="mt-1 text-xs text-slate-500">At least 8 characters</p>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded bg-green px-6 py-3 text-sm font-semibold text-navy hover:bg-green-dark disabled:opacity-60"
          >
            {pending ? "Saving…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
