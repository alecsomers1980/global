"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllPostsAdmin, updatePost, deletePost } from "@/lib/admin/blog";
import type { BlogPost } from "@/lib/types";

const STATUS_LABEL: Record<BlogPost["status"], string> = {
  draft: "Draft",
  approved: "Approved",
  published: "Published",
  discarded: "Discarded",
};

const STATUS_STYLE: Record<BlogPost["status"], string> = {
  draft: "bg-sand/50 text-muted",
  approved: "bg-olive/15 text-olive-deep",
  published: "bg-terracotta/15 text-terracotta-deep",
  discarded: "bg-line text-muted",
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | BlogPost["status"]>("all");

  const load = () => {
    setLoading(true);
    getAllPostsAdmin().then((p) => {
      setPosts(p);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/admin/blog/generate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (id: string) => {
    await updatePost(id, { status: "approved" });
    load();
  };

  const handleDiscard = async (id: string) => {
    await updatePost(id, { status: "discarded" });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post permanently?")) return;
    await deletePost(id);
    load();
  };

  const filtered = filter === "all" ? posts : posts.filter((p) => p.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Blog</h1>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="rounded-full bg-terracotta text-white px-5 py-2 text-sm font-semibold hover:bg-terracotta-deep transition-colors disabled:opacity-50"
        >
          {generating ? "Generating…" : "Generate a draft now"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-2 text-sm">
        {(["all", "draft", "approved", "published", "discarded"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 transition-colors ${
              filter === s ? "bg-terracotta text-white" : "bg-white border border-line text-ink hover:bg-surface"
            }`}
          >
            {s === "all" ? "All" : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted">No posts yet.</p>
      ) : (
        <div className="rounded-xl border border-line bg-white divide-y divide-line">
          {filtered.map((post) => (
            <div key={post.id} className="flex items-center justify-between px-5 py-4 gap-4">
              <Link href={`/admin/blog/${post.id}`} className="min-w-0 flex-1 hover:underline">
                <p className="text-ink font-medium truncate">{post.title}</p>
                <p className="text-muted text-xs">{post.category}</p>
              </Link>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS_STYLE[post.status]}`}>
                {STATUS_LABEL[post.status]}
              </span>
              <div className="flex gap-2 shrink-0">
                {post.status === "draft" && (
                  <button
                    onClick={() => handleApprove(post.id)}
                    className="text-xs text-olive-deep hover:underline"
                  >
                    Approve
                  </button>
                )}
                {post.status !== "discarded" && post.status !== "published" && (
                  <button onClick={() => handleDiscard(post.id)} className="text-xs text-muted hover:underline">
                    Discard
                  </button>
                )}
                <button onClick={() => handleDelete(post.id)} className="text-xs text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}