"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";

interface Project {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  location: string | null;
  year: string | null;
  equipment: string | null;
  client: string | null;
  sector: string;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = () => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProjects(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleDelete = async (slug: string) => {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/projects/${slug}`, { method: "DELETE" });
    fetchProjects();
  };

  const sectorColors: Record<string, string> = {
    Commercial: "bg-blue-100 text-blue-700",
    Industrial: "bg-amber-100 text-amber-700",
    Residential: "bg-emerald-100 text-emerald-700",
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Projects</h1>
          <p className="text-sm text-brand-navy/50">{projects.length} projects</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 rounded-full bg-brand-teal px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-teal/90 hover:shadow-lg"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border bg-white py-24 text-center">
          <Building2 className="mx-auto mb-4 h-12 w-12 text-brand-navy/20" />
          <p className="text-brand-navy/40">No projects yet. Add your first one.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <div
              key={project.slug}
              className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:shadow-md"
            >
              <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {project.image ? (
                  <img
                    src={project.image}
                    alt={project.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Building2 className="h-6 w-6 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-brand-navy truncate">{project.name}</h3>
                <p className="text-sm text-brand-navy/50 truncate">
                  {project.location || project.sector} {project.year ? `· ${project.year}` : ""}
                </p>
              </div>
              <span
                className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                  sectorColors[project.sector] || "bg-gray-100 text-gray-600"
                }`}
              >
                {project.sector}
              </span>
              <div className="flex flex-shrink-0 items-center gap-2">
                <Link
                  href={`/admin/projects/${project.slug}`}
                  className="rounded-full p-2 text-brand-navy/40 transition-colors hover:bg-gray-100 hover:text-brand-teal"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleDelete(project.slug)}
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
