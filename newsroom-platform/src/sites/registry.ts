import type { SiteConfig } from './types';
import { bushnews } from './bushnews/config';

export const SITES: SiteConfig[] = [bushnews];
export const DEFAULT_SITE_ID = 'bushbuckridge-news';

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0'];

export function getSiteById(id: string): SiteConfig | undefined {
  return SITES.find(s => s.id === id);
}

export function resolveSiteByHost(host: string | null): SiteConfig | null {
  if (!host) return null;

  const bare = host.toLowerCase().split(':')[0].replace(/^www\./, '');

  if (LOCAL_HOSTS.includes(bare) || bare.endsWith('.vercel.app')) {
    return getSiteById(DEFAULT_SITE_ID) ?? null;
  }

  return SITES.find(s => s.domains.includes(bare)) ?? null;
}