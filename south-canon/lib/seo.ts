import type { PlayDetail, PlaywrightDetail } from './types'

export const SITE_URL = 'https://southcanon.com'

/* eslint-disable @typescript-eslint/no-explicit-any */
export function playSchema(play: PlayDetail): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: play.title,
    url: `${SITE_URL}/plays/${play.slug}`,
    description: play.logline ?? play.synopsisShort ?? undefined,
    genre: play.genres.length ? play.genres : undefined,
    inLanguage: play.languages.length ? play.languages : undefined,
    dateCreated: play.yearWritten ? String(play.yearWritten) : undefined,
    timeRequired: play.durationMin ? `PT${play.durationMin}M` : undefined,
    image: play.heroImageUrl ?? undefined,
    author: play.credits.map((c) => ({ '@type': 'Person', name: c.name })),
  }
}

export function playwrightSchema(w: PlaywrightDetail): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: w.name,
    url: `${SITE_URL}/playwrights/${w.slug}`,
    description: w.bio ?? undefined,
    nationality: w.country ?? undefined,
    image: w.portraitUrl ?? undefined,
    knowsAbout: w.plays.map((p) => p.title),
  }
}