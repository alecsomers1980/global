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
  organization?: string
  value?: string
  eligibility?: string
  reference_number?: string
  location?: string
  how_to_apply?: string
  required_documents?: string
}) {
  await requireAdmin()
  const pb = await createClient()
  await pb.collection('opportunities').create(data)
  revalidatePath('/admin/opportunities')
}

export async function updateOpportunity(id: string, data: {
  title?: string
  description?: string
  category?: string
  deadline?: string
  contact_info?: string
  link?: string
  organization?: string
  value?: string
  eligibility?: string
  reference_number?: string
  location?: string
  how_to_apply?: string
  required_documents?: string
}) {
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

/** FormData-aware save (create or update) that supports image + gallery uploads. */
export async function saveOpportunity(id: string | null, formData: FormData) {
  await requireAdmin()
  const pb = await createClient()
  if (id) {
    await pb.collection('opportunities').update(id, formData)
  } else {
    await pb.collection('opportunities').create(formData)
  }
  revalidatePath('/admin/opportunities')
}