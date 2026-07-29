import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/media';
import type { PostSummary } from '@/lib/queries';
import SectionHeading from './SectionHeading';

export default function PopularPosts({ posts }: { posts: PostSummary[] }) {
  if (!posts.length) return null;

  const [lead, ...rest] = posts;

  return (
    <section>
      <SectionHeading>Popular posts</SectionHeading>

      <Link href={`/article/${lead.slug}`} className="block img-zoom">
        <div className="relative w-full aspect-[16/9]">
          <Image
            src={getImageUrl(lead.featured_image)}
            alt={lead.title}
            fill
            sizes="300px"
            className="object-cover"
          />
        </div>
      </Link>

      <div className="flex items-start gap-4 py-4 border-b border-[var(--color-hairline)]">
        <Link href={`/article/${lead.slug}`} className="flex-1">
          <h4 className="font-bold leading-snug hover:text-[var(--brand-accent)] transition-colors">
            {lead.title}
          </h4>
        </Link>
        <span className="text-3xl font-bold text-[var(--color-hairline)] tabular-nums">01</span>
      </div>

      <ol className="flex flex-col">
        {rest.map((post, i) => (
          <li
            key={post.id}
            className="flex items-start gap-4 py-4 border-b border-[var(--color-hairline)] last:border-b-0"
          >
            <span className="w-10 h-10 shrink-0 rounded-full border border-[var(--color-hairline)] flex items-center justify-center text-sm font-bold text-[var(--color-muted)] tabular-nums">
              {String(i + 2).padStart(2, '0')}
            </span>
            <Link href={`/article/${post.slug}`}>
              <h4 className="text-sm font-bold leading-snug hover:text-[var(--brand-accent)] transition-colors">
                {post.title}
              </h4>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}