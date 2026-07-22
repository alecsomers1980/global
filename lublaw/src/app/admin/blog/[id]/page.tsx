"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  status: "draft" | "published";
};

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("posts")
      .select("id,title,slug,excerpt,content,featured_image,status")
      .eq("id", id)
      .single()
      .then(({ data }) => setPost(data as Post));
  }, [id]);

  const handleSave = async (statusOverride?: "draft" | "published") => {
    if (!post) return;
    setSaving(true);
    setError("");
    const supabase = createClient();
    const status = statusOverride ?? post.status;
    const { error: updateError } = await supabase
      .from("posts")
      .update({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        featured_image: post.featured_image,
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
      })
      .eq("id", id);
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setPost({ ...post, status });
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    const supabase = createClient();
    await supabase.from("posts").delete().eq("id", id);
    router.push("/admin/blog");
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload-image", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);
    if (data.ok && post) {
      setPost({ ...post, featured_image: data.url });
    } else {
      setError(data.error ?? "Upload failed.");
    }
  };

  if (!post) return <p className="text-muted">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading text-maroon">Edit post</h1>
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
            post.status === "published" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
          }`}
        >
          {post.status}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-ink mb-1">Title</label>
          <input
            value={post.title}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block text-sm text-ink mb-1">Slug</label>
          <input
            value={post.slug}
            onChange={(e) => setPost({ ...post, slug: e.target.value })}
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block text-sm text-ink mb-1">Excerpt</label>
          <textarea
            rows={2}
            value={post.excerpt}
            onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-maroon"
          />
        </div>
        <div>
          <label className="block text-sm text-ink mb-1">Content (Markdown)</label>
          <textarea
            rows={14}
            value={post.content}
            onChange={(e) => setPost({ ...post, content: e.target.value })}
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-maroon font-mono"
          />
        </div>
        <div>
          <label className="block text-sm text-ink mb-1">Featured image</label>
          {post.featured_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.featured_image} alt="" className="w-40 h-24 object-cover rounded-lg mb-2" />
          )}
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="rounded-full bg-white border border-maroon text-maroon px-5 py-2.5 text-sm font-semibold hover:bg-surface disabled:opacity-50"
          >
            Save
          </button>
          {post.status === "draft" ? (
            <button
              onClick={() => handleSave("published")}
              disabled={saving}
              className="rounded-full bg-maroon text-white px-5 py-2.5 text-sm font-semibold hover:bg-maroon/90 disabled:opacity-50"
            >
              Publish
            </button>
          ) : (
            <button
              onClick={() => handleSave("draft")}
              disabled={saving}
              className="rounded-full bg-ink text-white px-5 py-2.5 text-sm font-semibold hover:bg-ink/90 disabled:opacity-50"
            >
              Unpublish
            </button>
          )}
          <button
            onClick={handleDelete}
            className="ml-auto rounded-full text-red-600 px-5 py-2.5 text-sm font-semibold hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
