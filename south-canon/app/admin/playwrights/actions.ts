'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function savePlaywright(formData: FormData) {
  const db = createServiceClient()
  const id = String(formData.get('id') ?? '')
  const name = String(formData.get('name') ?? '').trim()

  const row = {
    name,
    slug: String(formData.get('slug') ?? '').trim() || slugify(name),
    bio: String(formData.get('bio') ?? '') || null,
    portrait_url: String(formData.get('portraitUrl') ?? '') || null,
    country: String(formData.get('country') ?? '') || null,
    honours: String(formData.get('honours') ?? '')
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean),
    status: formData.get('status') === 'published' ? 'published' : 'draft',
  }

  const { error } = id
    ? await db.from('playwrights').update(row).eq('id', id)
    : await db.from('playwrights').insert(row)
  if (error) throw error

  revalidatePath('/playwrights')
  revalidatePath('/plays')
  redirect('/admin/playwrights')
}

export async function deletePlaywright(formData: FormData) {
  const db = createServiceClient()
  const { error } = await db.from('playwrights').delete().eq('id', String(formData.get('id')))
  if (error) throw error
  revalidatePath('/playwrights')
  redirect('/admin/playwrights')
}