import type { SiteConfig } from '../types';

export const bushnews: SiteConfig = {
  id: 'bushbuckridge-news',
  name: 'Bushbuckridge News',
  tagline: 'Current news in the Bushbuckridge area',
  domains: ['bushnews.co.za'],
  logo: { src: '/sites/bushnews/logo.png', width: 200, height: 48, alt: 'Bushbuckridge News' },
  tokens: {
    accent: '#E60000',
    accentHover: '#CC0000',
    heroBg: '#14141C',
    heroText: '#FFFFFF',
    heroMuted: 'rgba(255,255,255,0.66)',
  },
  nav: [
    { label: 'Community', slug: 'community' },
    { label: 'Crime', slug: 'crime' },
    { label: 'Lifestyle', slug: 'lifestyle' },
    { label: 'Sports', slug: 'sports' },
    { label: 'Politics', slug: 'politics' },
    { label: 'Notice', slug: 'notice' },
  ],
  social: [],
};