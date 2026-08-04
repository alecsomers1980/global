import { notFound } from 'next/navigation';
import { getSiteById } from '@/sites/registry';
import type { SiteConfig } from '@/sites/types';
import BushnewsHomePage from '@/sites/bushnews/HomePage';

export const revalidate = 300;

/** Each site supplies its own homepage composition. Add a line per new title. */
type HomePageComponent = (props: { site: SiteConfig }) => Promise<React.ReactElement>;

const HOME_PAGES: Record<string, HomePageComponent> = {
  'bushbuckridge-news': BushnewsHomePage,
};

export default async function Page({ params }: { params: Promise<{ site: string }> }) {
  const { site: siteId } = await params;
  const site = getSiteById(siteId);
  if (!site) notFound();

  const HomePage = HOME_PAGES[site.id];
  if (!HomePage) notFound();

  return <HomePage site={site} />;
}