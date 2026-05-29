'use server'

import { createClient } from '@/utils/pocketbase/server'
import { requireAdmin } from '@/utils/pocketbase/admin'
import { revalidatePath } from 'next/cache'

export async function createOpportunity(data: {
  title: string
  description?: string
  category?: string
  deadline?: string
  contact_info?: string
  link?: string
}) {
  await requireAdmin()
  const pb = await createClient()
  await pb.collection('opportunities').create(data)
  revalidatePath('/admin/opportunities')
}

export async function updateOpportunity(
  id: string,
  data: {
    title?: string
    description?: string
    category?: string
    deadline?: string
    contact_info?: string
    link?: string
  }
) {
  await requireAdmin()
  const pb = await createClient()
  await pb.collection('opportunities').update(id, data)
  revalidatePath('/admin/opportunities')
}

export async function deleteOpportunity(id: string) {
  await requireAdmin()
  const pb = await createClient()
  await pb.collection('opportunities').delete(id)
  revalidatePath('/admin/opportunities')
}
