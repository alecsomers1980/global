'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, Send, Loader2, Upload, Sparkles, Trash2, X, Film, Eye, Scissors, Clapperboard,
} from 'lucide-react';
import { uploadProjectMedia, uploadLargeMedia } from '@/lib/project-media-upload';

const MAX_CLIPS = 20;

const CATEGORY_SUGGESTIONS = [
  'Billboards', 'Building wraps', 'Bulk orders & screen printing',
  'Fleet maintenance & branding', 'Promo Items', 'Wall art',
  'Set building & strike', '3D Renders', 'Tangible Visual Texture',
  'Plant/Mines Regulatory Signs', 'Site Activations', 'Vehicle Branding',
  'Shopfront & Fascia Signs',
];

export interface ProjectFormState {
  title: string;
  slug: string;
  client: string;
  location: string;
  category: string;
  summary: string;
  meta_title: string;
  meta_description: string;
  content: string;
  cover_image_url: string;
  reel_url: string;
  gallery: string[];
  clips: string[];
  status: string;
}

const EMPTY: ProjectFormState = {
  title: '', slug: '', client: '', location: '', category: '', summary: '',
  meta_title: '', meta_description: '', content: '', cover_image_url: '',
  reel_url: '', gallery: [], clips: [], status: 'DRAFT',
};

const inputCls =
  'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#84cc16]';
const labelCls = 'block text-sm font-medium text-white/70 mb-1';

