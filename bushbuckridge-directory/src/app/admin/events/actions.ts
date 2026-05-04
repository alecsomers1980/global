'use server'

import { createClient } from '@/utils/pocketbase/server'
import { requireAdmin } from '@/utils/pocketbase/admin'
import { revalidatePath } from 'next/cache'

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
  await pb.collection('events').create(data)
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
