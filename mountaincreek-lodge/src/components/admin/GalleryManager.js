"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getImages,
  addImage,
  updateImage,
  deleteImage,
} from "@/lib/gallery";
import { uploadFiles } from "@/lib/upload";

export default function GalleryManager() {
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const [newImageSrc, setNewImageSrc] = useState("");
  const [newImageCategoryId, setNewImageCategoryId] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [cats, imgs] = await Promise.all([getCategories(), getImages()]);
      setCategories(cats);
      setImages(imgs);
    } catch (error) {
      console.error("Failed to load gallery data:", error);
    }
  }

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    try {
      await addCategory(name);
      setNewCategoryName("");
      await loadData();
    } catch (error) {
      console.error("Failed to add category:", error);
    }
  };

  const startEditingCategory = (cat) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleSaveCategoryEdit = async () => {
    const name = editingName.trim();
    if (!name) return;
    try {
      await updateCategory(editingId, name);
      setEditingId(null);
      await loadData();
    } catch (error) {
      console.error("Failed to update category:", error);
    }
  };

  const handleCancelCategoryEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await deleteCategory(id);
      await loadData();
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const handleAddImage = async () => {
    const src = newImageSrc.trim();
    if (!src) return;
    try {
      await addImage({
        src,
        categoryId: newImageCategoryId || null,
      });
      setNewImageSrc("");
      setNewImageCategoryId("");
      await loadData();
    } catch (error) {
      console.error("Failed to add image:", error);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setUploadError("");
    try {
      const { urls, errors } = await uploadFiles(files, "gallery");
      for (const url of urls) {
        try {
          await addImage({ src: url, categoryId: newImageCategoryId || null });
        } catch (error) {
          errors.push(`${url}: ${error.message}`);
        }
      }
      await loadData();
      if (errors.length > 0) setUploadError(errors.join("; "));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (id) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await deleteImage(id);
      await loadData();
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  };

  const handleUpdateImageCategory = async (id, categoryId) => {
    try {
      await updateImage(id, { categoryId: categoryId || null });
      await loadData();
    } catch (error) {
      console.error("Failed to update image category:", error);
    }
  };

  const filteredImages =
    selectedFilter === "all"
      ? images
      : images.filter((img) => img.categoryId === selectedFilter);

  return (
    <>
      {/* Categories Section */}
      <div className="bg-[#1a1d27] rounded-xl border border-white/5 p-8">
        <h2 className="text-white text-xl font-serif mb-6">Categories</h2>

        {/* Add category row */}
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="New category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddCategory();
            }}
            className="flex-1 bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
          />
          <button
            onClick={handleAddCategory}
            className="bg-[#C07750] text-white px-6 py-2.5 rounded-lg font-semibold tracking-wider text-sm hover:bg-[#a8654a] transition-colors whitespace-nowrap"
          >
            + ADD CATEGORY
          </button>
        </div>

        {/* Category list */}
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 bg-[#0f1117] border border-white/10 rounded-lg px-4 py-2.5"
            >
              {editingId === cat.id ? (
                <>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveCategoryEdit();
                    }}
                    className="flex-1 bg-[#0f1117] border border-white/10 text-white px-3 py-1.5 rounded focus:outline-none focus:border-[#C07750] text-sm"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveCategoryEdit}
                    className="text-[#C07750] hover:underline text-sm px-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelCategoryEdit}
                    className="text-white/40 hover:text-white/70 px-2 text-sm"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span
                    className="flex-1 text-white cursor-pointer select-none"
                    onClick={() => startEditingCategory(cat)}
                    title="Click to rename"
                  >
                    {cat.name}
                  </span>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-red-400/60 hover:text-red-400 px-3 transition-colors"
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

      {/* Images Section */}
      <div className="bg-[#1a1d27] rounded-xl border border-white/5 p-8 mt-10">
        <h2 className="text-white text-xl font-serif mb-6">Images</h2>
        <p className="text-white/50 text-sm mb-6">{images.length} images</p>

        {/* Add image row */}
        <div className="flex flex-wrap sm:flex-nowrap items-end gap-3 mb-6">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
              Image Path
            </label>
            <input
              type="text"
              placeholder="/images/accommodation/IMG_8185.jpg"
              value={newImageSrc}
              onChange={(e) => setNewImageSrc(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddImage();
              }}
              className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
            />
          </div>
          <div className="min-w-[160px]">
            <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
              Category
            </label>
            <select
              value={newImageCategoryId}
              onChange={(e) => setNewImageCategoryId(e.target.value)}
              className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
            >
              <option value="">Uncategorized</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAddImage}
            className="bg-[#C07750] text-white px-6 py-2.5 rounded-lg font-semibold tracking-wider text-sm hover:bg-[#a8654a] transition-colors whitespace-nowrap self-end"
          >
            + ADD IMAGE
          </button>
        </div>

        {/* Upload image row — uses the same category selected above */}
        <div className="flex items-center gap-3 mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            className="text-white/60 text-sm file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:bg-[#C07750] file:text-white file:font-semibold file:tracking-wider file:text-sm file:cursor-pointer hover:file:bg-[#a8654a] disabled:opacity-60"
          />
          {uploading && <span className="text-white/40 text-xs">Uploading...</span>}
        </div>
        {uploadError && (
          <p className="text-red-400 text-xs -mt-4 mb-6">{uploadError}</p>
        )}

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-semibold border border-white/10 transition-colors ${
              selectedFilter === "all"
                ? "bg-[#C07750] text-white border-[#C07750]"
                : "text-white/60 hover:border-white/30"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedFilter(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-semibold border border-white/10 transition-colors ${
                selectedFilter === cat.id
                  ? "bg-[#C07750] text-white border-[#C07750]"
                  : "text-white/60 hover:border-white/30"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Image grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="relative aspect-square bg-[#1a1d27] rounded-lg border border-white/5 overflow-hidden group"
            >
              <img
                src={image.src}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              <button
                onClick={() => handleDeleteImage(image.id)}
                className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors"
                title="Delete image"
              >
                ✕
              </button>
              <div className="absolute bottom-2 left-2 right-2">
                <select
                  value={image.categoryId || ""}
                  onChange={(e) =>
                    handleUpdateImageCategory(image.id, e.target.value)
                  }
                  className="w-full bg-black/60 border border-white/10 text-white text-xs px-2 py-1 rounded focus:outline-none focus:border-[#C07750] transition-colors"
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
          ))}
        </div>
      </div>
    </>
  );
}
