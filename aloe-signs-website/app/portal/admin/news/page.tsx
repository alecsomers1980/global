'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Trash2, Check, X, Newspaper, Eye, Plus, Sparkles, Loader2 } from 'lucide-react';
import { NEWS_CATEGORIES } from '@/lib/news-categories';

type NewsPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  status: string;
  image_url: string | null;
  scheduled_for: string | null;
  published_at: string | null;
  created_at: string;
};

const STATUS_BADGES: Record<string, { classes: string; label: string }> = {
  DRAFT: {
    classes: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    label: 'Awaiting Review',
  },
  APPROVED: {
    classes: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    label: 'Approved · Scheduled',
  },
  PUBLISHED: {
    classes: 'bg-green-400/10 text-green-400 border-green-400/20',
    label: 'Published',
  },
  DISCARDED: {
    classes: 'bg-red-400/10 text-red-400 border-red-400/20',
    label: 'Discarded',
  },
};

export default function NewsListPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genCategory, setGenCategory] = useState('');

  const generateWithAI = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/portal/admin/news/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(genCategory ? { category: genCategory } : {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      // Land in the editor to review the fresh draft
      router.push(`/portal/admin/news/${data.post.id}`);
    } catch (err: any) {
      alert(err.message);
      setGenerating(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/portal/admin/news');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setPosts(data.posts);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const setStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/portal/admin/news/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      await fetchPosts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      const res = await fetch(`/api/portal/admin/news/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/portal/admin"
              className="inline-flex items-center text-sm text-white/70 hover:text-white transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Admin
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Newspaper className="w-7 h-7 text-[#84cc16]" />
              News & Blog
            </h1>
            <p className="text-white/60 mt-1">Review, approve and publish articles.</p>
          </div>
          <div className="flex flex-col sm:items-end gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={genCategory}
                onChange={(e) => setGenCategory(e.target.value)}
                disabled={generating}
                title="Topic for AI generation"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#84cc16] disabled:opacity-50"
              >
                <option value="" className="bg-[#0a0a0a]">Auto topic</option>
                {NEWS_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#0a0a0a]">
                    {cat}
                  </option>
                ))}
              </select>
              <button
                onClick={generateWithAI}
                disabled={generating}
                className="inline-flex items-center gap-2 bg-white/5 border border-[#84cc16]/40 text-[#84cc16] hover:bg-[#84cc16]/10 font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-60"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {generating ? 'Generating…' : 'Generate with AI'}
              </button>
              <Link
                href="/portal/admin/news/new"
                className="inline-flex items-center gap-2 bg-[#84cc16] hover:bg-[#a3e635] text-black font-medium px-4 py-2 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Article
              </Link>
            </div>
            <p className="text-xs text-white/50 max-w-xs sm:text-right">
              Drafts are also generated automatically on the 1st of each month and emailed for approval.
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#84cc16] border-t-transparent" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex justify-center py-20">
            <p className="text-red-400 bg-red-400/10 px-4 py-2 rounded-lg">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-20 text-white/60">
            <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No articles yet.</p>
          </div>
        )}

        {/* Posts */}
        {!loading && !error && posts.length > 0 && (
          <div className="space-y-4">
            {posts.map((post) => {
              const badge = STATUS_BADGES[post.status] || {
                classes: 'bg-white/10 text-white/80 border-white/20',
                label: post.status,
              };
              const scheduledDate = post.scheduled_for
                ? formatDate(post.scheduled_for)
                : null;
              const publishedDate = post.published_at
                ? formatDate(post.published_at)
                : null;

              return (
                <div
                  key={post.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 group"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-white/5">
                    {post.image_url ? (
                      <img
                        src={post.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20">
                        <Newspaper className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">{post.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-white/50">
                      {post.category && (
                        <span className="bg-white/5 px-1.5 py-0.5 rounded text-xs">
                          {post.category}
                        </span>
                      )}
                      {scheduledDate && <span>· {scheduledDate}</span>}
                      {publishedDate && !scheduledDate && <span>· {publishedDate}</span>}
                    </div>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badge.classes}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {post.status === 'DRAFT' && (
                      <>
                        <button
                          onClick={() => setStatus(post.id, 'APPROVED')}
                          className="p-2 rounded-xl bg-[#84cc16] hover:bg-[#a3e635] text-black transition-colors"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setStatus(post.id, 'DISCARDED')}
                          className="p-2 rounded-xl border border-white/20 text-white/70 hover:bg-white/5 transition-colors"
                          title="Discard"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <Link
                      href={`/portal/admin/news/${post.id}`}
                      className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    {post.status === 'PUBLISHED' && (
                      <a
                        href={`/news/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                        title="View live"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-400/5 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}