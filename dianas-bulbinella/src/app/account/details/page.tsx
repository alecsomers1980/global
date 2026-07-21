"use client";

import { useState, useEffect, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/auth/PasswordInput";

interface Profile {
  full_name: string | null;
  phone: string | null;
  email: string;
  marketing_opt_in: boolean;
}

export default function AccountDetailsPage() {
  // Stable client reference so the load effect runs once, not every render.
  const [supabase] = useState(() => createClient());

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Details section
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [detailsMessage, setDetailsMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [savingDetails, setSavingDetails] = useState(false);

  // Password section
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError || !userData.user) {
          setLoading(false);
          return;
        }

        const uid = userData.user.id;
        setUserId(uid);

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, phone, email, marketing_opt_in")
          .eq("id", uid)
          .single();

        if (profileError) {
          console.error(profileError);
          setLoading(false);
          return;
        }

        setProfile(profileData);
        setFullName(profileData.full_name || "");
        setPhone(profileData.phone || "");
        setMarketingOptIn(profileData.marketing_opt_in ?? false);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [supabase]);

  const handleDetailsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setDetailsMessage(null);
    if (!userId) return;

    setSavingDetails(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone,
          marketing_opt_in: marketingOptIn,
        })
        .eq("id", userId);

      if (error) {
        setDetailsMessage({ type: "error", text: error.message });
      } else {
        setDetailsMessage({ type: "success", text: "Details updated." });
        setProfile((prev) =>
          prev
            ? { ...prev, full_name: fullName, phone, marketing_opt_in: marketingOptIn }
            : prev
        );
      }
    } catch {
      setDetailsMessage({ type: "error", text: "Something went wrong." });
    } finally {
      setSavingDetails(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 8) {
      setPasswordMessage({
        type: "error",
        text: "Password must be at least 8 characters.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordMessage({ type: "error", text: error.message });
      } else {
        setPasswordMessage({ type: "success", text: "Password updated." });
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordMessage({ type: "error", text: "Something went wrong." });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="bg-paper border border-line rounded-2xl p-6 h-40" />
        <div className="bg-paper border border-line rounded-2xl p-6 h-40" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-ink text-sm">Could not load profile.</div>;
  }

  return (
    <div className="space-y-8">
      {/* My details */}
      <div className="bg-paper border border-line rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-serif text-ink mb-5">My details</h2>
        <form onSubmit={handleDetailsSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm text-ink mb-1">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-ink mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm w-full outline-none text-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted mt-1">Email cannot be changed here.</p>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm text-ink mb-1">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
            />
          </div>

          <div className="flex items-start gap-3">
            <input
              id="marketingOptIn"
              type="checkbox"
              checked={marketingOptIn}
              onChange={(e) => setMarketingOptIn(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-line text-forest focus:ring-forest"
            />
            <label htmlFor="marketingOptIn" className="text-sm text-ink">
              Email me occasional offers and reminders when I&apos;m due to
              restock
            </label>
          </div>

          {detailsMessage && (
            <p
              className={`text-sm rounded-xl px-3 py-2 ${
                detailsMessage.type === "success"
                  ? "text-green-700 bg-green-50 border border-green-200"
                  : "text-red-600 bg-red-50 border border-red-200"
              }`}
            >
              {detailsMessage.text}
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingDetails}
              className="rounded-full bg-forest text-white px-5 py-2.5 text-sm font-semibold hover:bg-moss transition-colors disabled:opacity-50"
            >
              {savingDetails ? "Saving..." : "Save details"}
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-paper border border-line rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-serif text-ink mb-5">Change password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm text-ink mb-1">
              New password
            </label>
            <PasswordInput
              id="newPassword"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label
              htmlFor="confirmNewPassword"
              className="block text-sm text-ink mb-1"
            >
              Confirm new password
            </label>
            <PasswordInput
              id="confirmNewPassword"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
            />
          </div>

          {passwordMessage && (
            <p
              className={`text-sm rounded-xl px-3 py-2 ${
                passwordMessage.type === "success"
                  ? "text-green-700 bg-green-50 border border-green-200"
                  : "text-red-600 bg-red-50 border border-red-200"
              }`}
            >
              {passwordMessage.text}
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="rounded-full bg-forest text-white px-5 py-2.5 text-sm font-semibold hover:bg-moss transition-colors disabled:opacity-50"
            >
              {savingPassword ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
