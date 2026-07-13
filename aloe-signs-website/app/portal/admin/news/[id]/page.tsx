'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Check, X, Trash2, Loader2 } from 'lucide-react';
import { NEWS_CATEGORIES } from '@/lib/news-categories';

interface PostForm {
  title: string;
  slug: string;
  excerpt: string;
  meta_title: string;
  meta_description: string;
  content: string;
  image_url: string;
  category: string;
  status?: string;
}

const STATUS_BADGES: Record<string, string> = {
  DRAFT: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  APPROVED: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  PUBLISHED: 'bg-green-400/10 text-green-400 border-green-400/20',
  DISCARDED: 'bg-red-400/10 text-red-400 border-red-400/20',
};

export default function NewsEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState<PostForm>({
    title: '',
    slug: '',
    excerpt: '',
    meta_title: '',
    meta_description: '',
    content: '',
    image_url: '',
    category: '',
  });

  const [originalStatus, setOriginalStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/portal/admin/news/${id}`);
        if (!res.ok) throw new Error('Post not found');
        const data = await res.json();
        const post = data.post;
        setForm({
          title: post.title || '',
          slug: post.slug || '',
          excerpt: post.excerpt || '',
          meta_title: post.meta_title || '',
          meta_description: post.meta_description || '',
          content: post.content || '',
          image_url: post.image_url || '',
          category: post.category || '',
        });
        setOriginalStatus(post.status);
      } catch (err: any) {
        setError(err.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const save = async (extraFields?: Partial<Pick<PostForm, 'status'>>) => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const body = {
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        meta_title: form.meta_title,
        meta_description: form.meta_description,
        content: form.content,
        image_url: form.image_url,
        category: form.category,
        ...extraFields,
      };
      const res = await fetch(`/api/portal/admin/news/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return res.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const approve = async () => {
    try {
      await save();
      const res = await fetch(`/api/portal/admin/news/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      });
      if (!res.ok) throw new Error('Failed to approve');
      router.push('/portal/admin/news');
    } catch (err: any) {
      alert(err.message || 'Error during approval');
    }
  };

  const discard = async () => {
    try {
      await fetch(`/api/portal/admin/news/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DISCARDED' }),
      });
      router.push('/portal/admin/news');
    } catch (err: any) {
      alert(err.message || 'Failed to discard');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this article permanently?')) return;
    try {
      const res = await fetch(`/api/portal/admin/news/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      router.push('/portal/admin/news');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const statusBadge = originalStatus ? (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
        STATUS_BADGES[originalStatus] || 'bg-white/10'
      }`}
    >
      {originalStatus}
    </span>
  ) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#84cc16] border-t-transparent" />
      </div>
    );
  }

  if (error && !form.title) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 bg-red-400/10 px-4 py-2 rounded-lg">{error}</p>
          <Link
            href="/portal/admin/news"
            className="text-[#84cc16] mt-4 inline-block"
          >
            &larr; Back to list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/portal/admin/news"
            className="inline-flex items-center text-sm text-white/70 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to News List
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Edit Article</h1>
            {statusBadge}
          </div>
        </div>

        {/* Image preview */}
        {form.image_url && (
          <div className="mb-6 rounded-2xl overflow-hidden">
            <img
              src={form.image_url}
              alt=""
              className="w-full h-56 object-cover rounded-2xl"
            />
          </div>
        )}

        {/* Form */}
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#84cc16]"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Slug</label>
            <input
              type="text"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#84cc16]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#84cc16] appearance-none"
            >
              <option value="" disabled className="bg-[#0a0a0a]">
                Select category
              </option>
              {NEWS_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0a0a0a]">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Excerpt</label>
            <textarea
              name="excerpt"
              rows={3}
              value={form.excerpt}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#84cc16] resize-none"
            />
          </div>

          {/* Meta Title */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Meta Title</label>
            <input
              type="text"
              name="meta_title"
              value={form.meta_title}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#84cc16]"
            />
          </div>

          {/* Meta Description */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              Meta Description
            </label>
            <textarea
              name="meta_description"
              rows={2}
              value={form.meta_description}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#84cc16] resize-none"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Image URL</label>
            <input
              type="text"
              name="image_url"
              value={form.image_url}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#84cc16]"
            />
          </div>

          {/* Content (Markdown) */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              Content (Markdown)
            </label>
            <textarea
              name="content"
              rows={18}
              value={form.content}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#84cc16] resize-y"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => save()}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 bg-[#84cc16] hover:bg-[#a3e635] text-black rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </button>
            {saved && <span className="text-sm text-green-400">Saved</span>}
            {error && <span className="text-sm text-red-400">{error}</span>}

            <div className="flex-1" />

            {/* Approve */}
            <button
              type="button"
              onClick={approve}
              className="inline-flex items-center px-4 py-2 rounded-xl border border-green-400 text-green-400 hover:bg-green-400/10 transition-colors"
            >
              <Check className="w-4 h-4 mr-2" />
              Approve for Publishing
            </button>

            {/* Discard */}
            <button
              type="button"
              onClick={discard}
              className="inline-flex items-center px-4 py-2 rounded-xl border border-red-400 text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Discard
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-400/5 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}