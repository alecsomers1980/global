'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Send, Loader2 } from 'lucide-react';
import { NEWS_CATEGORIES } from '@/lib/news-categories';

interface NewArticleForm {
  title: string;
  slug: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  content: string;
  image_url: string;
  category: string;
}

export default function NewArticlePage() {
  const router = useRouter();
  const [form, setForm] = useState<NewArticleForm>({
    title: '',
    slug: '',
    excerpt: '',
    meta_title: '',
    meta_description: '',
    content: '',
    image_url: '',
    category: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function create(status: 'DRAFT' | 'PUBLISHED') {
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/portal/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create article');
      }
      router.push('/portal/admin/news');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/portal/admin/news"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white/90 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to News List
        </Link>

        <h1 className="text-3xl font-bold">New Article</h1>
        <p className="text-white/50 mt-1 mb-8">
          Write a news / blog article manually.
        </p>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-white/70 mb-1">
              Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#84cc16]"
              placeholder="Article title"
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-white/70 mb-1">
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              value={form.slug}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#84cc16]"
              placeholder="custom-slug (optional)"
            />
            <p className="text-xs text-white/40 mt-1">
              Leave blank to auto-generate from the title.
            </p>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-white/70 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#84cc16]"
            >
              <option value="">Select category</option>
              {NEWS_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0a0a0a]">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-white/70 mb-1">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              rows={3}
              value={form.excerpt}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#84cc16]"
              placeholder="Short description"
            />
          </div>

          {/* Meta Title */}
          <div>
            <label htmlFor="meta_title" className="block text-sm font-medium text-white/70 mb-1">
              Meta Title
            </label>
            <input
              id="meta_title"
              name="meta_title"
              type="text"
              value={form.meta_title}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#84cc16]"
              placeholder="SEO title (optional)"
            />
          </div>

          {/* Meta Description */}
          <div>
            <label htmlFor="meta_description" className="block text-sm font-medium text-white/70 mb-1">
              Meta Description
            </label>
            <textarea
              id="meta_description"
              name="meta_description"
              rows={2}
              value={form.meta_description}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#84cc16]"
              placeholder="SEO description (optional)"
            />
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="image_url" className="block text-sm font-medium text-white/70 mb-1">
              Image URL
            </label>
            <input
              id="image_url"
              name="image_url"
              type="text"
              value={form.image_url}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#84cc16]"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-white/40 mt-1">
              Optional. Paste an image URL for the hero image.
            </p>
            {form.image_url && (
              <img
                src={form.image_url}
                className="w-full h-56 object-cover rounded-2xl mb-2 mt-3"
                alt=""
              />
            )}
          </div>

          {/* Content (Markdown) */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-white/70 mb-1">
              Content (Markdown)
            </label>
            <textarea
              id="content"
              name="content"
              rows={18}
              value={form.content}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#84cc16] font-mono"
              placeholder="Write your article in Markdown..."
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => create('DRAFT')}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-[#84cc16] hover:bg-[#a3e635] text-black rounded-xl font-medium px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => create('PUBLISHED')}
              disabled={saving}
              className="inline-flex items-center gap-2 border border-green-400 text-green-400 hover:bg-green-400/10 rounded-xl px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Publish Now
            </button>
            {error && <span className="text-sm text-red-400">{error}</span>}
          </div>
        </form>
      </div>
    </div>
  );
}