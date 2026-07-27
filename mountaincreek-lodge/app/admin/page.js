"use client";

import { useState, useEffect, useRef } from "react";
import {
  getPackages,
  addPackage,
  updatePackage,
  deletePackage,
  generateSlug,
} from "@/lib/packages";
import AccommodationManager from "@/components/admin/AccommodationManager";
import GalleryManager from "@/components/admin/GalleryManager";
import RedLitchiManager from "@/components/admin/RedLitchiManager";

const TABS = [
  { id: "packages", label: "Packages" },
  { id: "accommodation", label: "Accommodation" },
  { id: "gallery", label: "Gallery" },
  { id: "red-litchi", label: "Red Litchi" },
];

const CATEGORIES = ["Safari", "Adventure", "Romantic", "Family", "Dining", "Custom"];

const emptyForm = {
  title: "",
  slug: "",
  shortDescription: "",
  fullDescription: "",
  category: "Safari",
  price: "",
  duration: "",
  maxGuests: "",
  includes: [""],
  image: "",
  tag: "",
  active: true,
};

// ─── Login Screen ───────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState("");
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
        body: JSON.stringify({ password }),
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
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg mb-4 focus:outline-none focus:border-[#C07750] transition-colors"
            placeholder="Enter admin password"
          />
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
          &copy; {new Date().getFullYear()} Mountaincreek Lodge
        </p>
      </div>
    </div>
  );
}

