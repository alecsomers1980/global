'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PostSummary } from '@/lib/queries';
import ArticleCard from './ArticleCard';
import SectionHeading from './SectionHeading';

export default function TrendingCarousel({ posts }: { posts: PostSummary[] }) {
  const track = useRef<HTMLDivElement>(null);

  function scroll(direction: -1 | 1) {
    track.current?.scrollBy({ left: direction * track.current.clientWidth, behavior: 'smooth' });
  }

  if (!posts.length) return null;

  return (
    <section className="max-w-[1300px] mx-auto px-6 py-14">
      <SectionHeading>Trending</SectionHeading>

      <div
        ref={track}
        className="grid grid-flow-col auto-cols-[minmax(240px,1fr)] md:auto-cols-[minmax(0,25%)] gap-7 overflow-x-auto scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        {posts.map(post => (
          <ArticleCard key={post.id} post={post} variant="compact" />
        ))}
      </div>

      <div className="flex gap-2 mt-8">
        <button
          onClick={() => scroll(-1)}
          aria-label="Previous trending stories"
          className="w-9 h-9 border border-[var(--color-hairline)] flex items-center justify-center hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => scroll(1)}
          aria-label="Next trending stories"
          className="w-9 h-9 border border-[var(--color-hairline)] flex items-center justify-center hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}