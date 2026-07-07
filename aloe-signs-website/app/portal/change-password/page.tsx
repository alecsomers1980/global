'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    try {
      const supabase = createClientSupabase();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      const res = await fetch('/api/portal/profile/complete-first-login', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to finalise password change.');

      setMessage({ type: 'success', text: 'Password updated. Redirecting...' });
      router.push('/portal/admin');
      router.refresh();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-6">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-lg">
        <h1 className="text-2xl font-semibold text-white mb-1">Set a new password</h1>
        <p className="text-sm text-gray-400 mb-6">
          For security, please choose a new password before continuing.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
              placeholder="Min. 8 characters"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
              placeholder="Re-enter password"
              required
            />
          </div>

          {message && (
            <div
              className={`text-sm px-3 py-2 rounded-lg ${
                message.type === 'error'
                  ? 'bg-red-900/30 text-red-300 border border-red-800'
                  : 'bg-green-900/30 text-green-300 border border-green-800'
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#84cc16] hover:bg-[#6ea60c] disabled:opacity-50 rounded-lg font-medium text-black transition-colors"
          >
            {loading ? 'Updating...' : 'Set Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
