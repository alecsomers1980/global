import Link from 'next/link';
import type { PostSummary } from '@/lib/queries';
import CategoryPill from './CategoryPill';
import Byline from './Byline';

export default function HeadlineListItem({
  post,
  onDark = false,
}: {
  post: PostSummary;
  onDark?: boolean;
}) {
  const category = post.categories[0];

  return (
    <article className="flex flex-col gap-2 py-5 border-b border-white/10 last:border-b-0">
      {category && <CategoryPill category={category} />}
      <Link href={`/article/${post.slug}`}>
        <h4
          className="text-lg font-bold leading-snug text-balance hover:opacity-80 transition-opacity"
          style={onDark ? { color: 'var(--brand-hero-text)' } : undefined}
        >
          {post.title}
        </h4>
      </Link>
      <Byline author={null} publishedAt={post.published_at} onDark={onDark} />
    </article>
  );
}