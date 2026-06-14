'use server'

import { createClient } from '@/utils/pocketbase/server'
import { requireAdmin } from '@/utils/pocketbase/admin'
import { revalidatePath } from 'next/cache'

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export async function createEvent(data: {
  title: string
  description?: string
  date: string
  time?: string
  venue?: string
  cost?: string
  contact_info?: string
  is_featured?: boolean
}) {
  await requireAdmin()
  const pb = await createClient()
  await pb.collection('events').create({
    ...data,
    slug: slugify(data.title) + '-' + Math.random().toString(36).slice(2, 7)
  })
  revalidatePath('/admin/events')
}

export async function updateEvent(
  id: string,
  data: {
    title?: string
    description?: string
    date?: string
    time?: string
    venue?: string
    cost?: string
    contact_info?: string
    is_featured?: boolean
  }
) {
  await requireAdmin()
  const pb = await createClient()
  await pb.collection('events').update(id, data)
  revalidatePath('/admin/events')
}

export async function deleteEvent(id: string) {
  await requireAdmin()
  const pb = await createClient()
  await pb.collection('events').delete(id)
  revalidatePath('/admin/events')
}

/** FormData-aware save (create or update) that supports image + gallery uploads. */
export async function saveEvent(id: string | null, formData: FormData) {
  await requireAdmin()
  const pb = await createClient()
  if (id) {
    await pb.collection('events').update(id, formData)
  } else {
    const title = String(formData.get('title') || '')
    formData.set('slug', `${slugify(title)}-${Math.random().toString(36).slice(2, 7)}`)
    await pb.collection('events').create(formData)
  }
  revalidatePath('/admin/events')
}