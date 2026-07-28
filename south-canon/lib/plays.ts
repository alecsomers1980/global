import { createServerClient } from './supabase/server'
import { formatCastSize } from './cast'
import type { CatalogueFilters } from './filters'
import type { CastRole, PlayDetail, PlaySummary } from './types'
import type { LicenceTier } from './types'

const SUMMARY_SELECT = `
  id, title, slug, logline, genres, duration_min, hero_image_url,
  play_roles ( id, name, gender, age_range, description, is_ensemble, sort ),
  play_playwrights ( role, sort, playwrights ( name, slug ) )
`

/* eslint-disable @typescript-eslint/no-explicit-any */
function toRoles(rows: any[] = []): CastRole[] {
  return rows
    .map((r) => ({
      id: r.id,
      name: r.name,
      gender: r.gender,
      ageRange: r.age_range,
      description: r.description,
      isEnsemble: r.is_ensemble,
      sort: r.sort,
    }))
    .sort((a, b) => a.sort - b.sort)
}

function toSummary(row: any): PlaySummary {
  const roles = toRoles(row.play_roles)
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    logline: row.logline,
    genres: row.genres ?? [],
    durationMin: row.duration_min,
    heroImageUrl: row.hero_image_url,
    castSummary: formatCastSize(roles),
    credits: (row.play_playwrights ?? [])
      .sort((a: any, b: any) => a.sort - b.sort)
      .map((c: any) => ({ name: c.playwrights.name, slug: c.playwrights.slug, role: c.role })),
  }
}

export async function listPlays(filters: CatalogueFilters): Promise<PlaySummary[]> {
  const db = createServerClient()
  let query = db.from('plays').select(SUMMARY_SELECT).eq('status', 'published')

  if (filters.q) query = query.ilike('search_text', `%${filters.q}%`)
  if (filters.genres.length) query = query.overlaps('genres', filters.genres)
  if (filters.durationMax) query = query.lte('duration_min', filters.durationMax)

  const { data, error } = await query.order('title')
  if (error) throw error

  // Cast size lives in a joined table, so it filters on the raw rows before mapping.
  let rows = data ?? []
  if (filters.castMax) {
    rows = rows.filter((r: any) => (r.play_roles ?? []).length <= filters.castMax!)
  }

  let plays = rows.map(toSummary)
  if (filters.playwright) {
    plays = plays.filter((p) => p.credits.some((c) => c.slug === filters.playwright))
  }
  return plays
}

export async function getPlayBySlug(slug: string): Promise<PlayDetail | null> {
  const db = createServerClient()
  const { data, error } = await db
    .from('plays')
    .select(`
      *,
      play_roles ( id, name, gender, age_range, description, is_ensemble, sort ),
      play_playwrights ( role, sort, playwrights ( name, slug ) ),
      play_media ( id, type, url, caption, credit, sort ),
      play_press ( id, quote, source, published_at, sort ),
      play_productions ( id, company, venue, city, country, starts_on, ends_on, director, notes, is_premiere ),
      rights_availability ( id, territory, tier_id, status, restriction_note, valid_from, valid_to )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    ...toSummary(data),
    synopsisShort: data.synopsis_short,
    synopsisFull: data.synopsis_full,
    yearWritten: data.year_written,
    acts: data.acts,
    languages: data.languages ?? [],
    themes: data.themes ?? [],
    contentWarnings: data.content_warnings ?? [],
    setting: data.setting,
    timePeriod: data.time_period,
    targetAudience: data.target_audience,
    isMusical: data.is_musical,
    roles: toRoles(data.play_roles),
    media: (data.play_media ?? [])
      .sort((a: any, b: any) => a.sort - b.sort)
      .map((m: any) => ({ id: m.id, type: m.type, url: m.url, caption: m.caption, credit: m.credit })),
    press: (data.play_press ?? [])
      .sort((a: any, b: any) => a.sort - b.sort)
      .map((p: any) => ({ id: p.id, quote: p.quote, source: p.source, publishedAt: p.published_at })),
    productions: (data.play_productions ?? [])
      .map((p: any) => ({
        id: p.id,
        company: p.company,
        venue: p.venue,
        city: p.city,
        country: p.country,
        startsOn: p.starts_on,
        endsOn: p.ends_on,
        director: p.director,
        notes: p.notes,
        isPremiere: p.is_premiere,
      }))
      .sort((a: any, b: any) =>
        a.isPremiere === b.isPremiere
          ? String(b.startsOn ?? '').localeCompare(String(a.startsOn ?? ''))
          : a.isPremiere ? -1 : 1,
      ),
    rights: (data.rights_availability ?? []).map((r: any) => ({
      id: r.id,
      territory: r.territory,
      tierId: r.tier_id,
      status: r.status,
      restrictionNote: r.restriction_note,
      validFrom: r.valid_from,
      validTo: r.valid_to,
    })),
  }
}

export async function listPlaySlugs(): Promise<string[]> {
  const db = createServerClient()
  const { data, error } = await db.from('plays').select('slug').eq('status', 'published')
  if (error) throw error
  return (data ?? []).map((r) => r.slug)
}

export async function listGenres(): Promise<string[]> {
  const db = createServerClient()
  const { data, error } = await db.from('plays').select('genres').eq('status', 'published')
  if (error) throw error
  const all = (data ?? []).flatMap((r) => r.genres ?? [])
  return [...new Set(all)].sort()
}

export async function listLicenceTiers(): Promise<LicenceTier[]> {
  const db = createServerClient()
  const { data, error } = await db.from('licence_tiers').select('*').order('sort')
  if (error) throw error
  return (data ?? []).map((t: any) => ({
    id: t.id,
    label: t.label,
    description: t.description,
    minFee: t.min_fee === null ? null : Number(t.min_fee),
    royaltyPct: t.royalty_pct === null ? null : Number(t.royalty_pct),
    sort: t.sort,
  }))
}

/** Related by shared playwright first, then shared genre. Never returns the play itself. */
export async function listRelatedPlays(play: PlayDetail, limit = 3): Promise<PlaySummary[]> {
  const all = await listPlays({ genres: [] })
  const others = all.filter((p) => p.id !== play.id)
  const writerSlugs = new Set(play.credits.map((c) => c.slug))

  const scored = others.map((p) => ({
    play: p,
    score:
      (p.credits.some((c) => writerSlugs.has(c.slug)) ? 2 : 0) +
      (p.genres.some((g) => play.genres.includes(g)) ? 1 : 0),
  }))

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.play)
}