export default function ProjectForm({
  mode,
  projectId,
  initial,
}: {
  mode: 'new' | 'edit';
  projectId?: string;
  initial?: Partial<ProjectFormState>;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProjectFormState>({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingReel, setUploadingReel] = useState(false);
  const [uploadingClips, setUploadingClips] = useState(false);
  const [clipProgress, setClipProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Stable key for organising this project's uploads in storage (id when editing).
  const [projectKey] = useState(() => projectId || 'draft-' + Math.random().toString(36).slice(2, 10));

  function set<K extends keyof ProjectFormState>(key: K, value: ProjectFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function optimise() {
    if (!form.title.trim()) {
      setError('Add a project title first, then optimise.');
      return;
    }
    setOptimizing(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch('/api/portal/admin/projects/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          client: form.client,
          location: form.location,
          category: form.category,
          content: form.content,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Optimisation failed');
      const o = data.optimized;
      setForm((prev) => ({
        ...prev,
        summary: o.summary || prev.summary,
        meta_title: o.meta_title || prev.meta_title,
        meta_description: o.meta_description || prev.meta_description,
        content: o.body_md || prev.content,
      }));
      setNotice('AI rewrote the write-up, summary and meta tags. Review, then save.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setOptimizing(false);
    }
  }

  async function onCoverFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    setError(null);
    try {
      const url = await uploadProjectMedia(file);
      set('cover_image_url', url);
    } catch (err: any) {
      setError(err.message || 'Cover upload failed');
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  }

  async function onGalleryFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadingGallery(true);
    setError(null);
    try {
      const urls: string[] = [];
      for (const file of files) {
        urls.push(await uploadProjectMedia(file));
      }
      setForm((prev) => ({ ...prev, gallery: [...prev.gallery, ...urls] }));
    } catch (err: any) {
      setError(err.message || 'Gallery upload failed');
    } finally {
      setUploadingGallery(false);
      e.target.value = '';
    }
  }

  function removeGalleryItem(url: string) {
    setForm((prev) => ({ ...prev, gallery: prev.gallery.filter((u) => u !== url) }));
  }

  // Full finished video → uploaded straight to Supabase (signed URL), sets reel_url.
  async function onFullVideoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingReel(true);
    setError(null);
    try {
      const url = await uploadLargeMedia(file, 'reels', projectKey);
      set('reel_url', url);
    } catch (err: any) {
      setError(err.message || 'Video upload failed');
    } finally {
      setUploadingReel(false);
      e.target.value = '';
    }
  }

  // Raw clips to be stitched later on the render station.
  async function onClipsFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const room = MAX_CLIPS - form.clips.length;
    if (room <= 0) {
      setError(`You can upload at most ${MAX_CLIPS} clips.`);
      e.target.value = '';
      return;
    }
    const toUpload = files.slice(0, room);
    setUploadingClips(true);
    setError(null);
    setClipProgress({ done: 0, total: toUpload.length });
    try {
      const urls: string[] = [];
      for (let i = 0; i < toUpload.length; i++) {
        urls.push(await uploadLargeMedia(toUpload[i], 'clips', projectKey));
        setClipProgress({ done: i + 1, total: toUpload.length });
      }
      setForm((prev) => ({ ...prev, clips: [...prev.clips, ...urls] }));
      if (files.length > room) {
        setNotice(`Added ${room} clips (max ${MAX_CLIPS}). The rest were skipped.`);
      }
    } catch (err: any) {
      setError(err.message || 'Clip upload failed');
    } finally {
      setUploadingClips(false);
      setClipProgress(null);
      e.target.value = '';
    }
  }

  function removeClip(url: string) {
    setForm((prev) => ({ ...prev, clips: prev.clips.filter((u) => u !== url) }));
  }

  async function save(status: string) {
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = { ...form, status };
      const res = await fetch(
        mode === 'new'
          ? '/api/portal/admin/projects'
          : `/api/portal/admin/projects/${projectId}`,
        {
          method: mode === 'new' ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save project');
      }
      router.push('/portal/admin/projects');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm('Delete this project permanently?')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/portal/admin/projects/${projectId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      router.push('/portal/admin/projects');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/portal/admin/projects"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white/90 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-3xl font-bold">
            {mode === 'new' ? 'New Project' : 'Edit Project'}
          </h1>
          {mode === 'edit' && form.status === 'PUBLISHED' && (
            <a
              href={`/projects/${form.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
            >
              <Eye className="w-4 h-4" /> View live
            </a>
          )}
        </div>
        <p className="text-white/50 mt-1 mb-8">
          Add the details, then let AI optimise the write-up for SEO, local (GEO) and AI search.
        </p>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          {/* Title */}
          <div>
            <label htmlFor="title" className={labelCls}>Title *</label>
            <input id="title" name="title" type="text" value={form.title}
              onChange={handleChange} className={inputCls} placeholder="e.g. Genesis Fleet Branding" />
          </div>

          {/* Client + Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="client" className={labelCls}>Client</label>
              <input id="client" name="client" type="text" value={form.client}
                onChange={handleChange} className={inputCls} placeholder="Client / company name" />
            </div>
            <div>
              <label htmlFor="location" className={labelCls}>Location</label>
              <input id="location" name="location" type="text" value={form.location}
                onChange={handleChange} className={inputCls} placeholder="e.g. Midrand, Gauteng" />
            </div>
          </div>

          {/* Category + Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="category" className={labelCls}>Category</label>
              <input id="category" name="category" type="text" list="cat-suggestions"
                value={form.category} onChange={handleChange} className={inputCls}
                placeholder="e.g. Fleet Branding" />
              <datalist id="cat-suggestions">
                {CATEGORY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <label htmlFor="slug" className={labelCls}>Slug</label>
              <input id="slug" name="slug" type="text" value={form.slug}
                onChange={handleChange} className={inputCls} placeholder="auto from title (optional)" />
            </div>
          </div>

          {/* Write-up + AI optimise */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="content" className={labelCls + ' mb-0'}>
                Project write-up (Markdown)
              </label>
              <button type="button" onClick={optimise} disabled={optimizing}
                className="inline-flex items-center gap-2 bg-white/5 border border-[#84cc16]/40 text-[#84cc16] hover:bg-[#84cc16]/10 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60">
                {optimizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {optimizing ? 'Optimising…' : 'Optimise for SEO / GEO / AI search'}
              </button>
            </div>
            <textarea id="content" name="content" rows={14} value={form.content}
              onChange={handleChange} className={inputCls + ' font-mono text-sm'}
              placeholder="Paste your rough notes about the project here, then click Optimise — or write the final Markdown yourself." />
          </div>

          {/* Summary */}
          <div>
            <label htmlFor="summary" className={labelCls}>Summary (card blurb)</label>
            <textarea id="summary" name="summary" rows={2} value={form.summary}
              onChange={handleChange} className={inputCls} placeholder="One-line description shown on the projects grid" />
          </div>

          {/* Meta */}
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label htmlFor="meta_title" className={labelCls}>Meta Title (SEO)</label>
              <input id="meta_title" name="meta_title" type="text" value={form.meta_title}
                onChange={handleChange} className={inputCls} placeholder="Search-engine title" />
            </div>
            <div>
              <label htmlFor="meta_description" className={labelCls}>Meta Description (SEO)</label>
              <textarea id="meta_description" name="meta_description" rows={2} value={form.meta_description}
                onChange={handleChange} className={inputCls} placeholder="Search-engine description" />
            </div>
          </div>

          {/* Cinematic reel */}
          <div className="border-t border-white/10 pt-5">
            <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2 mb-1">
              <Film className="w-4 h-4" /> Cinematic reel
            </h3>
            <p className="text-xs text-white/40 mb-3">
              Two ways: upload the short clips filmed on site and we stitch them into one
              cinematic reel on the render station — or upload a finished video / paste a URL.
            </p>

            {/* Option 1 — clips to stitch */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-white/80">
                  <Scissors className="w-4 h-4 text-[#84cc16]" />
                  Clips to stitch <span className="text-white/40">({form.clips.length}/{MAX_CLIPS})</span>
                </div>
                <label className="inline-flex items-center gap-2 cursor-pointer bg-[#84cc16] hover:bg-[#a3e635] text-black rounded-lg px-3 py-1.5 text-xs font-medium transition-colors">
                  {uploadingClips ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  {uploadingClips
                    ? clipProgress ? `Uploading ${clipProgress.done}/${clipProgress.total}…` : 'Uploading…'
                    : 'Add clips'}
                  <input type="file" accept="video/*" multiple onChange={onClipsFiles}
                    disabled={uploadingClips || form.clips.length >= MAX_CLIPS} className="hidden" />
                </label>
              </div>
              {form.clips.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {form.clips.map((url, i) => (
                    <li key={url} className="flex items-center justify-between gap-2 text-xs text-white/60 bg-black/20 rounded-lg px-3 py-1.5">
                      <span className="flex items-center gap-2 truncate">
                        <Clapperboard className="w-3.5 h-3.5 shrink-0" /> Clip {i + 1}
                      </span>
                      <button type="button" onClick={() => removeClip(url)} className="text-red-400 hover:text-red-300 shrink-0" title="Remove">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {form.clips.length > 0 && !form.reel_url && (
                <p className="text-[11px] text-amber-400/80 mt-3">
                  ⏳ Reel will be generated from these clips on the render station, then it appears here.
                </p>
              )}
            </div>

            {/* Option 2 — finished video / URL */}
            <label htmlFor="reel_url" className={labelCls}>Or a finished reel (upload video / paste URL)</label>
            <input id="reel_url" name="reel_url" type="text" value={form.reel_url}
              onChange={handleChange} className={inputCls} placeholder="https://…/reel.mp4" />
            <div className="mt-2">
              <label className="inline-flex items-center gap-2 cursor-pointer bg-white/5 border border-white/10 hover:border-[#84cc16]/40 text-white/80 rounded-xl px-3 py-2 text-sm transition-colors">
                {uploadingReel ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploadingReel ? 'Uploading…' : 'Upload finished video'}
                <input type="file" accept="video/*" onChange={onFullVideoFile} disabled={uploadingReel} className="hidden" />
              </label>
            </div>
            {form.reel_url && (
              <video src={form.reel_url} controls muted className="w-full max-h-72 rounded-2xl mt-3 bg-black" />
            )}
          </div>

          {/* Cover image */}
          <div>
            <label htmlFor="cover_image_url" className={labelCls}>Cover image</label>
            <input id="cover_image_url" name="cover_image_url" type="text" value={form.cover_image_url}
              onChange={handleChange} className={inputCls} placeholder="Paste an image URL, or upload below" />
            <div className="mt-2">
              <label className="inline-flex items-center gap-2 cursor-pointer bg-white/5 border border-white/10 hover:border-[#84cc16]/40 text-white/80 rounded-xl px-3 py-2 text-sm transition-colors">
                {uploadingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploadingCover ? 'Uploading…' : 'Upload cover'}
                <input type="file" accept="image/*" onChange={onCoverFile} disabled={uploadingCover} className="hidden" />
              </label>
            </div>
            {form.cover_image_url && (
              <img src={form.cover_image_url} alt="" className="w-full h-56 object-cover rounded-2xl mt-3" />
            )}
          </div>

          {/* Gallery */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={labelCls + ' mb-0'}>Gallery images</label>
              <label className="inline-flex items-center gap-2 cursor-pointer bg-white/5 border border-white/10 hover:border-[#84cc16]/40 text-white/80 rounded-lg px-3 py-1.5 text-xs transition-colors">
                {uploadingGallery ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {uploadingGallery ? 'Uploading…' : 'Add images'}
                <input type="file" accept="image/*" multiple onChange={onGalleryFiles} disabled={uploadingGallery} className="hidden" />
              </label>
            </div>
            {form.gallery.length === 0 ? (
              <p className="text-xs text-white/40">No gallery images yet.</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {form.gallery.map((url) => (
                  <div key={url} className="relative group aspect-square rounded-xl overflow-hidden bg-white/5">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeGalleryItem(url)}
                      className="absolute top-1 right-1 bg-black/70 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Messages */}
          {notice && <p className="text-sm text-[#84cc16] bg-[#84cc16]/10 px-3 py-2 rounded-lg">{notice}</p>}
          {error && <p className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
            {mode === 'new' ? (
              <>
                <button type="button" onClick={() => save('DRAFT')} disabled={saving}
                  className="inline-flex items-center gap-2 bg-[#84cc16] hover:bg-[#a3e635] text-black rounded-xl font-medium px-4 py-2 disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save as Draft
                </button>
                <button type="button" onClick={() => save('PUBLISHED')} disabled={saving}
                  className="inline-flex items-center gap-2 border border-green-400 text-green-400 hover:bg-green-400/10 rounded-xl px-4 py-2 disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Publish Now
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => save(form.status)} disabled={saving}
                  className="inline-flex items-center gap-2 bg-[#84cc16] hover:bg-[#a3e635] text-black rounded-xl font-medium px-4 py-2 disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
                {form.status === 'PUBLISHED' ? (
                  <button type="button" onClick={() => save('DRAFT')} disabled={saving}
                    className="inline-flex items-center gap-2 border border-white/20 text-white/70 hover:bg-white/5 rounded-xl px-4 py-2 disabled:opacity-50">
                    Unpublish
                  </button>
                ) : (
                  <button type="button" onClick={() => save('PUBLISHED')} disabled={saving}
                    className="inline-flex items-center gap-2 border border-green-400 text-green-400 hover:bg-green-400/10 rounded-xl px-4 py-2 disabled:opacity-50">
                    <Send className="w-4 h-4" /> Publish
                  </button>
                )}
                <button type="button" onClick={remove} disabled={saving}
                  className="inline-flex items-center gap-2 text-red-400 hover:bg-red-400/5 rounded-xl px-4 py-2 ml-auto disabled:opacity-50">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
