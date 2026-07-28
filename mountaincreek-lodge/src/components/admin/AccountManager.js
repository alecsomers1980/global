"use client";

import { useState } from "react";

export default function AccountManager() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Password updated.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(data.error || "Failed to update password.");
      }
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#1a1d27] rounded-xl border border-white/5 p-8 max-w-lg">
      <h2 className="text-white text-xl font-serif mb-6">Change Password</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
            Current Password
          </label>
          <input
            type={showPasswords ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
          />
        </div>

        <div>
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
            New Password
          </label>
          <input
            type={showPasswords ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
          />
        </div>

        <div>
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
            Confirm New Password
          </label>
          <input
            type={showPasswords ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
          />
        </div>

        <label className="flex items-center gap-2 text-white/50 text-xs">
          <input
            type="checkbox"
            checked={showPasswords}
            onChange={(e) => setShowPasswords(e.target.checked)}
            className="w-4 h-4 rounded accent-[#C07750]"
          />
          Show passwords
        </label>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-green-400 text-sm">{success}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-[#C07750] text-white px-8 py-3 rounded-lg font-semibold tracking-wider text-sm hover:bg-[#a8654a] transition-colors disabled:opacity-60"
        >
          {submitting ? "UPDATING…" : "UPDATE PASSWORD"}
        </button>
      </form>
    </div>
  );
}
