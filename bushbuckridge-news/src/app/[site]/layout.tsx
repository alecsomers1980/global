import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSiteById, SITES } from '@/sites/registry';

export function generateStaticParams() {
  return SITES.map(s => ({ site: s.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ site: string }> }
): Promise<Metadata> {
  const { site: siteId } = await params;
  const site = getSiteById(siteId);
  if (!site) return {};
  return { title: site.name, description: site.tagline };
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ site: string }>;
}) {
  const { site: siteId } = await params;
  const site = getSiteById(siteId);
  if (!site) notFound();

  const style = {
    '--brand-accent': site.tokens.accent,
    '--brand-accent-hover': site.tokens.accentHover,
    '--brand-hero-bg': site.tokens.heroBg,
    '--brand-hero-text': site.tokens.heroText,
    '--brand-hero-muted': site.tokens.heroMuted,
  } as React.CSSProperties;

  return <div style={style} className="min-h-screen bg-white text-zinc-900">{children}</div>;
}