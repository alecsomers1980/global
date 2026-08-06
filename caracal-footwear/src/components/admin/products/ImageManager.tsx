'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { ProductImage } from '@/lib/supabase/types';

interface ImageManagerProps {
  productId: string;
  colours: string[];
  images: ProductImage[];
}

export default function ImageManager({ productId, colours, images }: ImageManagerProps) {
  const router = useRouter();

  const [selectedColour, setSelectedColour] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const apiUrl = `/api/admin/products/${productId}/images`;

  // Distinct non-null colour_names present in images
  const distinctColours = Array.from(
    new Set(
      images
        .filter((img): img is ProductImage & { colour_name: string } => img.colour_name !== null)
        .map((img) => img.colour_name)
    )
  );

  // ─── Upload ───────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      for (const file of selectedFiles) {
        formData.append('files', file);
      }
      formData.append('colour', selectedColour);

      const res = await fetch(apiUrl, { method: 'POST', body: formData });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Upload failed' }));
        setError(body.error ?? 'Upload failed');
        return;
      }

      // Success – refresh server data and reset form
      router.refresh();
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch {
      setError('Network error – could not upload images.');
    } finally {
      setIsUploading(false);
    }
  };

  // ─── Delete all images of a given colour ──────────────────────────────
  const handleDeleteColour = async (colour: string) => {
    if (!window.confirm(`Are you sure you want to delete all ${colour} photos? This cannot be undone.`)) {
      return;
    }

    setError(null);

    try {
      const res = await fetch(apiUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colour }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Deletion failed' }));
        setError(body.error ?? 'Deletion failed');
        return;
      }

      router.refresh();
    } catch {
      setError('Network error – could not delete photos.');
    }
  };

  // ─── Delete a single image by id ──────────────────────────────────────
  const handleDeleteImage = async (imageId: string) => {
    setError(null);

    try {
      const res = await fetch(apiUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Deletion failed' }));
        setError(body.error ?? 'Deletion failed');
        return;
      }

      router.refresh();
    } catch {
      setError('Network error – could not delete image.');
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Upload section */}
      <div className="space-y-3">
        {error && (
          <p className="text-accent text-sm font-medium">{error}</p>
        )}

        <div className="flex flex-wrap gap-3 items-end">
          {/* Colour select */}
          <div className="flex flex-col gap-1">
            <label htmlFor="colour-select" className="text-xs text-muted">
              Colour
            </label>
            <select
              id="colour-select"
              value={selectedColour}
              onChange={(e) => setSelectedColour(e.target.value)}
              className="bg-surface text-text border border-muted/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">All colours</option>
              {colours.map((colour) => (
                <option key={colour} value={colour}>
                  {colour}
                </option>
              ))}
            </select>
          </div>

          {/* File input */}
          <div className="flex flex-col gap-1">
            <label htmlFor="file-input" className="text-xs text-muted">
              Images
            </label>
            <input
              id="file-input"
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                setSelectedFiles(e.target.files ? Array.from(e.target.files) : [])
              }
              className="text-sm text-text file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-surface file:text-muted hover:file:text-text file:cursor-pointer"
            />
          </div>

          {/* Upload button */}
          <button
            type="button"
            disabled={isUploading || selectedFiles.length === 0}
            onClick={handleUpload}
            className="bg-accent text-canvas px-4 py-2 rounded-md text-sm font-medium hover:bg-accent-hi disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </div>

      {/* Delete-by-colour buttons */}
      {distinctColours.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {distinctColours.map((colour) => (
            <button
              key={colour}
              type="button"
              onClick={() => handleDeleteColour(colour)}
              className="text-xs bg-surface text-accent border border-accent/30 px-2.5 py-1 rounded hover:bg-accent/10 transition-colors"
            >
              Delete all {colour} photos
            </button>
          ))}
        </div>
      )}

      {/* Thumbnail grid */}
      {images.length === 0 ? (
        <p className="text-sm text-muted">No photos yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <img
                src={image.url}
                alt={image.alt}
                className="aspect-square object-cover rounded-md w-full"
              />

              {/* Delete overlay button */}
              <button
                type="button"
                onClick={() => handleDeleteImage(image.id)}
                className="absolute top-1 right-1 bg-canvas/80 text-accent text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-canvas"
                title="Delete image"
              >
                Delete
              </button>

              {/* Colour caption */}
              <p className="text-xs text-muted mt-1 text-center">
                {image.colour_name ?? 'All colours'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}