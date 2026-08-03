'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });

      if (!res.ok) {
        throw new Error('Request failed');
      }

      // API always returns { ok: true } regardless of existence
      setSent(true);
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {!sent ? (
          <>
            <div className="flex flex-col items-center mb-6">
              <div className="rounded-full bg-brand-pink/10 p-3 mb-4">
                <Mail className="h-6 w-6 text-brand-pink" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
              <p className="mt-1 text-sm text-gray-500">
                Enter your admin email and we’ll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 outline-none transition"
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-brand-pink px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-pink/90 focus:outline-none focus:ring-2 focus:ring-brand-pink/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link
                href="/admin/login"
                className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2"
              >
                ← Back to sign in
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center mb-6">
              <div className="rounded-full bg-brand-pink/10 p-3 mb-4">
                <Mail className="h-6 w-6 text-brand-pink" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
            </div>

            <p className="text-sm text-gray-600 text-center mb-6">
              If that email is registered, a reset link is on its way. Check your inbox.
            </p>

            <div className="text-center">
              <Link
                href="/admin/login"
                className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2"
              >
                ← Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}