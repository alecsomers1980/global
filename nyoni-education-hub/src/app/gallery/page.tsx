import { Metadata } from "next";
import { ImageIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Gallery | Nyoni",
  description: "A glimpse into life at Nyoni – coming soon.",
};

const TILE_COLORS = [
  "from-brand-teal to-brand-navy",
  "from-brand-sky to-brand-teal",
  "from-brand-sand to-brand-cream",
  "from-brand-navy to-brand-sky",
  "from-brand-cream to-brand-sand",
  "from-brand-teal to-brand-sky",
  "from-brand-sand to-brand-teal",
  "from-brand-navy to-brand-teal",
  "from-brand-sky to-brand-sand",
  "from-brand-cream to-brand-teal",
  "from-brand-teal to-brand-sand",
  "from-brand-navy to-brand-cream",
];

const PLACEHOLDER_NOTE = "📷 Photos coming soon — these tiles are placeholders.";

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="px-4 pt-20 pb-12 md:px-8 max-w-6xl mx-auto text-center">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-brand-navy mb-4">
          Gallery
        </h1>
        <p className="text-brand-navy/70 max-w-xl mx-auto">
          A visual taste of our warm, child‑centred environment. We’ll be adding real
          photos very soon!
        </p>
      </section>

      {/* Placeholder note */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-6">
        <p className="text-sm text-brand-navy/60 italic text-center">
          {PLACEHOLDER_NOTE}
        </p>
      </div>

      {/* Placeholder grid */}
      <section className="px-4 pb-24 md:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {TILE_COLORS.map((gradient, i) => (
            <div
              key={i}
              className={`aspect-square rounded-2xl bg-gradient-to-br ${gradient} shadow-md flex items-center justify-center`}
            >
              <ImageIcon className="w-12 h-12 text-white/90" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
