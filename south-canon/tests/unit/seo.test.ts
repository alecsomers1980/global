import { describe, it, expect } from 'vitest'
import { playSchema, playwrightSchema } from '@/lib/seo'
import type { PlayDetail, PlaywrightDetail } from '@/lib/types'

const play = {
  id: '1',
  title: 'Saturday Night at the Palace',
  slug: 'saturday-night-at-the-palace',
  logline: 'A late-night roadhouse encounter.',
  genres: ['Drama'],
  durationMin: 90,
  heroImageUrl: null,
  castSummary: '3m',
  credits: [{ name: 'Paul Slabolepszy', slug: 'paul-slabolepszy', role: 'author' as const }],
  synopsisShort: null,
  synopsisFull: null,
  yearWritten: 1982,
  acts: 1,
  languages: ['English'],
  themes: [],
  contentWarnings: [],
  setting: null,
  timePeriod: null,
  targetAudience: null,
  isMusical: false,
  roles: [],
  media: [],
  press: [],
  productions: [],
  rights: [],
} as PlayDetail

describe('playSchema', () => {
  it('emits a CreativeWork with the author and canonical url', () => {
    const schema = playSchema(play)
    expect(schema['@type']).toBe('CreativeWork')
    expect(schema.name).toBe('Saturday Night at the Palace')
    expect(schema.author).toEqual([{ '@type': 'Person', name: 'Paul Slabolepszy' }])
    expect(schema.url).toBe('https://southcanon.com/plays/saturday-night-at-the-palace')
  })

  it('encodes duration as an ISO 8601 period', () => {
    expect(playSchema(play).timeRequired).toBe('PT90M')
  })

  it('omits duration when unknown', () => {
    expect(playSchema({ ...play, durationMin: null }).timeRequired).toBeUndefined()
  })
})

describe('playwrightSchema', () => {
  it('emits a Person with their works', () => {
    const w = {
      id: '1',
      name: 'Paul Slabolepszy',
      slug: 'paul-slabolepszy',
      bio: 'A writer.',
      portraitUrl: null,
      country: 'South Africa',
      honours: [],
      representedSince: null,
      plays: [play],
    } as PlaywrightDetail
    const schema = playwrightSchema(w)
    expect(schema['@type']).toBe('Person')
    expect(schema.name).toBe('Paul Slabolepszy')
    expect(schema.knowsAbout).toContain('Saturday Night at the Palace')
  })
})