// ─── Package Form ───────────────────────────────────────────────
function PackageForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || emptyForm);
  const fileRef = useRef(null);

  const update = (field, value) =>
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "title" && !initial
        ? { slug: generateSlug(value) }
        : {}),
    }));

  const updateInclude = (index, value) => {
    const newIncludes = [...form.includes];
    newIncludes[index] = value;
    setForm((prev) => ({ ...prev, includes: newIncludes }));
  };

  const addInclude = () =>
    setForm((prev) => ({ ...prev, includes: [...prev.includes, ""] }));

  const removeInclude = (index) =>
    setForm((prev) => ({
      ...prev,
      includes: prev.includes.filter((_, i) => i !== index),
    }));

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      update("image", ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      price: form.price ? Number(form.price) : null,
      maxGuests: form.maxGuests ? Number(form.maxGuests) : null,
      includes: form.includes.filter((i) => i.trim()),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title & Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
            Package Name *
          </label>
          <input
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
            placeholder="e.g. Sunrise Safari Escape"
          />
        </div>
        <div>
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
            URL Slug
          </label>
          <input
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            className="w-full bg-[#0f1117] border border-white/10 text-white/60 px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
            placeholder="auto-generated-from-title"
          />
        </div>
      </div>

      {/* Short & Full Description */}
      <div>
        <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
          Short Description *
        </label>
        <input
          required
          value={form.shortDescription}
          onChange={(e) => update("shortDescription", e.target.value)}
          className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
          placeholder="Brief tagline for cards"
        />
      </div>
      <div>
        <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
          Full Description
        </label>
        <textarea
          rows={4}
          value={form.fullDescription}
          onChange={(e) => update("fullDescription", e.target.value)}
          className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors resize-y"
          placeholder="Detailed description for the detail page"
        />
      </div>

      {/* Category, Price, Duration, Max Guests */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
            Price (ZAR)
          </label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
            placeholder="2500"
          />
        </div>
        <div>
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
            Duration
          </label>
          <input
            value={form.duration}
            onChange={(e) => update("duration", e.target.value)}
            className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
            placeholder="2 Nights / 3 Days"
          />
        </div>
        <div>
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
            Max Guests
          </label>
          <input
            type="number"
            value={form.maxGuests}
            onChange={(e) => update("maxGuests", e.target.value)}
            className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
            placeholder="4"
          />
        </div>
      </div>

      {/* Tag & Active */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
            Tag / Badge
          </label>
          <input
            value={form.tag || ""}
            onChange={(e) => update("tag", e.target.value || null)}
            className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
            placeholder="e.g. MOST POPULAR, NEW (leave blank for none)"
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => update("active", e.target.checked)}
              className="w-5 h-5 rounded accent-[#C07750]"
            />
            <span className="text-white/70 text-sm">
              Active (visible on website)
            </span>
          </label>
        </div>
      </div>

      {/* Includes List */}
      <div>
        <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
          What&apos;s Included
        </label>
        <div className="space-y-2">
          {form.includes.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={item}
                onChange={(e) => updateInclude(i, e.target.value)}
                className="flex-1 bg-[#0f1117] border border-white/10 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors text-sm"
                placeholder={`Item ${i + 1}`}
              />
              {form.includes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInclude(i)}
                  className="text-red-400/60 hover:text-red-400 px-3 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addInclude}
          className="mt-2 text-[#C07750] text-sm font-medium hover:text-[#C07750]/80 transition-colors"
        >
          + Add item
        </button>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
          Image
        </label>
        <div className="flex items-start gap-4">
          {form.image && (
            <img
              src={form.image}
              alt="Preview"
              className="w-28 h-20 object-cover rounded-lg border border-white/10"
            />
          )}
          <div className="flex-1">
            <input
              value={form.image?.startsWith("data:") ? "" : form.image || ""}
              onChange={(e) => update("image", e.target.value)}
              className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors text-sm mb-2"
              placeholder="/images/accommodation/IMG_8185.jpg"
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-sm text-[#C07750] hover:text-[#C07750]/80 transition-colors"
            >
              or upload an image file
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-white/5">
        <button
          type="submit"
          className="bg-[#C07750] text-white px-8 py-3 rounded-lg font-semibold tracking-wider text-sm hover:bg-[#a8654a] transition-colors"
        >
          {initial ? "UPDATE PACKAGE" : "CREATE PACKAGE"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-white/40 hover:text-white/70 px-6 py-3 text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Admin Dashboard ────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [activeTab, setActiveTab] = useState("packages");
  const [packages, setPackages] = useState([]);
  const [view, setView] = useState("list"); // list | create | edit
  const [editPkg, setEditPkg] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetch("/api/admin/session", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setAuthed(Boolean(data.authed)))
      .finally(() => setCheckingSession(false));
  }, []);

  useEffect(() => {
    if (authed) {
      refreshPackages();
    }
  }, [authed]);

  const handleSignOut = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    setAuthed(false);
  };

  const refreshPackages = () => {
    getPackages()
      .then(setPackages)
      .catch((err) => console.error("Failed to load packages:", err));
  };

  const handleCreate = async (data) => {
    try {
      await addPackage(data);
      refreshPackages();
      setView("list");
    } catch (err) {
      console.error("Failed to create package:", err);
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updatePackage(editPkg.id, data);
      refreshPackages();
      setEditPkg(null);
      setView("list");
    } catch (err) {
      console.error("Failed to update package:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePackage(id);
      refreshPackages();
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete package:", err);
    }
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

      {activeTab === "packages" && (
        <>
      {/* Create / Edit Form */}
      {(view === "create" || view === "edit") && (
        <div className="bg-[#1a1d27] rounded-xl border border-white/5 p-8 mb-10">
          <h2 className="text-white text-xl font-serif mb-6">
            {view === "create" ? "Create New Package" : `Edit: ${editPkg?.title}`}
          </h2>
          <PackageForm
            initial={
              view === "edit"
                ? {
                    ...editPkg,
                    price: editPkg?.price?.toString() || "",
                    duration: editPkg?.duration || "",
                    maxGuests: editPkg?.maxGuests?.toString() || "",
                    includes:
                      editPkg?.includes?.length > 0
                        ? editPkg.includes
                        : [""],
                    tag: editPkg?.tag || "",
                  }
                : null
            }
            onSave={view === "create" ? handleCreate : handleUpdate}
            onCancel={() => {
              setView("list");
              setEditPkg(null);
            }}
          />
        </div>
      )}

      {/* Package List */}
      {view === "list" && (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-white/40 text-sm">
              {packages.length} package{packages.length !== 1 ? "s" : ""}
            </p>
            <button
              onClick={() => setView("create")}
              className="bg-[#C07750] text-white px-6 py-2.5 rounded-lg font-semibold tracking-wider text-sm hover:bg-[#a8654a] transition-colors"
            >
              + NEW PACKAGE
            </button>
          </div>

          <div className="space-y-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-[#1a1d27] rounded-xl border border-white/5 p-5 flex flex-col md:flex-row items-start md:items-center gap-5"
              >
                {/* Image */}
                {pkg.image && (
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-full md:w-32 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-medium text-base truncate">
                      {pkg.title}
                    </h3>
                    {pkg.tag && (
                      <span className="bg-[#C07750]/20 text-[#C07750] text-[10px] font-bold tracking-wider px-2 py-0.5 rounded uppercase flex-shrink-0">
                        {pkg.tag}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded uppercase flex-shrink-0 ${
                        pkg.active
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {pkg.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-white/40 text-sm truncate">
                    {pkg.shortDescription}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-white/25">
                    {pkg.price && <span>R{pkg.price.toLocaleString()} pp</span>}
                    {pkg.duration && <span>{pkg.duration}</span>}
                    {pkg.category && <span>{pkg.category}</span>}
                    <span>/packages/{pkg.slug}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={`/packages/${pkg.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/20 hover:text-white/60 p-2 transition-colors"
                    title="View on site"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                  </a>
                  <button
                    onClick={() => {
                      setEditPkg(pkg);
                      setView("edit");
                    }}
                    className="text-white/20 hover:text-[#C07750] p-2 transition-colors"
                    title="Edit"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(pkg.id)}
                    className="text-white/20 hover:text-red-400 p-2 transition-colors"
                    title="Delete"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1a1d27] rounded-xl border border-white/10 p-8 max-w-sm mx-4">
            <h3 className="text-white text-lg font-serif mb-3">
              Delete Package?
            </h3>
            <p className="text-white/50 text-sm mb-6">
              This action cannot be undone. The package will be permanently
              removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="bg-red-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-red-600 transition-colors"
              >
                DELETE
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="text-white/40 hover:text-white/70 px-4 py-2.5 text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
