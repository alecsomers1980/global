"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AccommodationManager from "@/components/admin/AccommodationManager";
import GalleryManager from "@/components/admin/GalleryManager";
import RedLitchiManager from "@/components/admin/RedLitchiManager";
import AccountManager from "@/components/admin/AccountManager";
import PackagesManager from "@/components/admin/PackagesManager";

const TABS = [
  { id: "packages", label: "Packages" },
  { id: "accommodation", label: "Accommodation" },
  { id: "gallery", label: "Gallery" },
  { id: "red-litchi", label: "Red Litchi" },
  { id: "account", label: "Account" },
];

// ─── Login Screen ───────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password, remember }),
      });
      if (res.ok) {
        onLogin();
      } else {
        setError("Incorrect password. Please try again.");
      }
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-white text-3xl font-serif mb-2">
            Mountain Creek Lodge
          </h1>
          <p className="text-white/40 text-sm tracking-wider uppercase">
            Admin Portal
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#1a1d27] p-8 rounded-xl border border-white/5"
        >
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
            Password
          </label>
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              autoComplete="current-password"
              className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 pr-16 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
              placeholder="Enter admin password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-0 px-4 text-white/40 hover:text-white/70 text-xs uppercase tracking-wider transition-colors"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center gap-2 text-white/50 text-xs">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded accent-[#C07750]"
              />
              Stay signed in for 7 days
            </label>
            <Link
              href="/admin/forgot"
              className="text-[#C07750] hover:text-[#C07750]/80 text-xs transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#C07750] text-white py-3 rounded-lg font-semibold tracking-wider text-sm hover:bg-[#a8654a] transition-colors disabled:opacity-60"
          >
            {submitting ? "SIGNING IN…" : "SIGN IN"}
          </button>
        </form>

        <p className="text-center text-white/20 text-xs mt-8">
          &copy; {new Date().getFullYear()} Mountain Creek Lodge
        </p>
      </div>
    </div>
  );
}

// ─── Admin Dashboard ────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [activeTab, setActiveTab] = useState("packages");

  useEffect(() => {
    fetch("/api/admin/session", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setAuthed(Boolean(data.authed)))
      .finally(() => setCheckingSession(false));
  }, []);

  const handleSignOut = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    setAuthed(false);
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/40 text-sm">Loading...</p>
      </div>
    );
  }

  if (!authed) {
    return <LoginScreen onLogin={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-serif">Admin Portal</h1>
          <p className="text-white/30 text-sm mt-1">
            Mountain Creek Lodge
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/30 hover:text-white/60 text-sm transition-colors"
          >
            View Site →
          </a>
          <button
            onClick={handleSignOut}
            className="text-white/30 hover:text-red-400 text-sm transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-10 border-b border-white/5 pb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-colors ${
              activeTab === tab.id
                ? "bg-[#C07750] text-white"
                : "text-white/50 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "accommodation" && <AccommodationManager />}
      {activeTab === "gallery" && <GalleryManager />}
      {activeTab === "red-litchi" && <RedLitchiManager />}
      {activeTab === "account" && <AccountManager />}
      {activeTab === "packages" && <PackagesManager />}
    </div>
  );
}
