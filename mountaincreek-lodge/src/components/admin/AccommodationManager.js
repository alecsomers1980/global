"use client";

import { useState, useEffect, useRef } from "react";
import {
  getUnits,
  addUnit,
  updateUnit,
  deleteUnit,
} from "@/lib/accommodation";
import { uploadFiles } from "@/lib/upload";
import Card from "@/components/admin/ui/Card";
import Button from "@/components/admin/ui/Button";
import FieldLabel from "@/components/admin/ui/FieldLabel";
import TextInput, { inputClass } from "@/components/admin/ui/TextInput";

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
  const [bedrooms, setBedrooms] = useState(1);
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
      setBedrooms(unit.bedrooms || 1);
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
      setBedrooms(1);
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
      bedrooms: Number(bedrooms),
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

  // Drag-to-reorder for the images grid
  const [draggedIndex, setDraggedIndex] = useState(null);
  const handleImageDragStart = (index) => setDraggedIndex(index);
  const handleImageDragOver = (e) => e.preventDefault();
  const handleImageDrop = (targetIndex) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }
    setImages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(draggedIndex, 1);
      updated.splice(targetIndex, 0, moved);
      return updated;
    });
    setDraggedIndex(null);
  };
  const handleImageDragEnd = () => setDraggedIndex(null);

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
    <Card>
      <h2 className="text-white text-xl font-serif mb-6">
        {editingUnit ? "Edit Unit" : "Create New Unit"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* name */}
        <div>
          <FieldLabel>Name</FieldLabel>
          <TextInput
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* tagline */}
        <div>
          <FieldLabel>Tagline</FieldLabel>
          <TextInput
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />
        </div>

        {/* sleeps */}
        <div>
          <FieldLabel>Sleeps</FieldLabel>
          <TextInput
            type="number"
            value={sleeps}
            onChange={(e) => setSleeps(e.target.value)}
            min="1"
            required
          />
        </div>

        {/* bedrooms */}
        <div>
          <FieldLabel>Bedrooms</FieldLabel>
          <TextInput
            type="number"
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            min="0"
            required
          />
        </div>

        {/* description */}
        <div>
          <FieldLabel>Description</FieldLabel>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={`${inputClass} resize-y`}
          />
        </div>

        {/* size */}
        <div>
          <FieldLabel>Size</FieldLabel>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className={inputClass}
          >
            <option value="premium">Premium</option>
            <option value="large">Large</option>
            <option value="medium">Medium</option>
            <option value="intimate">Intimate</option>
          </select>
        </div>

        {/* span */}
        <div>
          <FieldLabel>Card Width</FieldLabel>
          <select
            value={span}
            onChange={(e) => setSpan(e.target.value)}
            className={inputClass}
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
          <FieldLabel>Features</FieldLabel>
          {features.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <TextInput
                type="text"
                value={feat}
                onChange={(e) => updateFeature(idx, e.target.value)}
                placeholder="e.g. Expansive Deck"
              />
              <Button
                type="button"
                variant="danger"
                onClick={() => removeFeature(idx)}
              >
                ✕
              </Button>
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

        {/* images */}
        <div>
          <FieldLabel>Images</FieldLabel>

          {images.some((img) => img.trim() !== "") && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
              {images.map((img, idx) =>
                img.trim() === "" ? null : (
                  <div
                    key={idx}
                    draggable
                    onDragStart={() => handleImageDragStart(idx)}
                    onDragOver={handleImageDragOver}
                    onDrop={() => handleImageDrop(idx)}
                    onDragEnd={handleImageDragEnd}
                    className={`relative aspect-square bg-[#0f1117] rounded-lg border overflow-hidden cursor-grab active:cursor-grabbing ${
                      draggedIndex === idx ? "opacity-40" : "border-white/10"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />
                    <span className="absolute top-2 left-2 w-6 h-6 flex items-center justify-center bg-black/60 rounded-full text-white/70 text-sm">
                      ⠿
                    </span>
                    <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm transition-colors"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                )
              )}
            </div>
          )}

          <div className="flex items-center gap-4">
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

          <details className="mt-3">
            <summary className="text-white/40 text-xs cursor-pointer hover:text-white/60 transition-colors">
              Add image by path instead
            </summary>
            <div className="mt-2 space-y-2">
              {images.map((img, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <TextInput
                    type="text"
                    value={img}
                    onChange={(e) => updateImage(idx, e.target.value)}
                    placeholder="/images/accommodation/IMG_8185.jpg"
                  />
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => removeImage(idx)}
                  >
                    ✕
                  </Button>
                </div>
              ))}
              <button
                type="button"
                onClick={addImage}
                className="text-[#C07750] text-sm font-medium hover:text-[#C07750]/80 transition-colors"
              >
                + Add image path
              </button>
            </div>
          </details>
        </div>

        {/* form actions */}
        <div className="flex items-center gap-4 pt-4">
          <Button type="submit">{editingUnit ? "UPDATE" : "CREATE"}</Button>
          <Button type="button" variant="secondary" onClick={handleCancelForm}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );

  const renderList = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-white/40 text-sm">{units.length} unit{units.length !== 1 ? "s" : ""}</p>
        <Button onClick={handleNew}>+ NEW UNIT</Button>
      </div>

      {units.length === 0 ? (
        <p className="text-white/40 text-sm">No units yet.</p>
      ) : (
        <div className="space-y-4">
          {units.map((unit) => (
            <Card
              key={unit.id}
              padding="p-5"
              className="flex flex-col md:flex-row items-start md:items-center gap-5"
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
            </Card>
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
        <Card padding="p-8" className="max-w-sm mx-4">
          <h3 className="text-white text-lg font-serif mb-3">
            Delete {deleteTarget.name}?
          </h3>
          <p className="text-white/50 text-sm mb-6">
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="dangerFilled" onClick={confirmDelete}>
              DELETE
            </Button>
            <Button variant="secondary" onClick={cancelDelete}>
              Cancel
            </Button>
          </div>
        </Card>
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
