"use client";

import { useRef, useState } from "react";
import { uploadFiles } from "@/lib/admin/gallery";

export default function RoomPhotoManager({
  roomId,
  galleryImages,
  heroImage,
  onChange,
}: {
  roomId: string;
  galleryImages: string[];
  heroImage: string | null;
  onChange: (next: { galleryImages: string[]; heroImage: string | null }) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setUploadError("");

    try {
      const { urls, errors } = await uploadFiles(files, `rooms/${roomId}`);
      const newGallery = [...galleryImages, ...urls];
      let newHero = heroImage;
      if (!newHero && newGallery.length > 0) {
        newHero = newGallery[0];
      }
      onChange({ galleryImages: newGallery, heroImage: newHero });
      if (errors.length > 0) {
        setUploadError(errors.join("; "));
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = (url: string) => {
    const newGallery = galleryImages.filter((item) => item !== url);
    let newHero = heroImage;
    if (heroImage === url) {
      newHero = newGallery.length > 0 ? newGallery[0] : null;
    }
    onChange({ galleryImages: newGallery, heroImage: newHero });
  };

  const handleSetHero = (url: string) => {
    onChange({ galleryImages, heroImage: url });
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const newGallery = [...galleryImages];
    const [dragged] = newGallery.splice(dragIndex, 1);
    newGallery.splice(targetIndex, 0, dragged);
    onChange({ galleryImages: newGallery, heroImage });
    setDragIndex(null);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        disabled={uploading}
        className="text-sm text-muted file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:bg-terracotta file:text-white file:font-semibold file:text-sm file:cursor-pointer hover:file:bg-terracotta-deep disabled:opacity-60"
      />
      {uploading && <span className="text-muted text-xs ml-2">Uploading…</span>}
      {uploadError && <p className="text-red-600 text-xs mt-2">{uploadError}</p>}

      {galleryImages.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
          {galleryImages.map((url, i) => (
            <div
              key={url}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(i)}
              className={`relative aspect-square rounded-lg overflow-hidden border cursor-move${
                url === heroImage
                  ? " border-terracotta ring-2 ring-terracotta"
                  : " border-line"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleDelete(url)}
                className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors"
              >
                ✕
              </button>
              <button
                type="button"
                onClick={() => handleSetHero(url)}
                className={`absolute bottom-2 left-2 right-2 text-xs font-semibold py-1 rounded transition-colors ${
                  url === heroImage
                    ? "bg-terracotta text-white"
                    : "bg-black/60 text-white hover:bg-black/80"
                }`}
              >
                {url === heroImage ? "Hero photo" : "Set as hero"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
