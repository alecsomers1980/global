import { describe, it, expect } from 'vitest'
import { resolveAvailability } from '@/lib/availability'
import type { RightsRow } from '@/lib/types'

const row = (over: Partial<RightsRow>): RightsRow => ({
  id: crypto.randomUUID(),
  territory: 'South Africa',
  tierId: null,
  status: 'available',
  restrictionNote: null,
  validFrom: null,
  validTo: null,
  ...over,
})

const on = new Date('2026-08-01')

describe('resolveAvailability', () => {
  it('is unavailable when no rights row covers the territory', () => {
    expect(resolveAvailability([], 'South Africa', on)).toEqual({
      status: 'unavailable',
      note: null,
    })
  })

  it('returns the status for a matching territory', () => {
    const rows = [row({ territory: 'South Africa', status: 'available' })]
    expect(resolveAvailability(rows, 'South Africa', on).status).toBe('available')
  })

  it('ignores rows for other territories', () => {
    const rows = [row({ territory: 'United Kingdom', status: 'available' })]
    expect(resolveAvailability(rows, 'South Africa', on).status).toBe('unavailable')
  })

  it('ignores rows whose window has closed', () => {
    const rows = [row({ status: 'available', validTo: '2026-07-01' })]
    expect(resolveAvailability(rows, 'South Africa', on).status).toBe('unavailable')
  })

  it('ignores rows whose window has not opened', () => {
    const rows = [row({ status: 'available', validFrom: '2026-09-01' })]
    expect(resolveAvailability(rows, 'South Africa', on).status).toBe('unavailable')
  })

  it('takes the most restrictive status when rows conflict', () => {
    const rows = [
      row({ status: 'available' }),
      row({ status: 'restricted', restrictionNote: 'Professional run until Dec 2026' }),
    ]
    expect(resolveAvailability(rows, 'South Africa', on)).toEqual({
      status: 'restricted',
      note: 'Professional run until Dec 2026',
    })
  })

  it('lets unavailable beat restricted', () => {
    const rows = [row({ status: 'restricted' }), row({ status: 'unavailable', restrictionNote: 'Withdrawn' })]
    expect(resolveAvailability(rows, 'South Africa', on)).toEqual({
      status: 'unavailable',
      note: 'Withdrawn',
    })
  })
})
