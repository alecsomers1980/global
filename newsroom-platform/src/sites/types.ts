export type BrandTokens = {
  accent: string;
  accentHover: string;
  heroBg: string;
  heroText: string;
  heroMuted: string;
};

export type NavItem = { label: string; slug: string };

export type SiteConfig = {
  id: string;
  name: string;
  tagline: string;
  domains: string[];
  logo: { src: string; width: number; height: number; alt: string };
  tokens: BrandTokens;
  nav: NavItem[];
  social: { label: string; href: string }[];
};