import { notFound } from 'next/navigation';
import { getSiteById } from '@/sites/registry';
import { searchPosts, getPopularPosts, getActiveAd } from '@/lib/queries';
import SiteHeader from '@/components/news/SiteHeader';
import SiteFooter from '@/components/news/SiteFooter';
import SectionHeading from '@/components/news/SectionHeading';
import ArticleRow from '@/components/news/ArticleRow';
import Sidebar from '@/components/news/Sidebar';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ site: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { site: siteId } = await params;
  const { q = '' } = await searchParams;

  const site = getSiteById(siteId);
  if (!site) notFound();

  const [posts, popular, ad] = await Promise.all([
    searchPosts(site.id, q),
    getPopularPosts(site.id, 5),
    getActiveAd(site.id),
  ]);

  return (
    <>
      <SiteHeader site={site} />
      <section className="max-w-[1300px] mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <SectionHeading>
            {q ? `${posts.length} result${posts.length === 1 ? '' : 's'} for “${q}”` : 'Search'}
          </SectionHeading>
          <div className="flex flex-col gap-10">
            {posts.map(post => <ArticleRow key={post.id} post={post} />)}
          </div>
          {q && posts.length === 0 && (
            <p className="text-[var(--color-muted)]">
              Nothing matched that search. Try a different word.
            </p>
          )}
        </div>
        <div className="lg:col-span-4">
          <Sidebar ad={ad} popular={popular} />
        </div>
      </section>
      <SiteFooter site={site} recentPosts={popular.slice(0, 3)} />
    </>
  );
}