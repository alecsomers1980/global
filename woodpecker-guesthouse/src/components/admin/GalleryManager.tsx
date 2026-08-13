"use client";

import { useState, useEffect, useRef } from "react";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getImages,
  addImage,
  updateImageCategory,
  deleteImage,
  uploadFiles,
} from "@/lib/admin/gallery";
import type { GalleryCategory, GalleryImage } from "@/lib/types";

export default function GalleryManager() {
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [newImageCategoryId, setNewImageCategoryId] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [cats, imgs] = await Promise.all([getCategories(), getImages()]);
    setCategories(cats);
    setImages(imgs);
  }

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    await addCategory(name);
    setNewCategoryName("");
    await loadData();
  };

  const startEditingCategory = (cat: GalleryCategory) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleSaveCategoryEdit = async () => {
    const name = editingName.trim();
    if (!name || !editingId) return;
    await updateCategory(editingId, name);
    setEditingId(null);
    await loadData();
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Delete this category? Images move to Uncategorized.")) return;
    await deleteCategory(id);
    await loadData();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    setUploadError("");
    try {
      const { urls, errors } = await uploadFiles(files, "gallery");
      for (const url of urls) {
        await addImage(url, newImageCategoryId || null);
      }
      await loadData();
      if (errors.length > 0) setUploadError(errors.join("; "));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => setSelectedIds(new Set(filteredImages.map((img) => img.id)));
  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} image(s)?`)) return;
    await Promise.all(Array.from(selectedIds).map((id) => deleteImage(id)));
    setSelectedIds(new Set());
    await loadData();
  };

  const filteredImages =
    selectedFilter === "all" ? images : images.filter((img) => img.category_id === selectedFilter);

  return (
    <>
      <div className="rounded-xl border border-line bg-white p-6">
        <h2 className="font-display text-lg text-ink mb-4">Categories</h2>
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="New category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
            className="flex-1 rounded-lg border border-line px-4 py-2.5 text-sm outline-none focus:border-terracotta"
          />
          <button
            onClick={handleAddCategory}
            className="bg-terracotta text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-terracotta-deep transition-colors whitespace-nowrap"
          >
            + Add Category
          </button>
        </div>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 bg-surface rounded-lg px-4 py-2.5">
              {editingId === cat.id ? (
                <>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveCategoryEdit()}
                    className="flex-1 rounded border border-line px-3 py-1.5 text-sm outline-none focus:border-terracotta"
                    autoFocus
                  />
                  <button onClick={handleSaveCategoryEdit} className="text-terracotta hover:underline text-sm px-2">
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-muted hover:text-ink px-2 text-sm">
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span
                    className="flex-1 text-ink cursor-pointer select-none"
                    onClick={() => startEditingCategory(cat)}
                    title="Click to rename"
                  >
                    {cat.name}
                  </span>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-red-400 hover:text-red-600 px-3 transition-colors"
                    title="Delete category"
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-white p-6 mt-8">
        <h2 className="font-display text-lg text-ink mb-1">Images</h2>
        <p className="text-muted text-sm mb-6">{images.length} images</p>

        <div className="flex items-center gap-3 mb-4">
          <select
            value={newImageCategoryId}
            onChange={(e) => setNewImageCategoryId(e.target.value)}
            className="rounded-lg border border-line px-4 py-2.5 text-sm outline-none focus:border-terracotta"
          >
            <option value="">Uncategorized</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            className="text-sm text-muted file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:bg-terracotta file:text-white file:font-semibold file:text-sm file:cursor-pointer hover:file:bg-terracotta-deep disabled:opacity-60"
          />
          {uploading && <span className="text-muted text-xs">Uploading…</span>}
        </div>
        {uploadError && <p className="text-red-600 text-xs mb-4">{uploadError}</p>}

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              selectedFilter === "all" ? "bg-terracotta text-white border-terracotta" : "border-line text-muted"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedFilter(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                selectedFilter === cat.id ? "bg-terracotta text-white border-terracotta" : "border-line text-muted"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 mb-4">
          <button onClick={selectAllVisible} className="text-muted hover:text-ink text-xs font-semibold">
            Select All
          </button>
          {selectedIds.size > 0 && (
            <>
              <button onClick={clearSelection} className="text-muted hover:text-ink text-xs font-semibold">
                Clear ({selectedIds.size})
              </button>
              <button
                onClick={handleBulkDelete}
                className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors"
              >
                Delete Selected ({selectedIds.size})
              </button>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredImages.map((image) => {
            const selected = selectedIds.has(image.id);
            return (
              <div
                key={image.id}
                className={`relative aspect-square rounded-lg overflow-hidden border ${
                  selected ? "border-terracotta ring-2 ring-terracotta" : "border-line"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.src} alt={image.alt} className="absolute inset-0 w-full h-full object-cover" />
                <label className="absolute top-2 left-2 w-7 h-7 flex items-center justify-center bg-black/60 rounded-full cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleSelect(image.id)}
                    className="w-4 h-4 accent-terracotta"
                  />
                </label>
                <button
                  onClick={async () => {
                    await deleteImage(image.id);
                    await loadData();
                  }}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors"
                >
                  ✕
                </button>
                <div className="absolute bottom-2 left-2 right-2">
                  <select
                    value={image.category_id ?? ""}
                    onChange={async (e) => {
                      await updateImageCategory(image.id, e.target.value || null);
                      await loadData();
                    }}
                    className="w-full bg-black/60 border-0 text-white text-xs px-2 py-1 rounded"
                  >
                    <option value="">Uncategorized</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}