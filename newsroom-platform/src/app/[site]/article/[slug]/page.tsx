import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getSiteById } from '@/sites/registry';
import { getPostBySlug, getPopularPosts, getActiveAd } from '@/lib/queries';
import { getImageUrl } from '@/lib/media';
import SiteHeader from '@/components/news/SiteHeader';
import SiteFooter from '@/components/news/SiteFooter';
import Sidebar from '@/components/news/Sidebar';
import CategoryPill from '@/components/news/CategoryPill';
import Byline from '@/components/news/Byline';
import ViewBeacon from '@/components/news/ViewBeacon';

export const revalidate = 300;

type Props = { params: Promise<{ site: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { site: siteId, slug } = await params;
  const site = getSiteById(siteId);
  if (!site) return {};
  const post = await getPostBySlug(site.id, slug);
  if (!post) return {};
  return {
    title: `${post.title} — ${site.name}`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.featured_image ? [getImageUrl(post.featured_image)] : [],
      type: 'article',
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { site: siteId, slug } = await params;
  const site = getSiteById(siteId);
  if (!site) notFound();

  const post = await getPostBySlug(site.id, slug);
  if (!post) notFound();

  const [popular, ad] = await Promise.all([getPopularPosts(site.id, 5), getActiveAd(site.id)]);

  return (
    <>
      <SiteHeader site={site} />
      <ViewBeacon slug={post.slug} siteId={site.id} />

      <article className="max-w-[1300px] mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 flex flex-col gap-6">
          {post.categories[0] && <CategoryPill category={post.categories[0]} variant="solid" />}
          <h1 className="text-3xl md:text-5xl font-bold leading-tight text-balance">{post.title}</h1>
          <Byline author={post.author} publishedAt={post.published_at} />

          {post.featured_image && (
            <div className="relative w-full aspect-[16/9]">
              <Image
                src={getImageUrl(post.featured_image)}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
            </div>
          )}

          <div
            className="prose max-w-[68ch] text-[17px] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        <div className="lg:col-span-4">
          <Sidebar ad={ad} popular={popular} />
        </div>
      </article>

      <SiteFooter site={site} recentPosts={popular.slice(0, 3)} />
    </>
  );
}