"use client";

import { useState } from "react";
import { useAdminToken } from "@/app/admin/AdminGate";
import { uploadImage } from "@/app/admin/actions";
import { shrinkForUpload } from "@/lib/image-resize";
import { imageSrc, isUploaded } from "@/lib/product-image";

/**
 * Choose a photograph.
 *
 * Deliberately a file picker and not a URL box. Frieda has photographs on her
 * phone, not hosting — asking for a link is asking her to find somewhere to
 * put the file first, which is how product pages end up with no pictures.
 *
 * The value lives in a hidden input so the surrounding form can stay
 * uncontrolled like the rest of this admin, and clearing it means "no upload"
 * rather than "no picture": where a photo ships with the site, or a size can
 * fall back to its product's photo, removing the upload reveals that again.
 */
export function ImageUpload({
  name,
  label,
  value,
  fallback,
  fallbackNote,
  className = "h-40 w-32",
}: {
  name: string;
  label: string;
  value: string | null;
  /** Shown when nothing is uploaded — a repo asset, or the product's own photo. */
  fallback: string | null;
  fallbackNote: string;
  className?: string;
}) {
  const token = useAdminToken();
  const [url, setUrl] = useState(value ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shown = url || fallback;

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("file", await shrinkForUpload(file));
      const result = await uploadImage(token, form);
      if (!result.ok) throw new Error(result.error);
      setUrl(result.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "That photo did not upload.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="block text-[11px] uppercase tracking-[0.18em] text-ink-mute">{label}</span>
      <input type="hidden" name={name} value={url} />

      <div className="flex items-start gap-4">
        <div className={`relative shrink-0 overflow-hidden border border-hairline bg-surface ${className}`}>
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageSrc(shown, 400)} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center px-2 text-center text-[11px] text-ink-mute">
              No photo
            </span>
          )}
          {busy && (
            <span className="absolute inset-0 flex items-center justify-center bg-white/80 text-[11px] uppercase tracking-[0.14em] text-brand">
              Uploading…
            </span>
          )}
        </div>

        <div className="flex flex-col items-start gap-2">
          <label className="inline-flex min-h-[38px] cursor-pointer items-center border border-hairline bg-white px-4 text-[12px] uppercase tracking-[0.1em] text-ink-soft transition-colors hover:border-brand hover:text-brand">
            {shown ? "Choose a new photo" : "Choose a photo"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => pick(e.target.files?.[0])}
              disabled={busy}
              className="hidden"
            />
          </label>

          {isUploaded(url) ? (
            <button
              type="button"
              onClick={() => setUrl("")}
              className="text-[13px] text-ink-mute underline hover:text-brand"
            >
              Remove this photo
            </button>
          ) : (
            <p className="max-w-[220px] text-[13px] leading-relaxed text-ink-mute">{fallbackNote}</p>
          )}

          <p className="max-w-[220px] text-[12px] leading-relaxed text-ink-mute">
            Straight off a phone is fine — it is resized before it is saved.
          </p>
        </div>
      </div>

      {error && <p className="text-[13px] text-red-800">{error}</p>}
      {isUploaded(url) && (
        <p className="text-[12px] text-brand">Photo ready — save below to publish it.</p>
      )}
    </div>
  );
}
