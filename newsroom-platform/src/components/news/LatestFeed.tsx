'use client';

import { useState } from 'react';
import type { PostSummary } from '@/lib/queries';
import ArticleRow from './ArticleRow';
import SectionHeading from './SectionHeading';
import { loadMorePosts } from '@/lib/actions';

const PAGE_SIZE = 6;

export default function LatestFeed({
  siteId,
  initialPosts,
  excludeIds,
}: {
  siteId: string;
  initialPosts: PostSummary[];
  excludeIds: string[];
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [exhausted, setExhausted] = useState(initialPosts.length < PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    setLoading(true);
    const next = await loadMorePosts(siteId, posts.length, excludeIds);
    setPosts(current => [...current, ...next]);
    setExhausted(next.length < PAGE_SIZE);
    setLoading(false);
  }

  return (
    <div>
      <SectionHeading>Latest story</SectionHeading>

      <div className="flex flex-col gap-10">
        {posts.map(post => (
          <ArticleRow key={post.id} post={post} />
        ))}
      </div>

      {!exhausted && (
        <div className="flex items-center gap-6 mt-12">
          <span className="flex-1 h-px bg-[var(--color-hairline)]" />
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 text-sm font-bold uppercase tracking-wide border border-[var(--color-hairline)] hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] transition-colors disabled:opacity-60"
          >
            {loading ? 'Loading…' : 'Load More'}
          </button>
          <span className="flex-1 h-px bg-[var(--color-hairline)]" />
        </div>
      )}
    </div>
  );
}