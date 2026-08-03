"use client";
import { useState, useEffect, useRef } from "react";
import {
  getImages,
  addImage,
  updateImage,
  deleteImage,
  getMenuUrl,
  setMenuUrl,
} from "@/lib/red-litchi";
import { uploadFile, uploadFiles } from "@/lib/upload";

export default function RedLitchiManager() {
  const fileInputRef = useRef(null);
  const [currentUrl, setCurrentUrl] = useState("");
  const [menuInputUrl, setMenuInputUrl] = useState("");
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [images, setImages] = useState([]);
  const [gallerySrcInput, setGallerySrcInput] = useState("");
  const [editingImageId, setEditingImageId] = useState(null);
  const [editNewSrc, setEditNewSrc] = useState("");
  const [menuUploadError, setMenuUploadError] = useState("");
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryUploadError, setGalleryUploadError] = useState("");
  const galleryFileInputRef = useRef(null);

  useEffect(() => {
    getMenuUrl()
      .then(setCurrentUrl)
      .catch((err) => console.error("Failed to load menu URL:", err));
    refreshImages();
  }, []);

  const refreshImages = () => {
    getImages()
      .then(setImages)
      .catch((err) => console.error("Failed to load Red Litchi images:", err));
  };

  const clearSuccessAfterTimeout = () => {
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFileName(file.name);
    setMenuUploadError("");
    try {
      const url = await uploadFile(file, "red-litchi/menu");
      await setMenuUrl(url);
      setCurrentUrl(url);
      setSuccessMessage("Menu updated.");
      clearSuccessAfterTimeout();
    } catch (err) {
      setMenuUploadError(err.message);
    } finally {
      setSelectedFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveUrl = async () => {
    if (!menuInputUrl.trim()) return;
    const trimmed = menuInputUrl.trim();
    try {
      await setMenuUrl(trimmed);
      setCurrentUrl(trimmed);
      setSuccessMessage("Menu updated.");
      clearSuccessAfterTimeout();
      setMenuInputUrl("");
    } catch (err) {
      setMenuUploadError(err.message);
    }
  };

  const handleAddImage = async () => {
    if (!gallerySrcInput.trim()) return;
    try {
      await addImage(gallerySrcInput.trim());
      refreshImages();
      setGallerySrcInput("");
    } catch (err) {
      console.error("Failed to add image:", err);
    }
  };

  const handleGalleryFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setGalleryUploading(true);
    setGalleryUploadError("");
    try {
      const { urls, errors } = await uploadFiles(files, "red-litchi");
      for (const url of urls) {
        try {
          await addImage(url);
        } catch (err) {
          errors.push(`${url}: ${err.message}`);
        }
      }
      refreshImages();
      if (errors.length > 0) setGalleryUploadError(errors.join("; "));
    } finally {
      setGalleryUploading(false);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (id) => {
    if (window.confirm("Delete this image?")) {
      try {
        await deleteImage(id);
        refreshImages();
      } catch (err) {
        console.error("Failed to delete image:", err);
      }
    }
  };

  const startEditing = (id, src) => {
    setEditingImageId(id);
    setEditNewSrc(src);
  };

  const cancelEditing = () => {
    setEditingImageId(null);
    setEditNewSrc("");
  };

  const saveEditing = async (id) => {
    if (!editNewSrc.trim()) return;
    try {
      await updateImage(id, editNewSrc.trim());
      refreshImages();
      setEditingImageId(null);
      setEditNewSrc("");
    } catch (err) {
      console.error("Failed to update image:", err);
    }
  };

  return (
    <div>
      {/* Menu Section */}
      <div className="bg-[#1a1d27] rounded-xl border border-white/5 p-8">
        <h2 className="text-white text-xl font-serif mb-6">Menu</h2>

        <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
          CURRENT MENU PDF
        </label>
        <div className="flex items-center justify-between bg-[#0f1117] border border-white/10 rounded-lg px-4 py-3 mb-8">
          <span className="text-white/40 text-sm truncate mr-4">
            {currentUrl}
          </span>
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C07750] hover:text-[#a8654a] text-sm whitespace-nowrap"
          >
            Open ↗
          </a>
        </div>

        <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
          UPLOAD NEW MENU PDF
        </label>
        <input
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="text-white/60 text-sm file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:bg-[#C07750] file:text-white file:font-semibold file:tracking-wider file:text-sm file:cursor-pointer hover:file:bg-[#a8654a] mb-1"
        />
        {selectedFileName && (
          <p className="text-white/40 text-xs mt-1">
            Uploading: {selectedFileName}...
          </p>
        )}
        {menuUploadError && (
          <p className="text-red-400 text-xs mt-1">{menuUploadError}</p>
        )}

        <div className="mt-8">
          <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">
            OR PASTE MENU PATH
          </label>
          <div className="flex gap-3">
            <input
              className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
              placeholder="/Red Litchi Official Menu.pdf"
              value={menuInputUrl}
              onChange={(e) => setMenuInputUrl(e.target.value)}
            />
            <button
              onClick={handleSaveUrl}
              className="bg-[#C07750] text-white px-6 py-2.5 rounded-lg font-semibold tracking-wider text-sm hover:bg-[#a8654a] transition-colors flex-shrink-0"
            >
              SAVE
            </button>
          </div>
        </div>

        {successMessage && (
          <p className="text-green-400 text-sm mt-2">{successMessage}</p>
        )}
      </div>

      {/* Gallery Section */}
      <div className="mt-10 bg-[#1a1d27] rounded-xl border border-white/5 p-8">
        <h2 className="text-white text-xl font-serif mb-6">Gallery Images</h2>

        <p className="text-white/60 text-sm mb-4">
          {images.length} image{images.length !== 1 ? "s" : ""}
        </p>

        <div className="flex gap-3 mb-8">
          <input
            className="w-full bg-[#0f1117] border border-white/10 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors"
            placeholder="/images/Red Litchi/Gallery/IMG-20241029-WA0008.jpg"
            value={gallerySrcInput}
            onChange={(e) => setGallerySrcInput(e.target.value)}
          />
          <button
            onClick={handleAddImage}
            className="bg-[#C07750] text-white px-6 py-2.5 rounded-lg font-semibold tracking-wider text-sm hover:bg-[#a8654a] transition-colors flex-shrink-0"
          >
            + ADD IMAGE
          </button>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <input
            ref={galleryFileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryFileUpload}
            disabled={galleryUploading}
            className="text-white/60 text-sm file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:bg-[#C07750] file:text-white file:font-semibold file:tracking-wider file:text-sm file:cursor-pointer hover:file:bg-[#a8654a] disabled:opacity-60"
          />
          {galleryUploading && (
            <span className="text-white/40 text-xs">Uploading...</span>
          )}
        </div>
        {galleryUploadError && (
          <p className="text-red-400 text-xs -mt-6 mb-8">{galleryUploadError}</p>
        )}

        {images.length === 0 ? (
          <p className="text-white/40 text-sm">No images yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative aspect-square bg-[#1a1d27] rounded-lg border border-white/5 overflow-hidden group"
              >
                {editingImageId === img.id ? (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-3 z-10">
                    <input
                      className="w-full bg-[#0f1117] border border-white/10 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-[#C07750] transition-colors text-sm"
                      value={editNewSrc}
                      onChange={(e) => setEditNewSrc(e.target.value)}
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => saveEditing(img.id)}
                        className="bg-[#C07750] text-white text-xs px-4 py-2 rounded-lg font-semibold tracking-wider hover:bg-[#a8654a] transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="text-white/40 hover:text-white/70 text-xs px-4 py-2 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <img
                      src={img.src}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => startEditing(img.id, img.src)}
                      className="absolute top-2 left-2 bg-black/60 hover:bg-[#C07750] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors"
                      title="Edit path"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors"
                      title="Delete image"
                    >
                      ✕
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
