import GalleryManager from "@/components/admin/GalleryManager";

export default function AdminGalleryPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-ink">Gallery</h1>
      <GalleryManager />
    </div>
  );
}