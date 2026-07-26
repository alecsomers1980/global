import type { AvailabilityStatus, RightsRow } from './types'

const SEVERITY: Record<AvailabilityStatus, number> = {
  available: 0,
  restricted: 1,
  unavailable: 2,
}

function isActive(r: RightsRow, on: Date): boolean {
  if (r.validFrom && new Date(r.validFrom) > on) return false
  if (r.validTo && new Date(r.validTo) < on) return false
  return true
}

/**
 * Resolves a play's availability in one territory.
 * No covering row means unavailable — rights are opt-in, never assumed.
 * When rows conflict, the most restrictive wins.
 */
export function resolveAvailability(
  rows: RightsRow[],
  territory: string,
  on: Date = new Date(),
): { status: AvailabilityStatus; note: string | null } {
  const relevant = rows.filter((r) => r.territory === territory && isActive(r, on))
  if (relevant.length === 0) return { status: 'unavailable', note: null }

  const worst = relevant.reduce((a, b) => (SEVERITY[b.status] > SEVERITY[a.status] ? b : a))
  return { status: worst.status, note: worst.restrictionNote }
}
