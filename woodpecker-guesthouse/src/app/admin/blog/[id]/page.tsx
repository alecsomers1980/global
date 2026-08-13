"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPostByIdAdmin, updatePost } from "@/lib/admin/blog";
import { BLOG_CATEGORIES } from "@/lib/blog/categories";
import type { BlogPost } from "@/lib/types";

export default function AdminBlogEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getPostByIdAdmin(params.id).then(setPost);
  }, [params.id]);

  if (!post) return <p className="text-muted">Loading…</p>;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    const { error: updateError } = await updatePost(post.id, {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      meta_title: post.meta_title,
      meta_description: post.meta_description,
      content: post.content,
      category: post.category,
      hero_image: post.hero_image,
      status: post.status,
    });
    setSaving(false);
    if (updateError) setError(updateError);
    else {
      setSaved(true);
      router.refresh();
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display text-2xl text-ink">{post.title}</h1>
      <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-line bg-white p-6">
        <div>
          <label className="block text-sm text-ink mb-1">Title</label>
          <input
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
            value={post.title}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-ink mb-1">Slug</label>
          <input
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
            value={post.slug}
            onChange={(e) => setPost({ ...post, slug: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-ink mb-1">Excerpt</label>
          <textarea
            rows={2}
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta resize-y"
            value={post.excerpt}
            onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-ink mb-1">Meta title</label>
            <input
              className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
              value={post.meta_title}
              onChange={(e) => setPost({ ...post, meta_title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-ink mb-1">Category</label>
            <select
              className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
              value={post.category}
              onChange={(e) => setPost({ ...post, category: e.target.value })}
            >
              {BLOG_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-ink mb-1">Meta description</label>
          <textarea
            rows={2}
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta resize-y"
            value={post.meta_description}
            onChange={(e) => setPost({ ...post, meta_description: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-ink mb-1">Content (Markdown)</label>
          <textarea
            rows={16}
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta resize-y font-mono"
            value={post.content}
            onChange={(e) => setPost({ ...post, content: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-ink mb-1">Hero image URL</label>
          <input
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
            placeholder="Uploaded via the Gallery admin, or paste a site-media URL"
            value={post.hero_image ?? ""}
            onChange={(e) => setPost({ ...post, hero_image: e.target.value || null })}
          />
        </div>
        <div>
          <label className="block text-sm text-ink mb-1">Status</label>
          <select
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-terracotta"
            value={post.status}
            onChange={(e) => setPost({ ...post, status: e.target.value as BlogPost["status"] })}
          >
            <option value="draft">Draft</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
            <option value="discarded">Discarded</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        {saved && <p className="text-sm text-olive-deep bg-olive/10 rounded-lg px-3 py-2">Saved.</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-terracotta text-white px-6 py-2.5 text-sm font-semibold hover:bg-terracotta-deep transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}