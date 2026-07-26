import { createServerClient } from './supabase/server'
import { listPlays } from './plays'
import type { Playwright, PlaywrightDetail } from './types'

/* eslint-disable @typescript-eslint/no-explicit-any */
function toPlaywright(row: any): Playwright {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    bio: row.bio,
    portraitUrl: row.portrait_url,
    country: row.country,
    honours: row.honours ?? [],
    representedSince: row.represented_since,
  }
}

export async function listPlaywrights(): Promise<Playwright[]> {
  const db = createServerClient()
  const { data, error } = await db
    .from('playwrights')
    .select('*')
    .eq('status', 'published')
    .order('name')
  if (error) throw error
  return (data ?? []).map(toPlaywright)
}

export async function getPlaywrightBySlug(slug: string): Promise<PlaywrightDetail | null> {
  const db = createServerClient()
  const { data, error } = await db
    .from('playwrights')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  const plays = await listPlays({ genres: [], playwright: slug })
  return { ...toPlaywright(data), plays }
}

export async function listPlaywrightSlugs(): Promise<string[]> {
  const db = createServerClient()
  const { data, error } = await db.from('playwrights').select('slug').eq('status', 'published')
  if (error) throw error
  return (data ?? []).map((r) => r.slug)
}
