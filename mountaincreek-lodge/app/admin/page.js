"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import AccommodationManager from "@/components/admin/AccommodationManager";
import GalleryManager from "@/components/admin/GalleryManager";
import RedLitchiManager from "@/components/admin/RedLitchiManager";
import AccountManager from "@/components/admin/AccountManager";
import PackagesManager from "@/components/admin/PackagesManager";
import PageHeader from "@/components/admin/ui/PageHeader";
import Card from "@/components/admin/ui/Card";
import Button from "@/components/admin/ui/Button";
import FieldLabel from "@/components/admin/ui/FieldLabel";
import TextInput from "@/components/admin/ui/TextInput";

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

        <Card>
          <form onSubmit={handleSubmit}>
            <FieldLabel>Password</FieldLabel>
            <div className="relative mb-4">
              <TextInput
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                autoComplete="current-password"
                placeholder="Enter admin password"
                className="pr-16"
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
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "SIGNING IN…" : "SIGN IN"}
            </Button>
          </form>
        </Card>

        <p className="text-center text-white/20 text-xs mt-8">
          &copy; {new Date().getFullYear()} Mountain Creek Lodge
        </p>
      </div>
    </div>
  );
}

// ─── Admin Dashboard ────────────────────────────────────────────
function AdminPageInner() {
  const [authed, setAuthed] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = searchParams.get("tab") || "packages";
  const setActiveTab = (tab) => {
    router.push(`${pathname}?tab=${tab}`, { scroll: false });
  };

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
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-[#0f1117] border-r border-white/5 flex flex-col p-6">
        <div className="mb-10">
          <h1 className="text-white text-lg font-serif leading-tight">Mountain Creek Lodge</h1>
          <p className="text-white/30 text-xs uppercase tracking-widest mt-1">Admin</p>
        </div>
        <nav className="flex-1 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium tracking-wide transition-colors ${
                activeTab === tab.id
                  ? "bg-[#C07750] text-white"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <button
          onClick={handleSignOut}
          className="text-white/30 hover:text-red-400 text-sm transition-colors text-left px-4 py-2.5"
        >
          Sign Out
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
        <PageHeader title={TABS.find((t) => t.id === activeTab)?.label} />

        {activeTab === "accommodation" && <AccommodationManager />}
        {activeTab === "gallery" && <GalleryManager />}
        {activeTab === "red-litchi" && <RedLitchiManager />}
        {activeTab === "account" && <AccountManager />}
        {activeTab === "packages" && <PackagesManager />}
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-white/40 text-sm">Loading...</p>
        </div>
      }
    >
      <AdminPageInner />
    </Suspense>
  );
}
