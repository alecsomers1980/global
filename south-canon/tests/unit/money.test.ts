import { describe, it, expect } from 'vitest'
import { formatZar } from '@/lib/money'

describe('formatZar', () => {
  it('formats whole rands without decimals', () => {
    expect(formatZar(1500)).toBe('R1 500')
  })

  it('uses a plain space as the thousands separator, never a non-breaking space', () => {
    expect(formatZar(1500)).not.toContain('\u00a0') // no-break space
    expect(formatZar(1500)).not.toContain('\u202f') // narrow no-break space
  })

  it('returns null for null', () => {
    expect(formatZar(null)).toBeNull()
  })
})
