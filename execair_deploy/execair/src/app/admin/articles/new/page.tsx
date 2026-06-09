"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Loader2, ImagePlus, X } from "lucide-react";
import Link from "next/link";

export default function NewArticlePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image: "",
    category: "HVAC Tips",
    cta_text: "",
    cta_url: "/contact-us",
    published: true,
  });

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "title"
        ? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) }
        : {}),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (res.ok) {
      const data = await res.json();
      handleChange("image", data.url);
    } else {
      const data = await res.json();
      setError(data.error || "Upload failed");
    }
    setUploading(false);
  };

  const handleOptimize = async () => {
    if (!form.content && !form.excerpt) return;
    setOptimizing(true);
    try {
      const res = await fetch("/api/admin/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: form.content || form.excerpt,
          name: form.title,
          sector: form.category,
        }),
      });
      const data = await res.json();
      if (data.optimized) {
        // Use the optimized text as content, keep excerpt shorter
        handleChange("content", data.optimized);
        handleChange("excerpt", data.optimized.slice(0, 200) + "...");
      } else setError(data.error || "Optimization failed");
    } catch {
      setError("Failed to reach AI service");
    } finally {
      setOptimizing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create");
      }
      router.push("/admin/articles");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/articles" className="mb-6 inline-flex items-center gap-2 text-sm text-brand-navy/50 transition-colors hover:text-brand-navy">
        <ArrowLeft className="h-4 w-4" /> Back to Articles
      </Link>
      <h1 className="mb-8 text-2xl font-bold text-brand-navy">New Article</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-brand-navy">Title</label>
            <input value={form.title} onChange={(e) => handleChange("title", e.target.value)} required className="w-full rounded-xl border px-4 py-2.5 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/20" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-brand-navy">Slug</label>
            <input value={form.slug} onChange={(e) => handleChange("slug", e.target.value)} required className="w-full rounded-xl border bg-gray-50 px-4 py-2.5 text-sm focus:border-brand-teal focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-navy">Category</label>
            <select value={form.category} onChange={(e) => handleChange("category", e.target.value)} className="w-full rounded-xl border px-4 py-2.5 text-sm focus:border-brand-teal focus:outline-none">
              <option>HVAC Tips</option>
              <option>Energy Efficiency</option>
              <option>Maintenance</option>
              <option>Industry News</option>
              <option>Case Study</option>
              <option>Buying Guide</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={form.published} onChange={(e) => handleChange("published", e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-teal focus:ring-brand-teal" />
              <span className="text-sm text-brand-navy/60">Publish immediately</span>
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-brand-navy">Excerpt</label>
            <textarea value={form.excerpt} onChange={(e) => handleChange("excerpt", e.target.value)} rows={2} className="w-full rounded-xl border px-4 py-2.5 text-sm focus:border-brand-teal focus:outline-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-brand-navy">Featured Image</label>
            <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="hidden" />
            {form.image ? (
              <div className="relative inline-block">
                <img src={form.image} alt="" className="h-32 w-48 rounded-xl object-cover shadow-md" />
                <button type="button" onClick={() => handleChange("image", "")} className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-lg hover:bg-red-600"><X className="h-3.5 w-3.5" /></button>
              </div>
            ) : (
              <button type="button" onClick={() => imageInputRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-6 py-8 text-sm text-brand-navy/40 transition-all hover:border-brand-teal/40 hover:text-brand-teal disabled:opacity-50">
                {uploading ? <><Loader2 className="h-5 w-5 animate-spin" />Uploading...</> : <><ImagePlus className="h-5 w-5" />Click to upload featured image</>}
              </button>
            )}
          </div>
          <div className="sm:col-span-2">
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-brand-navy">Content (HTML)</label>
              <button type="button" onClick={handleOptimize} disabled={optimizing || (!form.content && !form.excerpt)} className="inline-flex items-center gap-1.5 rounded-full border border-brand-teal/30 px-3 py-1 text-xs font-medium text-brand-teal transition-all hover:bg-brand-teal/5 disabled:opacity-40">
                {optimizing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {optimizing ? "Optimizing..." : "AI Optimize"}
              </button>
            </div>
            <textarea value={form.content} onChange={(e) => handleChange("content", e.target.value)} rows={16} required className="w-full rounded-xl border px-4 py-2.5 text-sm font-mono focus:border-brand-teal focus:outline-none" placeholder="<h2>Introduction</h2><p>Write your article content here. Use HTML tags for formatting.</p><h2>Key Points</h2><ul><li>Point 1</li><li>Point 2</li></ul>" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-brand-navy">CTA Button Text</label>
            <input value={form.cta_text} onChange={(e) => handleChange("cta_text", e.target.value)} placeholder="e.g. Get Your Free Quote Today" className="w-full rounded-xl border px-4 py-2.5 text-sm focus:border-brand-teal focus:outline-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-brand-navy">CTA Button URL</label>
            <input value={form.cta_url} onChange={(e) => handleChange("cta_url", e.target.value)} placeholder="/contact-us or /product-range" className="w-full rounded-xl border px-4 py-2.5 text-sm focus:border-brand-teal focus:outline-none" />
          </div>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-full bg-brand-teal px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-teal/90 disabled:opacity-50">
            {submitting ? "Creating..." : "Create Article"}
          </button>
          <Link href="/admin/articles" className="rounded-full border px-6 py-3 text-sm font-medium transition-colors hover:bg-gray-50">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
