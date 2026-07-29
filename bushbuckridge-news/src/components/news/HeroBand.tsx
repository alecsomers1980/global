import type { PostSummary } from '@/lib/queries';
import ArticleCard from './ArticleCard';
import HeadlineListItem from './HeadlineListItem';

export default function HeroBand({
  feature,
  secondaries,
  headlines,
}: {
  feature: PostSummary | null;
  secondaries: PostSummary[];
  headlines: PostSummary[];
}) {
  if (!feature) return null;

  return (
    <section
      className="w-full"
      style={{ backgroundColor: 'var(--brand-hero-bg)', color: 'var(--brand-hero-text)' }}
    >
      <div className="max-w-[1300px] mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <ArticleCard post={feature} variant="feature" priority />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {secondaries.map(post => (
              <div key={post.id} className="[&_h3]:text-white">
                <ArticleCard post={post} variant="standard" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4">
          {headlines.map(post => (
            <HeadlineListItem key={post.id} post={post} onDark />
          ))}
        </div>
      </div>
    </section>
  );
}