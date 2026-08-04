import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSiteById } from '@/sites/registry';
import { getPostsByCategory, getPopularPosts, getActiveAd } from '@/lib/queries';
import SiteHeader from '@/components/news/SiteHeader';
import SiteFooter from '@/components/news/SiteFooter';
import SectionHeading from '@/components/news/SectionHeading';
import ArticleRow from '@/components/news/ArticleRow';
import Sidebar from '@/components/news/Sidebar';

export const revalidate = 300;

type Props = { params: Promise<{ site: string; category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { site: siteId, category } = await params;
  const site = getSiteById(siteId);
  const item = site?.nav.find(n => n.slug === category);
  return item && site ? { title: `${item.label} — ${site.name}` } : {};
}

export default async function CategoryPage({ params }: Props) {
  const { site: siteId, category: slug } = await params;
  const site = getSiteById(siteId);
  if (!site) notFound();
  if (!site.nav.some(n => n.slug === slug)) notFound();

  const { category, posts } = await getPostsByCategory(site.id, slug, { limit: 12 });
  if (!category) notFound();

  const [popular, ad] = await Promise.all([getPopularPosts(site.id, 5), getActiveAd(site.id)]);

  return (
    <>
      <SiteHeader site={site} />
      <section className="max-w-[1300px] mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <SectionHeading>{category.name}</SectionHeading>
          {posts.length === 0 ? (
            <p className="text-[var(--color-muted)]">No stories in this section yet.</p>
          ) : (
            <div className="flex flex-col gap-10">
              {posts.map(post => <ArticleRow key={post.id} post={post} />)}
            </div>
          )}
        </div>
        <div className="lg:col-span-4">
          <Sidebar ad={ad} popular={popular} />
        </div>
      </section>
      <SiteFooter site={site} recentPosts={posts.slice(0, 3)} />
    </>
  );
}