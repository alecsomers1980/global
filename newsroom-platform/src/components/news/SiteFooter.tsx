import Link from 'next/link';
import Image from 'next/image';
import type { SiteConfig } from '@/sites/types';
import type { PostSummary } from '@/lib/queries';
import NewsletterForm from './NewsletterForm';

export default function SiteFooter({
  site,
  recentPosts,
}: {
  site: SiteConfig;
  recentPosts: PostSummary[];
}) {
  return (
    <footer className="bg-[var(--color-surface-alt)] border-t border-[var(--color-hairline)] mt-20">
      <div className="max-w-[1300px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="flex flex-col gap-4">
          <Image
            src={site.logo.src}
            alt={site.logo.alt}
            width={site.logo.width}
            height={site.logo.height}
            className="h-9 w-auto"
          />
          <p className="text-sm leading-relaxed text-[var(--color-muted)]">{site.tagline}</p>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold">Recent Posts</h3>
          <ul className="flex flex-col gap-3">
            {recentPosts.slice(0, 3).map(post => (
              <li key={post.id}>
                <Link
                  href={`/article/${post.slug}`}
                  className="text-sm leading-snug hover:text-[var(--brand-accent)] transition-colors"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold">Categories</h3>
          <ul className="grid grid-cols-2 gap-y-2">
            {site.nav.map(item => (
              <li key={item.slug}>
                <Link
                  href={`/${item.slug}`}
                  className="text-sm hover:text-[var(--brand-accent)] transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold">Weekly Newsletter</h3>
          <p className="text-sm leading-relaxed text-[var(--color-muted)]">
            Get the week&apos;s Bushbuckridge headlines in your inbox.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-[var(--color-hairline)]">
        <div className="max-w-[1300px] mx-auto px-6 py-5 text-xs text-[var(--color-muted)]">
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}