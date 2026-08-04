import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/media';
import type { PostSummary } from '@/lib/queries';
import Byline from './Byline';

export default function ArticleRow({ post }: { post: PostSummary }) {
  return (
    <article className="flex flex-col sm:flex-row gap-5">
      <Link href={`/article/${post.slug}`} className="block img-zoom shrink-0">
        <div className="relative w-full sm:w-[260px] aspect-[4/3]">
          <Image
            src={getImageUrl(post.featured_image)}
            alt={post.title}
            fill
            sizes="260px"
            className="object-cover"
          />
        </div>
      </Link>
      <div className="flex flex-col gap-2">
        <Link href={`/article/${post.slug}`}>
          <h3 className="text-xl md:text-2xl font-bold leading-tight text-balance hover:text-[var(--brand-accent)] transition-colors">
            {post.title}
          </h3>
        </Link>
        <Byline author={post.author} publishedAt={post.published_at} />
        <p className="text-[15px] leading-relaxed text-[var(--color-muted)]">{post.excerpt}</p>
      </div>
    </article>
  );
}