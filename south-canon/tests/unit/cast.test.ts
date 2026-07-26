import { describe, it, expect } from 'vitest'
import { formatCastSize } from '@/lib/cast'
import type { CastRole } from '@/lib/types'

const role = (over: Partial<CastRole>): CastRole => ({
  id: crypto.randomUUID(),
  name: 'Role',
  gender: 'any',
  ageRange: null,
  description: null,
  isEnsemble: false,
  sort: 0,
  ...over,
})

describe('formatCastSize', () => {
  it('returns an empty string when there are no roles', () => {
    expect(formatCastSize([])).toBe('')
  })

  it('counts male and female roles', () => {
    const roles = [
      role({ gender: 'male' }),
      role({ gender: 'male' }),
      role({ gender: 'male' }),
      role({ gender: 'female' }),
      role({ gender: 'female' }),
    ]
    expect(formatCastSize(roles)).toBe('3m, 2f')
  })

  it('reports any-gender roles separately', () => {
    const roles = [role({ gender: 'male' }), role({ gender: 'any' }), role({ gender: 'any' })]
    expect(formatCastSize(roles)).toBe('1m, 2 any gender')
  })

  it('appends ensemble without counting it', () => {
    const roles = [
      role({ gender: 'female' }),
      role({ gender: 'male' }),
      role({ isEnsemble: true, name: 'Ensemble' }),
    ]
    expect(formatCastSize(roles)).toBe('1m, 1f + ensemble')
  })

  it('handles an ensemble-only cast', () => {
    expect(formatCastSize([role({ isEnsemble: true })])).toBe('Ensemble')
  })
})
