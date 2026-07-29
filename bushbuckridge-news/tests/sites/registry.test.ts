import { describe, it, expect } from 'vitest';
import { resolveSiteByHost, getSiteById, DEFAULT_SITE_ID } from '../../src/sites/registry';

describe('resolveSiteByHost', () => {
  it('resolves the production domain', () => {
    expect(resolveSiteByHost('bushnews.co.za')?.id).toBe('bushbuckridge-news');
  });

  it('ignores a www prefix', () => {
    expect(resolveSiteByHost('www.bushnews.co.za')?.id).toBe('bushbuckridge-news');
  });

  it('ignores a port', () => {
    expect(resolveSiteByHost('bushnews.co.za:3000')?.id).toBe('bushbuckridge-news');
  });

  it('is case insensitive', () => {
    expect(resolveSiteByHost('BushNews.CO.ZA')?.id).toBe('bushbuckridge-news');
  });

  it('falls back to the default site on localhost', () => {
    expect(resolveSiteByHost('localhost:3000')?.id).toBe(DEFAULT_SITE_ID);
  });

  it('falls back to the default site on a vercel preview', () => {
    expect(resolveSiteByHost('newsroom-abc123.vercel.app')?.id).toBe(DEFAULT_SITE_ID);
  });

  it('returns null for an unknown host', () => {
    expect(resolveSiteByHost('example.com')).toBeNull();
  });

  it('returns null for a missing host', () => {
    expect(resolveSiteByHost(null)).toBeNull();
  });
});

describe('getSiteById', () => {
  it('finds Bushnews', () => {
    expect(getSiteById('bushbuckridge-news')?.name).toBe('Bushbuckridge News');
  });

  it('returns undefined for an unknown id', () => {
    expect(getSiteById('nope')).toBeUndefined();
  });
});

describe('site config integrity', () => {
  it('gives Bushnews six nav categories', () => {
    expect(getSiteById('bushbuckridge-news')!.nav).toHaveLength(6);
  });

  it('never lists top-story or uncategorized in the nav', () => {
    const slugs = getSiteById('bushbuckridge-news')!.nav.map(n => n.slug);
    expect(slugs).not.toContain('top-story');
    expect(slugs).not.toContain('uncategorized');
  });
});