'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  full_name: string;
  short_code: string;
  role: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ email: string; password: string } | null>(null);

  // Add user form
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [role, setRole] = useState('user');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/portal/admin/users');
      if (!res.ok) throw new Error('Failed to load users');
      const data = await res.json();
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/portal/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message || 'Failed to update role');
      } else {
        fetchUsers();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      const res = await fetch(`/api/portal/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_password' }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Failed to reset password');
      } else {
        // find user email
        const user = users.find((u) => u.id === userId);
        setBanner({ email: user?.email ?? 'Unknown', password: data.tempPassword });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    try {
      const res = await fetch('/api/portal/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          full_name: fullName,
          short_code: shortCode,
          role,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.message || 'Failed to create user');
      } else {
        setBanner({ email: data.email, password: data.tempPassword });
        setEmail('');
        setFullName('');
        setShortCode('');
        setRole('user');
        fetchUsers();
      }
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Link
          href="/portal/admin"
          className="text-[#84cc16] hover:underline text-sm inline-block mb-6"
        >
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-8">Staff Users</h1>

        {banner && (
          <div className="border border-[#84cc16] rounded-lg p-4 mb-6 bg-[#84cc16]/10">
            <div className="flex justify-between items-start">
              <p className="text-sm">
                New temporary password for <strong>{banner.email}</strong>:{' '}
                <code className="bg-black/30 px-2 py-0.5 rounded font-mono text-[#84cc16] select-all">
                  {banner.password}
                </code>{' '}
                — they must change it on first login.
              </p>
              <button
                onClick={() => setBanner(null)}
                className="text-white/60 hover:text-white text-lg leading-none ml-3"
              >
                &times;
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Code</th>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Role</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">{user.short_code || '—'}</td>
                    <td className="px-4 py-3">{user.full_name || '—'}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="admin">admin</option>
                        <option value="user">user</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        className="bg-[#84cc16] text-black rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-[#72b012] transition-colors"
                      >
                        Reset password
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-white/50">
                      No staff users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Add user</h2>
          {formError && (
            <div className="text-red-400 text-sm mb-4">{formError}</div>
          )}
          <form onSubmit={handleCreateUser} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-white/60 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1">Short code</label>
              <input
                type="text"
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30"
                placeholder="e.g. JD"
              />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white"
              >
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={formLoading}
                className="bg-[#84cc16] text-black rounded-lg px-4 py-2 font-medium hover:bg-[#72b012] transition-colors disabled:opacity-50"
              >
                {formLoading ? 'Creating...' : 'Create user'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
