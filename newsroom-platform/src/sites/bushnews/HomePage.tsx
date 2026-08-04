import type { SiteConfig } from '../types';
import {
  getHeroPosts, getTrendingPosts, getLatestPosts, getPopularPosts, getActiveAd,
} from '@/lib/queries';
import SiteHeader from '@/components/news/SiteHeader';
import SiteFooter from '@/components/news/SiteFooter';
import HeroBand from '@/components/news/HeroBand';
import TrendingCarousel from '@/components/news/TrendingCarousel';
import LatestFeed from '@/components/news/LatestFeed';
import Sidebar from '@/components/news/Sidebar';

export default async function BushnewsHomePage({ site }: { site: SiteConfig }) {
  const hero = await getHeroPosts(site.id);
  const heroIds = [hero.feature?.id, ...hero.secondaries.map(p => p.id), ...hero.headlines.map(p => p.id)]
    .filter((id): id is string => !!id);

  const [trending, latest, popular, ad] = await Promise.all([
    getTrendingPosts(site.id, heroIds),
    getLatestPosts(site.id, { limit: 6, excludeIds: heroIds }),
    getPopularPosts(site.id, 5),
    getActiveAd(site.id),
  ]);

  return (
    <>
      <SiteHeader site={site} />
      <HeroBand {...hero} />
      <TrendingCarousel posts={trending} />

      <section className="max-w-[1300px] mx-auto px-6 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <LatestFeed siteId={site.id} initialPosts={latest} excludeIds={heroIds} />
        </div>
        <div className="lg:col-span-4">
          <Sidebar ad={ad} popular={popular} />
        </div>
      </section>

      <SiteFooter site={site} recentPosts={latest} />
    </>
  );
}