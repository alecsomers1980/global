import type { Metadata } from "next";
import Image from "next/image";
import { getGalleryCategories, getGalleryImages } from "@/lib/gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos of Woodpecker Guesthouse — rooms, grounds, restaurant and conferencing venue.",
};

export default async function GalleryPage() {
  const [categories, images] = await Promise.all([getGalleryCategories(), getGalleryImages()]);

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl text-ink mb-10">Gallery</h1>
      {images.length === 0 ? (
        <p className="text-muted">Photos are being added — check back soon.</p>
      ) : (
        categories.map((cat) => {
          const catImages = images.filter((img) => img.category_id === cat.id);
          if (catImages.length === 0) return null;
          return (
            <section key={cat.id} className="mb-12">
              <h2 className="font-display text-xl text-ink mb-4">{cat.name}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {catImages.map((img) => (
                  <div key={img.id} className="aspect-square relative rounded-lg overflow-hidden bg-sand/40">
                    <Image src={img.src} alt={img.alt} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </section>
          );
        })
      )}
    </main>
  );
}