"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Sparkles, Loader2, Save, Upload, X, ImagePlus } from "lucide-react";
import Link from "next/link";

interface Project {
  name: string;
  slug: string;
  description: string;
  image: string | null;
  gallery: string[];
  location: string | null;
  year: string | null;
  equipment: string | null;
  client: string | null;
  sector: string;
}

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Project>({
    name: "",
    slug: "",
    description: "",
    image: "",
    gallery: [],
    location: "",
    year: "",
    equipment: "",
    client: "",
    sector: "Commercial",
  });

  useEffect(() => {
    fetch(`/api/projects/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError("Project not found"); return; }
        setForm({ ...data, gallery: data.gallery || [] });
        setLoading(false);
      })
      .catch(() => { setError("Failed to load"); setLoading(false); });
  }, [slug]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Upload failed");
      return null;
    }
    const data = await res.json();
    return data.url;
  };

  const handleMainUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMain(true);
    const url = await uploadFile(file);
    if (url) handleChange("image", url);
    setUploadingMain(false);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingGallery(true);

    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const url = await uploadFile(file);
      if (url) urls.push(url);
    }

    handleChange("gallery", [...form.gallery, ...urls]);
    setUploadingGallery(false);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const removeGalleryImage = (index: number) => {
    handleChange("gallery", form.gallery.filter((_, i) => i !== index));
  };

  const handleOptimize = async () => {
    if (!form.description) return;
    setOptimizing(true);
    try {
      const res = await fetch("/api/admin/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: form.description,
          name: form.name,
          sector: form.sector,
        }),
      });
      const data = await res.json();
      if (data.optimized) handleChange("description", data.optimized);
      else setError(data.error || "Optimization failed");
    } catch {
      setError("Failed to reach AI service");
    } finally {
      setOptimizing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/projects/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      setSuccess("Project updated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-teal border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/projects"
        className="mb-6 inline-flex items-center gap-2 text-sm text-brand-navy/50 transition-colors hover:text-brand-navy"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      <h1 className="mb-8 text-2xl font-bold text-brand-navy">Edit Project</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-brand-navy">Name</label>
            <input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              className="w-full rounded-xl border px-4 py-2.5 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-brand-navy">Slug</label>
            <input
              value={form.slug}
              disabled
              className="w-full rounded-xl border bg-gray-100 px-4 py-2.5 text-sm text-gray-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-navy">Sector</label>
            <select
              value={form.sector}
              onChange={(e) => handleChange("sector", e.target.value)}
              className="w-full rounded-xl border px-4 py-2.5 text-sm focus:border-brand-teal focus:outline-none"
            >
              <option>Commercial</option>
              <option>Industrial</option>
              <option>Residential</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-navy">Year</label>
            <input
              value={form.year || ""}
              onChange={(e) => handleChange("year", e.target.value)}
              className="w-full rounded-xl border px-4 py-2.5 text-sm focus:border-brand-teal focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-navy">Location</label>
            <input
              value={form.location || ""}
              onChange={(e) => handleChange("location", e.target.value)}
              className="w-full rounded-xl border px-4 py-2.5 text-sm focus:border-brand-teal focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-navy">Client</label>
            <input
              value={form.client || ""}
              onChange={(e) => handleChange("client", e.target.value)}
              className="w-full rounded-xl border px-4 py-2.5 text-sm focus:border-brand-teal focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-brand-navy">Equipment</label>
            <input
              value={form.equipment || ""}
              onChange={(e) => handleChange("equipment", e.target.value)}
              className="w-full rounded-xl border px-4 py-2.5 text-sm focus:border-brand-teal focus:outline-none"
            />
          </div>

          {/* Main Image Upload */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-brand-navy">Main Image</label>
            <input
              ref={mainInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleMainUpload}
              className="hidden"
            />
            {form.image ? (
              <div className="relative inline-block">
                <img
                  src={form.image}
                  alt="Main preview"
                  className="h-40 w-60 rounded-xl object-cover shadow-md"
                />
                <button
                  type="button"
                  onClick={() => handleChange("image", "")}
                  className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-lg hover:bg-red-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => mainInputRef.current?.click()}
                disabled={uploadingMain}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-6 py-8 text-sm text-brand-navy/40 transition-all hover:border-brand-teal/40 hover:text-brand-teal disabled:opacity-50"
              >
                {uploadingMain ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-5 w-5" />
                    Click to upload main image
                  </>
                )}
              </button>
            )}
          </div>

          {/* Gallery Upload */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-brand-navy">
              Project Gallery
            </label>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleGalleryUpload}
              className="hidden"
            />
            {form.gallery.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-3">
                {form.gallery.map((url, i) => (
                  <div key={i} className="relative">
                    <img
                      src={url}
                      alt={`Gallery ${i + 1}`}
                      className="h-24 w-32 rounded-lg object-cover shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(i)}
                      className="absolute -right-1.5 -top-1.5 rounded-full bg-red-500 p-0.5 text-white shadow-lg hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={uploadingGallery}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-5 py-3 text-sm text-brand-navy/40 transition-all hover:border-brand-teal/40 hover:text-brand-teal disabled:opacity-50"
            >
              {uploadingGallery ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload gallery images
                </>
              )}
            </button>
          </div>

          <div className="sm:col-span-2">
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-brand-navy">Description</label>
              <button
                type="button"
                onClick={handleOptimize}
                disabled={optimizing || !form.description}
                className="inline-flex items-center gap-1.5 rounded-full border border-brand-teal/30 px-3 py-1 text-xs font-medium text-brand-teal transition-all hover:bg-brand-teal/5 disabled:opacity-40"
              >
                {optimizing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {optimizing ? "Optimizing..." : "AI Optimize"}
              </button>
            </div>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={5}
              required
              className="w-full rounded-xl border px-4 py-2.5 text-sm focus:border-brand-teal focus:outline-none"
            />
          </div>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        {success && <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600">{success}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-brand-teal px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-teal/90 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
          <Link
            href="/admin/projects"
            className="rounded-full border px-6 py-3 text-sm font-medium transition-colors hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
