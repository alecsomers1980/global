"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("posts")
      .insert({ title, slug: slugify(title), content: "" })
      .select("id")
      .single();
    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    router.push(`/admin/blog/${data.id}`);
  };

  return (
    <div>
      <h1 className="text-2xl font-heading text-maroon mb-6">New post</h1>
      <form onSubmit={handleCreate} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm text-ink mb-1">Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-maroon"
          />
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-maroon text-white px-5 py-2.5 text-sm font-semibold hover:bg-maroon/90 disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create draft"}
        </button>
      </form>
    </div>
  );
}
