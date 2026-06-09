"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, FileText, Eye, EyeOff, Sparkles, Loader2 } from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string | null;
  category: string;
  published: boolean;
  created_at: string;
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genCategory, setGenCategory] = useState("HVAC Tips");
  const [genStatus, setGenStatus] = useState("");

  const fetchArticles = () => {
    fetch("/api/articles?published=false&limit=50")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setArticles(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchArticles(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenStatus("Generating...");
    try {
      const res = await fetch("/api/admin/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: genCategory }),
      });
      const data = await res.json();
      if (data.success) {
        setGenStatus(`Generated: "${data.article.title}"`);
        fetchArticles();
        setTimeout(() => setGenStatus(""), 6000);
      } else {
        setGenStatus(`Error: ${data.error || "Failed"}`);
        setTimeout(() => setGenStatus(""), 4000);
      }
    } catch {
      setGenStatus("Failed to generate");
      setTimeout(() => setGenStatus(""), 4000);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Delete this article?")) return;
    await fetch(`/api/articles/${slug}`, { method: "DELETE" });
    fetchArticles();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-teal border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-navy">Articles</h1>
            <p className="text-sm text-brand-navy/50">{articles.length} articles</p>
          </div>
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 rounded-full bg-brand-teal px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-teal/90 hover:shadow-lg"
          >
            <Plus className="h-4 w-4" />
            New Article
          </Link>
        </div>

        {/* Generate Article Bar */}
        <div className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-brand-teal/20 bg-brand-sky/10 p-3">
          <Sparkles className="h-5 w-5 flex-shrink-0 text-brand-teal" />
          <span className="text-sm text-brand-navy/60 hidden sm:inline">Auto-generate:</span>
          <select
            value={genCategory}
            onChange={(e) => setGenCategory(e.target.value)}
            className="rounded-full border border-brand-teal/20 bg-white px-3 py-1.5 text-xs font-medium text-brand-navy focus:outline-none"
          >
            <option>HVAC Tips</option>
            <option>Energy Efficiency</option>
            <option>Maintenance</option>
            <option>Industry News</option>
            <option>Buying Guide</option>
          </select>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-full bg-brand-teal px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-teal/90 hover:shadow-lg disabled:opacity-50"
          >
            {generating ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
            ) : (
              <><Sparkles className="h-4 w-4" />Generate AI Article</>
            )}
          </button>
          {genStatus && (
            <span className={`text-xs font-medium ${genStatus.startsWith("Error") || genStatus.startsWith("Failed") ? "text-red-500" : "text-emerald-600"}`}>
              {genStatus}
            </span>
          )}
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="rounded-2xl border bg-white py-24 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-brand-navy/20" />
          <p className="text-brand-navy/40">No articles yet. Write your first one.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {articles.map((article) => (
            <div
              key={article.id}
              className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:shadow-md"
            >
              <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {article.image ? (
                  <img src={article.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FileText className="h-6 w-6 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-brand-navy truncate">{article.title}</h3>
                  {article.published ? (
                    <Eye className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                  )}
                </div>
                <p className="text-sm text-brand-navy/50 truncate">
                  {article.category} · {new Date(article.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <Link
                  href={`/news/${article.slug}`}
                  target="_blank"
                  className="rounded-full px-3 py-1.5 text-xs font-medium text-brand-navy/40 transition-colors hover:bg-gray-100"
                >
                  View
                </Link>
                <Link
                  href={`/admin/articles/${article.slug}`}
                  className="rounded-full p-2 text-brand-navy/40 transition-colors hover:bg-gray-100 hover:text-brand-teal"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDelete(article.slug)}
                  className="rounded-full p-2 text-brand-navy/40 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
