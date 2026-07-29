import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/media';
import type { PostSummary } from '@/lib/queries';
import CategoryPill from './CategoryPill';
import Byline from './Byline';

const RATIO = {
  feature: 'aspect-[16/10]',
  standard: 'aspect-[16/9]',
  compact: 'aspect-[4/3]',
};

export default function ArticleCard({
  post,
  variant = 'standard',
  priority = false,
}: {
  post: PostSummary;
  variant?: 'feature' | 'standard' | 'compact';
  priority?: boolean;
}) {
  const category = post.categories[0];

  if (variant === 'feature') {
    return (
      <Link href={`/article/${post.slug}`} className="group block relative img-zoom">
        <div className={`relative w-full ${RATIO.feature}`}>
          <Image
            src={getImageUrl(post.featured_image)}
            alt={post.title}
            fill
            priority={priority}
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-3">
          {category && <CategoryPill category={category} variant="solid" />}
          <h2 className="text-2xl md:text-3xl font-bold text-white text-balance leading-tight">
            {post.title}
          </h2>
          <Byline author={post.author} publishedAt={post.published_at} onDark />
        </div>
      </Link>
    );
  }

  return (
    <article className="flex flex-col gap-3">
      <Link href={`/article/${post.slug}`} className="block img-zoom">
        <div className={`relative w-full ${RATIO[variant]}`}>
          <Image
            src={getImageUrl(post.featured_image)}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
      </Link>
      {category && <CategoryPill category={category} />}
      <Link href={`/article/${post.slug}`}>
        <h3 className="font-bold leading-snug text-balance hover:text-[var(--brand-accent)] transition-colors">
          {post.title}
        </h3>
      </Link>
      <Byline author={post.author} publishedAt={post.published_at} />
    </article>
  );
}