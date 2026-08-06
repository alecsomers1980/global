import Link from 'next/link';
import Image from 'next/image';
import Reveal from '@/components/motion/Reveal';
import { CATEGORY_LABELS, CATEGORY_SLUGS } from '@/lib/supabase/types';
import type { ProductCategory } from '@/lib/supabase/types';

interface RangeGridBeatProps {
  categories: {
    category: ProductCategory;
    count: number;
    image: { url: string; alt: string } | null;
  }[];
}

export default function RangeGridBeat({ categories }: RangeGridBeatProps) {
  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-20">
        <p className="text-xs uppercase tracking-[0.35em] text-muted">Four styles, six colours, sizes 4 to 15</p>
        <h2 className="display text-4xl md:text-5xl text-text mt-2">The Range</h2>
      </div>

      <Reveal>
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.category}
              href={`/range/${CATEGORY_SLUGS[cat.category]}`}
              className="group block bg-canvas rounded-lg overflow-hidden border border-text/5 hover:border-accent transition-colors"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-canvas">
                {cat.image ? (
                  <Image
                    src={cat.image.url}
                    alt={cat.image.alt}
                    fill
                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-canvas">
                    <svg
                      className="h-12 w-12 text-accent/30"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 48 48"
                    >
                      <circle cx="24" cy="24" r="20" />
                      <path d="M14 20 L8 4 L20 14 Z" />
                      <path d="M28 14 L40 4 L34 20 Z" />
                    </svg>
                    <span className="mt-2 text-xs text-muted">
                      {CATEGORY_LABELS[cat.category]}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium text-text">
                  {CATEGORY_LABELS[cat.category]}
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  {cat.count} {cat.count === 1 ? 'style' : 'styles'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Reveal>
    </div>
  );
}