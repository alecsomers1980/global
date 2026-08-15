import type { Metadata } from "next";
import Image from "next/image";
import { getGalleryCategories, getGalleryImages } from "@/lib/gallery";
import Reveal from "@/components/site/Reveal";

export const revalidate = 60; // ISR: admin edits go live within a minute, no redeploy needed

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos of Woodpecker Guesthouse — rooms, grounds, restaurant and conferencing venue.",
};

export default async function GalleryPage() {
  const [categories, images] = await Promise.all([getGalleryCategories(), getGalleryImages()]);

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <Reveal className="text-center mb-10">
        <h1 className="font-display text-3xl md:text-5xl text-ink mb-3">Gallery</h1>
        <p className="text-muted max-w-2xl mx-auto">A look around the rooms, grounds and venue.</p>
      </Reveal>
      <div className="border-t border-line mb-12" />
      {images.length === 0 ? (
        <p className="text-muted text-center">Photos are being added — check back soon.</p>
      ) : (
        categories.map((cat) => {
          const catImages = images.filter((img) => img.category_id === cat.id);
          if (catImages.length === 0) return null;
          return (
            <section key={cat.id} className="mb-14">
              <h2 className="font-display text-xl text-ink mb-5">{cat.name}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {catImages.map((img, i) => (
                  <Reveal key={img.id} delay={(i % 4) * 60} className="aspect-square relative overflow-hidden bg-sand/40">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  </Reveal>
                ))}
              </div>
            </section>
          );
        })
      )}
    </main>
  );
}
