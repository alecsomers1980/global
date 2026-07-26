import type { CastRole } from './types'

/** Renders a cast breakdown as the industry-standard summary, e.g. "3m, 2f + ensemble". */
export function formatCastSize(roles: CastRole[]): string {
  if (roles.length === 0) return ''

  const named = roles.filter((r) => !r.isEnsemble)
  const hasEnsemble = roles.some((r) => r.isEnsemble)

  const male = named.filter((r) => r.gender === 'male').length
  const female = named.filter((r) => r.gender === 'female').length
  const any = named.filter((r) => r.gender === 'any').length

  const parts: string[] = []
  if (male) parts.push(`${male}m`)
  if (female) parts.push(`${female}f`)
  if (any) parts.push(`${any} any gender`)

  if (parts.length === 0) return hasEnsemble ? 'Ensemble' : ''
  return hasEnsemble ? `${parts.join(', ')} + ensemble` : parts.join(', ')
}
