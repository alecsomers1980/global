'use client';

import { useEffect, useState } from 'react';
import { createClientSupabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [shortCode, setShortCode] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState<{
    profile?: { type: 'error' | 'success'; text: string };
    password?: { type: 'error' | 'success'; text: string };
  }>({});

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClientSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        setFullName(user.user_metadata?.full_name || '');
        setPhone(user.user_metadata?.phone || '');
        setRole(user.app_metadata?.role || '');
        setShortCode(user.app_metadata?.short_code || '');
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setMessage((prev) => ({ ...prev, profile: undefined }));
    setSavingProfile(true);
    try {
      const supabase = createClientSupabase();
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName, phone },
      });
      if (error) throw error;
      setMessage((prev) => ({ ...prev, profile: { type: 'success', text: 'Profile updated.' } }));
    } catch (err: any) {
      setMessage((prev) => ({
        ...prev,
        profile: { type: 'error', text: err.message || 'Update failed.' },
      }));
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage((prev) => ({ ...prev, password: undefined }));
    if (newPassword.length < 8) {
      setMessage((prev) => ({
        ...prev,
        password: { type: 'error', text: 'Password must be at least 8 characters.' },
      }));
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage((prev) => ({
        ...prev,
        password: { type: 'error', text: 'Passwords do not match.' },
      }));
      return;
    }
    setChangingPassword(true);
    try {
      const supabase = createClientSupabase();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword('');
      setConfirmPassword('');
      setMessage((prev) => ({
        ...prev,
        password: { type: 'success', text: 'Password changed.' },
      }));
    } catch (err: any) {
      setMessage((prev) => ({
        ...prev,
        password: { type: 'error', text: err.message || 'Password change failed.' },
      }));
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] py-12 text-white flex justify-center">
        <span className="text-gray-400">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <Link
          href="/portal/admin"
          className="inline-block text-[#84cc16] hover:text-lime-300 text-sm mb-2"
        >
          &larr; Back to Dashboard
        </Link>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-2">Your details</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {shortCode && (
              <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-300 border border-white/10">
                {shortCode}
              </span>
            )}
            {role && (
              <span className="text-xs px-3 py-1 rounded-full bg-[#84cc16]/20 text-[#84cc16] border border-[#84cc16]/30">
                {role === 'admin' ? 'Admin' : 'User'}
              </span>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Contact your admin to change your email.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
              />
            </div>

            {message.profile && (
              <div
                className={`text-sm px-3 py-2 rounded-lg ${
                  message.profile.type === 'error'
                    ? 'bg-red-900/30 text-red-300 border border-red-800'
                    : 'bg-green-900/30 text-green-300 border border-green-800'
                }`}
              >
                {message.profile.text}
              </div>
            )}

            <button
              type="submit"
              disabled={savingProfile}
              className="py-2 px-6 bg-[#84cc16] hover:bg-[#6ea60c] disabled:opacity-50 rounded-lg font-medium text-black transition-colors"
            >
              {savingProfile ? 'Saving...' : 'Save'}
            </button>
          </form>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-semibold text-white mb-4">Change password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                placeholder="Min. 8 characters"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                placeholder="Re-enter password"
              />
            </div>

            {message.password && (
              <div
                className={`text-sm px-3 py-2 rounded-lg ${
                  message.password.type === 'error'
                    ? 'bg-red-900/30 text-red-300 border border-red-800'
                    : 'bg-green-900/30 text-green-300 border border-green-800'
                }`}
              >
                {message.password.text}
              </div>
            )}

            <button
              type="submit"
              disabled={changingPassword}
              className="py-2 px-6 bg-[#84cc16] hover:bg-[#6ea60c] disabled:opacity-50 rounded-lg font-medium text-black transition-colors"
            >
              {changingPassword ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
