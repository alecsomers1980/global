"use client";

import { useState } from "react";
import Card from "@/components/admin/ui/Card";
import Button from "@/components/admin/ui/Button";
import FieldLabel from "@/components/admin/ui/FieldLabel";
import TextInput from "@/components/admin/ui/TextInput";

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
    <Card className="max-w-lg">
      <h2 className="text-white text-xl font-serif mb-6">Change Password</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <FieldLabel>
            Current Password
          </FieldLabel>
          <TextInput
            type={showPasswords ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <div>
          <FieldLabel>
            New Password
          </FieldLabel>
          <TextInput
            type={showPasswords ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <div>
          <FieldLabel>
            Confirm New Password
          </FieldLabel>
          <TextInput
            type={showPasswords ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
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

        <Button type="submit" disabled={submitting}>
          {submitting ? "UPDATING…" : "UPDATE PASSWORD"}
        </Button>
      </form>
    </Card>
  );
}
