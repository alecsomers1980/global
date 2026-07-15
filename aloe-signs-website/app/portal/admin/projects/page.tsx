'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Pencil, Trash2, Eye, Plus, Image as ImageIcon, Film, FolderKanban } from 'lucide-react';

type Project = {
  id: string;
  title: string;
  slug: string;
  client: string | null;
  location: string | null;
  category: string | null;
  status: string;
  cover_image_url: string | null;
  reel_url: string | null;
  gallery: string[] | null;
  clips: string[] | null;
  published_at: string | null;
  created_at: string;
};

const STATUS_BADGES: Record<string, { classes: string; label: string }> = {
  DRAFT: { classes: 'bg-amber-400/10 text-amber-400 border-amber-400/20', label: 'Draft' },
  PUBLISHED: { classes: 'bg-green-400/10 text-green-400 border-green-400/20', label: 'Published' },
  DISCARDED: { classes: 'bg-red-400/10 text-red-400 border-red-400/20', label: 'Discarded' },
};

export default function ProjectsListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/portal/admin/projects');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setProjects(data.projects);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      const res = await fetch(`/api/portal/admin/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link href="/portal/admin" className="inline-flex items-center text-sm text-white/70 hover:text-white transition-colors mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Admin
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FolderKanban className="w-7 h-7 text-[#84cc16]" /> Projects
            </h1>
            <p className="text-white/60 mt-1">Showcase completed work — reels, galleries and case studies.</p>
          </div>
          <Link href="/portal/admin/projects/new"
            className="inline-flex items-center gap-2 bg-[#84cc16] hover:bg-[#a3e635] text-black font-medium px-4 py-2 rounded-xl transition-colors self-start">
            <Plus className="w-4 h-4" /> New Project
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#84cc16] border-t-transparent" />
          </div>
        )}
        {error && (
          <div className="flex justify-center py-20">
            <p className="text-red-400 bg-red-400/10 px-4 py-2 rounded-lg">{error}</p>
          </div>
        )}
        {!loading && !error && projects.length === 0 && (
          <div className="text-center py-20 text-white/60">
            <FolderKanban className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No projects yet. Create your first one.</p>
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="space-y-4">
            {projects.map((project) => {
              const badge = STATUS_BADGES[project.status] || {
                classes: 'bg-white/10 text-white/80 border-white/20', label: project.status,
              };
              const galleryCount = Array.isArray(project.gallery) ? project.gallery.length : 0;
              const clipCount = Array.isArray(project.clips) ? project.clips.length : 0;
              const reelPending = clipCount > 0 && !project.reel_url;
              return (
                <div key={project.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4">
                  <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-white/5">
                    {project.cover_image_url ? (
                      <img src={project.cover_image_url} alt="" className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">{project.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-white/50">
                      {project.client && <span>{project.client}</span>}
                      {project.category && <span className="bg-white/5 px-1.5 py-0.5 rounded text-xs">{project.category}</span>}
                      {project.reel_url && <span className="inline-flex items-center gap-1 text-xs"><Film className="w-3 h-3" /> Reel</span>}
                      {reelPending && <span className="inline-flex items-center gap-1 text-xs text-amber-400" title="Clips uploaded — run Render-Reels on the render station">⏳ Reel pending ({clipCount} clips)</span>}
                      {galleryCount > 0 && <span className="inline-flex items-center gap-1 text-xs"><ImageIcon className="w-3 h-3" /> {galleryCount}</span>}
                    </div>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${badge.classes}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/portal/admin/projects/${project.id}`}
                      className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    {project.status === 'PUBLISHED' && (
                      <a href={`/projects/${project.slug}`} target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors" title="View live">
                        <Eye className="w-4 h-4" />
                      </a>
                    )}
                    <button onClick={() => handleDelete(project.id)}
                      className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-400/5 transition-colors" title="Delete">
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
