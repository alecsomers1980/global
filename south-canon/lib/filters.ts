import { TERRITORIES, type Territory } from './types'

export type CatalogueFilters = {
  q?: string
  genres: string[]
  playwright?: string
  castMax?: number
  durationMax?: number
  territory?: Territory
}

type RawParams = Record<string, string | string[] | undefined>

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v
}

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return []
  return Array.isArray(v) ? v : [v]
}

function toPositiveInt(v: string | string[] | undefined): number | undefined {
  const n = Number(first(v))
  return Number.isInteger(n) && n > 0 ? n : undefined
}

export function parseFilters(sp: RawParams): CatalogueFilters {
  const q = first(sp.q)?.trim()
  const territory = first(sp.territory)
  return {
    q: q || undefined,
    genres: toArray(sp.genre),
    playwright: first(sp.playwright) || undefined,
    castMax: toPositiveInt(sp.castMax),
    durationMax: toPositiveInt(sp.durationMax),
    territory: TERRITORIES.includes(territory as Territory) ? (territory as Territory) : undefined,
  }
}

export function filtersToSearchParams(f: CatalogueFilters): URLSearchParams {
  const sp = new URLSearchParams()
  if (f.q) sp.set('q', f.q)
  for (const g of f.genres) sp.append('genre', g)
  if (f.playwright) sp.set('playwright', f.playwright)
  if (f.castMax) sp.set('castMax', String(f.castMax))
  if (f.durationMax) sp.set('durationMax', String(f.durationMax))
  if (f.territory) sp.set('territory', f.territory)
  return sp
}
