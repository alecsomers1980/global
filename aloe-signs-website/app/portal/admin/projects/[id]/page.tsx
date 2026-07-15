'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import ProjectForm, { type ProjectFormState } from '../ProjectForm';

export default function EditProjectPage() {
  const params = useParams();
  const id = params.id as string;
  const [initial, setInitial] = useState<Partial<ProjectFormState> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/portal/admin/projects/${id}`);
        if (!res.ok) throw new Error('Failed to load project');
        const { project } = await res.json();
        setInitial({
          title: project.title || '',
          slug: project.slug || '',
          client: project.client || '',
          location: project.location || '',
          category: project.category || '',
          summary: project.summary || '',
          meta_title: project.meta_title || '',
          meta_description: project.meta_description || '',
          content: project.content || '',
          cover_image_url: project.cover_image_url || '',
          reel_url: project.reel_url || '',
          gallery: Array.isArray(project.gallery) ? project.gallery : [],
          clips: Array.isArray(project.clips) ? project.clips : [],
          status: project.status || 'DRAFT',
        });
      } catch (err: any) {
        setError(err.message);
      }
    })();
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <p className="text-red-400 bg-red-400/10 px-4 py-2 rounded-lg">{error}</p>
      </div>
    );
  }

  if (!initial) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#84cc16]" />
      </div>
    );
  }

  return <ProjectForm mode="edit" projectId={id} initial={initial} />;
}
