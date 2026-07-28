'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/admin'

export type PlayFormState = { error: string } | null

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function csv(v: FormDataEntryValue | null): string[] {
  return String(v ?? '').split(',').map((x) => x.trim()).filter(Boolean)
}

/**
 * Parses one repeater field. Throws (with the field's own label) on invalid JSON, so callers
 * can validate every repeater before writing anything — a JSON typo must never silently empty
 * a play's cast, rights, press, media or production history.
 */
function parseRepeater(label: string, v: FormDataEntryValue | null): Record<string, unknown>[] {
  const raw = String(v ?? '[]').trim() || '[]'
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error(`"${label}" isn't valid JSON — fix it and save again. Nothing was changed.`)
  }
  if (!Array.isArray(parsed)) {
    throw new Error(`"${label}" must be a JSON array — fix it and save again. Nothing was changed.`)
  }
  return parsed as Record<string, unknown>[]
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

export async function savePlay(_prev: PlayFormState, formData: FormData): Promise<PlayFormState> {
  await requireAdmin()
  const db = createServiceClient()
  const id = String(formData.get('id') ?? '')
  const title = String(formData.get('title') ?? '').trim()

  // Validate every repeater before touching the database — see parseRepeater's doc comment.
  let roles, media, press, productions, rights
  try {
    roles = parseRepeater('Cast', formData.get('roles'))
    media = parseRepeater('Media', formData.get('media'))
    press = parseRepeater('Press quotes', formData.get('press'))
    productions = parseRepeater('Production history', formData.get('productions'))
    rights = parseRepeater('Rights and availability', formData.get('rights'))
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'One of the repeater fields is invalid.' }
  }

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

  if (saved.error) {
    if (saved.error.code === '23505') {
      return {
        error: 'A play with that title or slug already exists. Try a different title, or set the slug manually.',
      }
    }
    return { error: 'Something went wrong saving this play. Please try again.' }
  }
  const playId = saved.data.id

  await replaceChildren(db, 'play_roles', playId, roles)
  await replaceChildren(db, 'play_media', playId, media)
  await replaceChildren(db, 'play_press', playId, press)
  await replaceChildren(db, 'play_productions', playId, productions)
  await replaceChildren(db, 'rights_availability', playId, rights)

  const writerIds = formData.getAll('playwrightIds').map(String).filter(Boolean)
  await db.from('play_playwrights').delete().eq('play_id', playId)
  if (writerIds.length) {
    const { error } = await db.from('play_playwrights').insert(
      writerIds.map((playwright_id, sort) => ({ play_id: playId, playwright_id, role: 'author', sort })),
    )
    if (error) throw error
  }

  revalidatePath('/plays')
  revalidatePath(`/plays/${row.slug}`)
  redirect('/admin/plays')
}

export async function deletePlay(formData: FormData) {
  await requireAdmin()
  const db = createServiceClient()
  const { error } = await db.from('plays').delete().eq('id', String(formData.get('id')))
  if (error) throw error
  revalidatePath('/plays')
  redirect('/admin/plays')
}
