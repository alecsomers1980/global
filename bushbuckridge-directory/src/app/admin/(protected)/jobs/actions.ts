'use server'

import { createClient } from '@/utils/pocketbase/server'
import { requireAdmin } from '@/utils/pocketbase/admin'
import { revalidatePath } from 'next/cache'

export async function createJob(data: {
  title: string
  description?: string
  company?: string
  location?: string
  type?: string
  contact_info?: string
}) {
  await requireAdmin()
  const pb = await createClient()
  await pb.collection('jobs').create(data)
  revalidatePath('/admin/jobs')
}

export async function updateJob(
  id: string,
  data: {
    title?: string
    description?: string
    company?: string
    location?: string
    type?: string
    contact_info?: string
  }
) {
  await requireAdmin()
  const pb = await createClient()
  await pb.collection('jobs').update(id, data)
  revalidatePath('/admin/jobs')
}

export async function deleteJob(id: string) {
  await requireAdmin()
  const pb = await createClient()
  await pb.collection('jobs').delete(id)
  revalidatePath('/admin/jobs')
}
