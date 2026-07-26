import { describe, it, expect } from 'vitest'
import { listPlays, listGenres } from '@/lib/plays'

describe('listPlays', () => {
  it('returns the seeded play', async () => {
    const plays = await listPlays({ genres: [] })
    expect(plays.some((p) => p.slug === 'saturday-night-at-the-palace')).toBe(true)
  })

  it('filters by playwright slug', async () => {
    const plays = await listPlays({ genres: [], playwright: 'paul-slabolepszy' })
    expect(plays.length).toBeGreaterThan(0)
    expect(plays.every((p) => p.credits.some((c) => c.slug === 'paul-slabolepszy'))).toBe(true)
  })
})

describe('listGenres', () => {
  it('includes Drama from the seeded play', async () => {
    expect(await listGenres()).toContain('Drama')
  })
})
