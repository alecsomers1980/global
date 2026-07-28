'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function csv(v: FormDataEntryValue | null): string[] {
  return String(v ?? '').split(',').map((x) => x.trim()).filter(Boolean)
}

function json<T>(v: FormDataEntryValue | null): T[] {
  try {
    const parsed = JSON.parse(String(v ?? '[]'))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function num(v: FormDataEntryValue | null): number | null {
  const n = Number(v)
  return Number.isFinite(n) && String(v ?? '').trim() !== '' ? n : null
}

/** Children are replaced wholesale on every save — simplest correct behaviour for small collections. */
async function replaceChildren(
  db: ReturnType<typeof createServiceClient>,
  table: string,
  playId: string,
  rows: Record<string, unknown>[],
) {
  await db.from(table).delete().eq('play_id', playId)
  if (rows.length) {
    const { error } = await db.from(table).insert(rows.map((r) => ({ ...r, play_id: playId })))
    if (error) throw error
  }
}

export async function savePlay(formData: FormData) {
  const db = createServiceClient()
  const id = String(formData.get('id') ?? '')
  const title = String(formData.get('title') ?? '').trim()

  const row = {
    title,
    slug: String(formData.get('slug') ?? '').trim() || slugify(title),
    logline: String(formData.get('logline') ?? '') || null,
    synopsis_short: String(formData.get('synopsisShort') ?? '') || null,
    synopsis_full: String(formData.get('synopsisFull') ?? '') || null,
    genres: csv(formData.get('genres')),
    themes: csv(formData.get('themes')),
    languages: csv(formData.get('languages')),
    content_warnings: csv(formData.get('contentWarnings')),
    year_written: num(formData.get('yearWritten')),
    duration_min: num(formData.get('durationMin')),
    acts: num(formData.get('acts')),
    setting: String(formData.get('setting') ?? '') || null,
    time_period: String(formData.get('timePeriod') ?? '') || null,
    target_audience: String(formData.get('targetAudience') ?? '') || null,
    is_musical: formData.get('isMusical') === 'on',
    hero_image_url: String(formData.get('heroImageUrl') ?? '') || null,
    status: formData.get('status') === 'published' ? 'published' : 'draft',
  }

  const saved = id
    ? await db.from('plays').update(row).eq('id', id).select('id').single()
    : await db.from('plays').insert(row).select('id').single()
  if (saved.error) throw saved.error
  const playId = saved.data.id

  await replaceChildren(db, 'play_roles', playId, json(formData.get('roles')))
  await replaceChildren(db, 'play_media', playId, json(formData.get('media')))
  await replaceChildren(db, 'play_press', playId, json(formData.get('press')))
  await replaceChildren(db, 'play_productions', playId, json(formData.get('productions')))
  await replaceChildren(db, 'rights_availability', playId, json(formData.get('rights')))

  const writerIds = csv(formData.get('playwrightIds'))
  await db.from('play_playwrights').delete().eq('play_id', playId)
  if (writerIds.length) {
    await db.from('play_playwrights').insert(
      writerIds.map((playwright_id, sort) => ({ play_id: playId, playwright_id, role: 'author', sort })),
    )
  }

  revalidatePath('/plays')
  revalidatePath(`/plays/${row.slug}`)
  redirect('/admin/plays')
}

export async function deletePlay(formData: FormData) {
  const db = createServiceClient()
  const { error } = await db.from('plays').delete().eq('id', String(formData.get('id')))
  if (error) throw error
  revalidatePath('/plays')
  redirect('/admin/plays')
}