"use client";

import { useState, useEffect, useRef } from "react";
import {
  getUnits,
  addUnit,
  updateUnit,
  deleteUnit,
} from "@/lib/accommodation";
import { uploadFiles } from "@/lib/upload";

export default function AccommodationManager() {
  const [units, setUnits] = useState([]);
  const [view, setView] = useState("list"); // "list" | "form"
  const [editingUnit, setEditingUnit] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchUnits = async () => {
    try {
      const data = await getUnits();
      setUnits(data);
    } catch (err) {
      console.error("Failed to load accommodation units:", err);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  // Form state – only relevant while in "form" view
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [sleeps, setSleeps] = useState(1);
  const [description, setDescription] = useState("");
  const [size, setSize] = useState("medium");
  const [span, setSpan] = useState("col-span-1");
  const [active, setActive] = useState(true);
  const [features, setFeatures] = useState([]);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const resetForm = (unit) => {
    if (unit) {
      setName(unit.name || "");
      setTagline(unit.tagline || "");
      setSleeps(unit.sleeps || 1);
      setDescription(unit.description || "");
      setSize(unit.size || "medium");
      setSpan(unit.span || "col-span-1");
      setActive(unit.active !== false); // default true
      setFeatures(Array.isArray(unit.features) ? [...unit.features] : []);
      setImages(Array.isArray(unit.images) ? [...unit.images] : []);
    } else {
      setName("");
      setTagline("");
      setSleeps(1);
      setDescription("");
      setSize("medium");
      setSpan("col-span-1");
      setActive(true);
      setFeatures([]);
      setImages([]);
    }
  };

  const handleNew = () => {
    resetForm(null);
    setEditingUnit(null);
    setView("form");
  };

  const handleEdit = (unit) => {
    resetForm(unit);
    setEditingUnit(unit);
    setView("form");
  };

  const handleDeleteRequest = (unit) => {
    setDeleteTarget(unit);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      try {
        await deleteUnit(deleteTarget.id);
        await fetchUnits();
      } catch (err) {
        console.error("Failed to delete unit:", err);
      }
      setDeleteTarget(null);
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const prepared = {
      name,
      tagline,
      sleeps: Number(sleeps),
      description,
      size,
      span,
      active,
      features: features.filter((f) => f.trim() !== ""),
      images: images.filter((img) => img.trim() !== ""),
    };

    try {
      if (editingUnit) {
        await updateUnit(editingUnit.id, prepared);
      } else {
        await addUnit(prepared);
      }
      await fetchUnits();
      setView("list");
      setEditingUnit(null);
    } catch (err) {
      console.error("Failed to save unit", err);
    }
  };

  const handleCancelForm = () => {
    setView("list");
    setEditingUnit(null);
  };

  // Dynamic list helpers
  const addFeature = () => setFeatures([...features, ""]);
  const updateFeature = (index, value) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };
  const removeFeature = (index) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const addImage = () => setImages([...images, ""]);
  const updateImage = (index, value) => {
    const updated = [...images];
    updated[index] = value;
    setImages(updated);
  };
  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setUploadError("");
    try {
      const { urls, errors } = await uploadFiles(files, "accommodation");
      if (urls.length > 0) setImages((prev) => [...prev, ...urls]);
      if (errors.length > 0) setUploadError(errors.join("; "));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // --- Render helpers ---

  const renderForm = () => (
    <div className="bg-[#1a1d27] rounded-xl border border-white/5 p-8">
      <h2 className="text-white text-xl font-serif mb-6">
        {editingUnit ? "Edit Unit" : "Create New Unit"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* name */}
        <div>
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
          />
        </div>

        {/* tagline */}
        <div>
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
            Tagline
          </label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
          />
        </div>

        {/* sleeps */}
        <div>
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
            Sleeps
          </label>
          <input
            type="number"
            value={sleeps}
            onChange={(e) => setSleeps(e.target.value)}
            min="1"
            required
            className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
          />
        </div>

        {/* description */}
        <div>
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors resize-y"
          />
        </div>

        {/* size */}
        <div>
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
            Size
          </label>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
          >
            <option value="premium">Premium</option>
            <option value="large">Large</option>
            <option value="medium">Medium</option>
            <option value="intimate">Intimate</option>
          </select>
        </div>

        {/* span */}
        <div>
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
            Card Width
          </label>
          <select
            value={span}
            onChange={(e) => setSpan(e.target.value)}
            className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
          >
            <option value="col-span-1">Standard width</option>
            <option value="col-span-2">Wide (spans 2 columns)</option>
          </select>
        </div>

        {/* active */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-5 h-5 rounded accent-[#C07750]"
          />
          <label className="text-white/50 text-xs uppercase tracking-widest">
            Active (visible on public site)
          </label>
        </div>

        {/* features dynamic list */}
        <div>
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
            Features
          </label>
          {features.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={feat}
                onChange={(e) => updateFeature(idx, e.target.value)}
                className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
                placeholder="e.g. Expansive Deck"
              />
              <button
                type="button"
                onClick={() => removeFeature(idx)}
                className="text-red-400/60 hover:text-red-400 px-3 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addFeature}
            className="mt-2 text-[#C07750] text-sm font-medium hover:text-[#C07750]/80 transition-colors"
          >
            + Add feature
          </button>
        </div>

        {/* images dynamic list */}
        <div>
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
            Images (file paths)
          </label>
          {images.map((img, idx) => (
            <div key={idx} className="mb-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={img}
                  onChange={(e) => updateImage(idx, e.target.value)}
                  className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
                  placeholder="/images/accommodation/IMG_8185.jpg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="text-red-400/60 hover:text-red-400 px-3 transition-colors"
                >
                  ✕
                </button>
              </div>
              {img.trim() !== "" && (
                <img
                  src={img}
                  alt=""
                  className="w-20 h-20 object-cover rounded border border-white/10 mt-2"
                />
              )}
            </div>
          ))}
          <div className="flex items-center gap-4 mt-2">
            <button
              type="button"
              onClick={addImage}
              className="text-[#C07750] text-sm font-medium hover:text-[#C07750]/80 transition-colors"
            >
              + Add image path
            </button>
            <span className="text-white/20 text-xs">or</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              className="text-white/60 text-xs file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-[#C07750] file:text-white file:font-semibold file:text-xs file:cursor-pointer hover:file:bg-[#a8654a] disabled:opacity-60"
            />
            {uploading && (
              <span className="text-white/40 text-xs">Uploading...</span>
            )}
          </div>
          {uploadError && (
            <p className="text-red-400 text-xs mt-2">{uploadError}</p>
          )}
        </div>

        {/* form actions */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            className="bg-[#C07750] text-white px-8 py-3 rounded-lg font-semibold tracking-wider text-sm hover:bg-[#a8654a] transition-colors"
          >
            {editingUnit ? "UPDATE" : "CREATE"}
          </button>
          <button
            type="button"
            onClick={handleCancelForm}
            className="text-white/40 hover:text-white/70 px-6 py-3 text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  const renderList = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-xl font-serif">
          Accommodation Units ({units.length})
        </h2>
        <button
          onClick={handleNew}
          className="bg-[#C07750] text-white px-6 py-2.5 rounded-lg font-semibold tracking-wider text-sm hover:bg-[#a8654a] transition-colors"
        >
          + NEW UNIT
        </button>
      </div>

      {units.length === 0 ? (
        <p className="text-white/40 text-sm">No units yet.</p>
      ) : (
        <div className="space-y-4">
          {units.map((unit) => (
            <div
              key={unit.id}
              className="bg-[#1a1d27] rounded-xl border border-white/5 p-5 flex flex-col md:flex-row items-start md:items-center gap-5"
            >
              {/* thumbnail */}
              {unit.images && unit.images.length > 0 && (
                <img
                  src={unit.images[0]}
                  alt=""
                  className="w-16 h-16 object-cover rounded border border-white/10 shrink-0"
                />
              )}

              {/* info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-white font-medium truncate">
                    {unit.name}
                  </h3>
                  <span
                    className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded uppercase flex-shrink-0 ${
                      unit.active
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {unit.active ? "Active" : "Inactive"}
                  </span>
                </div>
                {unit.tagline && (
                  <p className="text-white/50 text-sm truncate mt-1">
                    {unit.tagline}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-white/40 flex-wrap">
                  <span>Sleeps {unit.sleeps}</span>
                  <span className="capitalize">{unit.size}</span>
                  <span>
                    {unit.span === "col-span-2" ? "Wide" : "Standard"}
                  </span>
                </div>
              </div>

              {/* actions */}
              <div className="flex items-center gap-2 ml-auto shrink-0">
                <a
                  href="/accommodation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-white/70 px-3 py-1 text-sm transition-colors"
                >
                  View
                </a>
                <button
                  onClick={() => handleEdit(unit)}
                  className="text-white/40 hover:text-white/70 px-3 py-1 text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteRequest(unit)}
                  className="text-red-400/60 hover:text-red-400 px-3 py-1 text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Delete confirmation modal
  const renderDeleteModal = () => {
    if (!deleteTarget) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-[#1a1d27] rounded-xl border border-white/10 p-8 max-w-sm mx-4">
          <h3 className="text-white text-lg font-serif mb-3">
            Delete {deleteTarget.name}?
          </h3>
          <p className="text-white/50 text-sm mb-6">
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={confirmDelete}
              className="bg-red-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-red-600 transition-colors"
            >
              DELETE
            </button>
            <button
              onClick={cancelDelete}
              className="text-white/40 hover:text-white/70 px-4 py-2.5 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {view === "form" ? renderForm() : renderList()}
      {renderDeleteModal()}
    </>
  );
}
