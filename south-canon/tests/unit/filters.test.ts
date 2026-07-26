import { describe, it, expect } from 'vitest'
import { parseFilters, filtersToSearchParams } from '@/lib/filters'

describe('parseFilters', () => {
  it('returns empty filters for empty params', () => {
    expect(parseFilters({})).toEqual({ genres: [] })
  })

  it('reads a search term', () => {
    expect(parseFilters({ q: 'palace' }).q).toBe('palace')
  })

  it('trims a search term and drops it when blank', () => {
    expect(parseFilters({ q: '   ' }).q).toBeUndefined()
  })

  it('normalises a single genre to an array', () => {
    expect(parseFilters({ genre: 'drama' }).genres).toEqual(['drama'])
  })

  it('keeps multiple genres', () => {
    expect(parseFilters({ genre: ['drama', 'comedy'] }).genres).toEqual(['drama', 'comedy'])
  })

  it('parses numeric bounds and ignores rubbish', () => {
    expect(parseFilters({ castMax: '6' }).castMax).toBe(6)
    expect(parseFilters({ castMax: 'abc' }).castMax).toBeUndefined()
    expect(parseFilters({ durationMax: '120' }).durationMax).toBe(120)
  })

  it('accepts only known territories', () => {
    expect(parseFilters({ territory: 'South Africa' }).territory).toBe('South Africa')
    expect(parseFilters({ territory: 'Atlantis' }).territory).toBeUndefined()
  })
})

describe('filtersToSearchParams', () => {
  it('round-trips through parseFilters', () => {
    const filters = {
      q: 'palace',
      genres: ['drama', 'comedy'],
      castMax: 6,
      durationMax: 120,
      territory: 'South Africa' as const,
    }
    const sp = filtersToSearchParams(filters)
    expect(parseFilters(Object.fromEntries(sp.entries()) as Record<string, string>)).toMatchObject({
      q: 'palace',
      castMax: 6,
      durationMax: 120,
      territory: 'South Africa',
    })
  })

  it('omits empty values', () => {
    expect(filtersToSearchParams({ genres: [] }).toString()).toBe('')
  })
})
