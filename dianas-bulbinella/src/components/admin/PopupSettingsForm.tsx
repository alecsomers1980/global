"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

type Settings = {
  popup_enabled: boolean;
  popup_image: string;
  popup_alt: string;
  popup_link: string;
};

export default function PopupSettingsForm({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initial.popup_enabled);
  const [image, setImage] = useState(initial.popup_image);
  const [alt, setAlt] = useState(initial.popup_alt);
  const [link, setLink] = useState(initial.popup_link);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setMessage(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/popup/upload", {
        method: "POST",
        body,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setImage(json.url);
      setMessage({
        type: "success",
        text: "Image uploaded — remember to save.",
      });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Upload failed" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("site_settings")
      .update({
        popup_enabled: enabled,
        popup_image: image,
        popup_alt: alt,
        popup_link: link,
      })
      .eq("id", 1);

    if (error) {
      setMessage({ type: "error", text: error.message });
      setSaving(false);
      return;
    }
    setMessage({ type: "success", text: "Saved" });
    setSaving(false);
    router.refresh();
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink mb-1">Home page popup</h1>
      <p className="text-sm text-muted mb-6">
        Shows on the home page only, once a month per visitor.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-line text-forest focus:ring-forest"
            />
            <label htmlFor="enabled" className="text-sm text-ink">
              Show the popup
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Image
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm flex-1 outline-none focus:border-forest"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="/images/popup.jpeg or upload"
              />
              <label className="shrink-0 cursor-pointer rounded-xl border border-line bg-white px-3 py-2.5 text-xs font-medium text-ink hover:bg-surface-2 transition-colors">
                {uploading ? "Uploading…" : "Upload"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Description{" "}
              <span className="font-normal text-muted">(for screen readers)</span>
            </label>
            <input
              type="text"
              className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="e.g. July specials"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Links to{" "}
              <span className="font-normal text-muted">(optional)</span>
            </label>
            <input
              type="text"
              className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm w-full outline-none focus:border-forest"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="/specials"
            />
            <p className="text-xs text-muted mt-1">
              Where clicking the popup takes visitors. Leave blank for no link.
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-ink mb-2">Preview</p>
          {image ? (
            <div className="relative w-full max-w-xs rounded-xl overflow-hidden border border-line bg-surface-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Image
                src={image}
                alt={alt || "Popup preview"}
                width={400}
                height={533}
                className="w-full h-auto"
              />
            </div>
          ) : (
            <div className="w-full max-w-xs aspect-[3/4] rounded-xl border border-line bg-surface-2 flex items-center justify-center text-sm text-muted">
              No image
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-forest text-white px-5 py-2.5 text-sm font-semibold hover:bg-moss transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {message && (
          <span
            className={`text-sm ${
              message.type === "success" ? "text-forest" : "text-red-600"
            }`}
          >
            {message.text}
          </span>
        )}
      </div>
    </div>
  );
}
