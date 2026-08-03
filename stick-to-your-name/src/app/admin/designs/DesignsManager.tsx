'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Star, Upload, Save, X, Loader2 } from 'lucide-react';

/* ---------- types (mirrors API responses) ---------- */
interface DesignRow {
  id: string;
  name: string;
  popular: boolean;
  image_url: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
}

// form state for adding a new design
interface AddForm {
  name: string;
  slug: string;
  popular: boolean;
  active: boolean;
  sort_order: number;
  image_url: string | null;
  imagePreview: string | null;
}

export default function DesignsManager() {
  /* ---------- list state ---------- */
  const [designs, setDesigns] = useState<DesignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* ---------- add form ---------- */
  const [addForm, setAddForm] = useState<AddForm>({
    name: '',
    slug: '',
    popular: false,
    active: true,
    sort_order: 0,
    image_url: null,
    imagePreview: null,
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [uploading, setUploading] = useState(false);
  const addFileInputRef = useRef<HTMLInputElement>(null);

  /* ---------- edit state ---------- */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    popular: boolean;
    active: boolean;
    sort_order: number;
    image_url: string | null;
    imagePreview: string | null;
  } | null>(null);
  const [editUploading, setEditUploading] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  /* ---------- fetch designs ---------- */
  const fetchDesigns = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/designs');
      if (!res.ok) throw new Error('Failed to load designs');
      const data = await res.json();
      setDesigns(data.designs || []);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  /* ---------- slug auto‑generation ---------- */
  useEffect(() => {
    if (!slugManuallyEdited) {
      const auto = addForm.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      setAddForm(prev => ({ ...prev, slug: auto }));
    }
  }, [addForm.name, slugManuallyEdited]);

  /* ---------- image upload for add ---------- */
  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    // local preview
    const preview = URL.createObjectURL(file);
    setAddForm(prev => ({ ...prev, imagePreview: preview }));

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/designs/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const { url } = await res.json();
      setAddForm(prev => ({ ...prev, image_url: url }));
    } catch (err: any) {
      alert(err.message || 'Upload failed');
      // revert preview
      setAddForm(prev => ({ ...prev, imagePreview: null, image_url: null }));
      if (addFileInputRef.current) addFileInputRef.current.value = '';
    } finally {
      setUploading(false);
    }
  };

  /* ---------- add design ---------- */
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.slug) {
      alert('Name and slug are required');
      return;
    }
    try {
      const res = await fetch('/api/admin/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: addForm.slug,
          name: addForm.name,
          popular: addForm.popular,
          active: addForm.active,
          sort_order: addForm.sort_order,
          image_url: addForm.image_url,
        }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to add design');
      }
      // success: refetch and reset form
      await fetchDesigns();
      setAddForm({
        name: '',
        slug: '',
        popular: false,
        active: true,
        sort_order: 0,
        image_url: null,
        imagePreview: null,
      });
      setSlugManuallyEdited(false);
      if (addFileInputRef.current) addFileInputRef.current.value = '';
    } catch (err: any) {
      alert(err.message || 'Add failed');
    }
  };

  /* ---------- toggle popular ---------- */
  const togglePopular = async (id: string, current: boolean) => {
    const original = designs.find(d => d.id === id);
    if (!original) return;
    // optimistic update
    setDesigns(prev =>
      prev.map(d => (d.id === id ? { ...d, popular: !current } : d))
    );
    try {
      const res = await fetch('/api/admin/designs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, popular: !current }),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (err: any) {
      // revert
      setDesigns(prev =>
        prev.map(d => (d.id === id ? { ...d, popular: current } : d))
      );
      alert('Failed to update');
    }
  };

  /* ---------- toggle active ---------- */
  const toggleActive = async (id: string, current: boolean) => {
    const original = designs.find(d => d.id === id);
    if (!original) return;
    setDesigns(prev =>
      prev.map(d => (d.id === id ? { ...d, active: !current } : d))
    );
    try {
      const res = await fetch('/api/admin/designs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !current }),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (err: any) {
      setDesigns(prev =>
        prev.map(d => (d.id === id ? { ...d, active: current } : d))
      );
      alert('Failed to update');
    }
  };

  /* ---------- enter edit mode ---------- */
  const startEdit = (design: DesignRow) => {
    setEditingId(design.id);
    setEditForm({
      name: design.name,
      popular: design.popular,
      active: design.active,
      sort_order: design.sort_order,
      image_url: design.image_url,
      imagePreview: design.image_url || null,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  /* ---------- upload image in edit ---------- */
  const handleEditImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editForm) return;
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image');
      return;
    }
    const preview = URL.createObjectURL(file);
    setEditForm(prev => prev ? { ...prev, imagePreview: preview } : prev);
    setEditUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/designs/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const { url } = await res.json();
      setEditForm(prev => prev ? { ...prev, image_url: url } : prev);
    } catch (err: any) {
      alert(err.message || 'Upload failed');
      // revert preview to previous image_url if any
      setEditForm(prev =>
        prev ? { ...prev, imagePreview: prev.image_url } : prev
      );
    } finally {
      setEditUploading(false);
    }
  };

  /* ---------- save edit ---------- */
  const handleSaveEdit = async () => {
    if (!editingId || !editForm) return;
    if (!editForm.name) {
      alert('Name is required');
      return;
    }
    try {
      const res = await fetch('/api/admin/designs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          name: editForm.name,
          popular: editForm.popular,
          active: editForm.active,
          sort_order: editForm.sort_order,
          image_url: editForm.image_url,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchDesigns();
      cancelEdit();
    } catch (err: any) {
      alert(err.message || 'Save failed');
    }
  };

  /* ---------- delete design ---------- */
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this design? It cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/designs?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchDesigns();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  /* ---------- render helpers ---------- */
  const renderThumb = (imgUrl: string | null, name: string, size = 'h-16 w-16') => {
    if (imgUrl) {
      return (
        <img
          src={imgUrl}
          alt={name}
          className={`${size} rounded-lg object-cover border border-gray-200`}
        />
      );
    }
    return (
      <div className={`${size} rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xl`}>
        {name.charAt(0).toUpperCase()}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-brand-pink h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* -------------- Add New Design Card -------------- */}
      <form
        onSubmit={handleAdd}
        className="bg-white rounded-2xl shadow-sm p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Plus className="h-5 w-5 text-brand-pink" />
          Add New Design
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={addForm.name}
              onChange={e => setAddForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-xl border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
              placeholder="e.g. Floral Bliss"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug{' '}
              <span className="text-gray-400 font-normal">
                (auto from name)
              </span>
            </label>
            <input
              type="text"
              value={addForm.slug}
              onChange={e => {
                setSlugManuallyEdited(true);
                setAddForm(prev => ({ ...prev, slug: e.target.value }));
              }}
              className="w-full rounded-xl border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
              placeholder="floral-bliss"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                ref={addFileInputRef}
                onChange={handleAddImage}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-pink/10 file:text-brand-pink hover:file:bg-brand-pink/20"
              />
              {uploading && <Loader2 className="animate-spin h-5 w-5 text-brand-pink" />}
            </div>
            {addForm.imagePreview && (
              <div className="mt-2">{renderThumb(addForm.imagePreview, addForm.name || 'new', 'h-12 w-12')}</div>
            )}
          </div>

          {/* Sort order, popular, active */}
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort order</label>
              <input
                type="number"
                value={addForm.sort_order}
                onChange={e => setAddForm(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
                className="w-24 rounded-xl border-gray-300 shadow-sm focus:border-brand-pink focus:ring-brand-pink"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={addForm.popular}
                onChange={e => setAddForm(prev => ({ ...prev, popular: e.target.checked }))}
                className="rounded border-gray-300 text-brand-pink focus:ring-brand-pink"
              />
              <span className="text-sm text-gray-700">Popular</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={addForm.active}
                onChange={e => setAddForm(prev => ({ ...prev, active: e.target.checked }))}
                className="rounded border-gray-300 text-brand-pink focus:ring-brand-pink"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={!addForm.name || !addForm.slug || uploading}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-pink px-5 py-2.5 text-white font-medium shadow-sm hover:bg-brand-pink/90 disabled:opacity-50 transition"
        >
          <Plus className="h-4 w-4" />
          Add Design
        </button>
      </form>

      {/* -------------- Error state -------------- */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl">
          {error} —{' '}
          <button onClick={fetchDesigns} className="underline">
            Retry
          </button>
        </div>
      )}

      {/* -------------- Designs List -------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {designs.map(design => {
          const isEditing = editingId === design.id;
          return (
            <div
              key={design.id}
              className={`bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3 transition ${
                isEditing ? 'ring-2 ring-brand-pink' : ''
              }`}
            >
              {/* ---- top row: thumbnail & actions (view mode) ---- */}
              <div className="flex items-start gap-3">
                {isEditing && editForm ? (
                  /* editable thumbnail */
                  <div className="flex-shrink-0">
                    {renderThumb(
                      editForm.imagePreview,
                      editForm.name || design.name,
                      'h-16 w-16'
                    )}
                  </div>
                ) : (
                  /* display thumbnail */
                  <div className="flex-shrink-0">
                    {renderThumb(design.image_url, design.name, 'h-16 w-16')}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {isEditing && editForm ? (
                    /* edit inputs */
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={e =>
                          setEditForm(prev => prev ? { ...prev, name: e.target.value } : prev)
                        }
                        className="w-full rounded-xl border-gray-300 shadow-sm text-sm"
                        placeholder="Name"
                        required
                      />
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500">Sort:</label>
                        <input
                          type="number"
                          value={editForm.sort_order}
                          onChange={e =>
                            setEditForm(prev => prev ? { ...prev, sort_order: Number(e.target.value) } : prev)
                          }
                          className="w-20 rounded-xl border-gray-300 shadow-sm text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-1 text-sm">
                          <input
                            type="checkbox"
                            checked={editForm.popular}
                            onChange={e =>
                              setEditForm(prev => prev ? { ...prev, popular: e.target.checked } : prev)
                            }
                            className="rounded border-gray-300 text-brand-pink"
                          />
                          Popular
                        </label>
                        <label className="flex items-center gap-1 text-sm">
                          <input
                            type="checkbox"
                            checked={editForm.active}
                            onChange={e =>
                              setEditForm(prev => prev ? { ...prev, active: e.target.checked } : prev)
                            }
                            className="rounded border-gray-300 text-brand-pink"
                          />
                          Active
                        </label>
                      </div>
                      {/* upload new image in edit */}
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          ref={editingId === design.id ? editFileInputRef : undefined}
                          onChange={handleEditImage}
                          className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-pink/10 file:text-brand-pink"
                        />
                        {editUploading && <Loader2 className="animate-spin h-4 w-4 text-brand-pink" />}
                      </div>
                    </div>
                  ) : (
                    /* view mode */
                    <>
                      <h3 className="font-semibold text-gray-800 truncate">{design.name}</h3>
                      <p className="text-xs text-gray-400">{design.id}</p>
                      <div className="flex items-center gap-3 mt-1">
                        {/* popular star toggle */}
                        <button
                          onClick={() => togglePopular(design.id, design.popular)}
                          className="focus:outline-none"
                          title="Toggle popular"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              design.popular
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 hover:text-yellow-400'
                            }`}
                          />
                        </button>

                        {/* active toggle */}
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={design.active}
                            onChange={() => toggleActive(design.id, design.active)}
                            className="rounded border-gray-300 text-brand-pink focus:ring-brand-pink"
                          />
                          <span className="text-xs text-gray-500">Active</span>
                        </label>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Order: {design.sort_order}</p>
                    </>
                  )}
                </div>
              </div>

              {/* ---- action buttons (view / edit mode) ---- */}
              <div className="flex items-center gap-2 mt-1">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      disabled={editUploading}
                      className="inline-flex items-center gap-1 rounded-lg bg-brand-pink px-3 py-1.5 text-white text-sm font-medium hover:bg-brand-pink/90 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(design)}
                      className="inline-flex items-center gap-1 rounded-lg bg-brand-pink/10 text-brand-pink px-3 py-1.5 text-sm font-medium hover:bg-brand-pink/20"
                    >
                      <Save className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(design.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-red-50 text-red-600 px-3 py-1.5 text-sm font-medium hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!loading && designs.length === 0 && !error && (
        <p className="text-gray-500 text-center py-10">No designs yet. Add your first above!</p>
      )}
    </div>
  );
}