'use server'
import { createClient } from '@/utils/pocketbase/server'
import { requireAdmin } from '@/utils/pocketbase/admin'
import { revalidatePath } from 'next/cache'

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

type JobInput = {
  title: string
  description?: string
  company?: string
  location?: string
  type?: string
  salary?: string
  salary_period?: string
  experience_level?: string
  positions?: string | number
  closing_date?: string
  responsibilities?: string
  requirements?: string
  how_to_apply?: string
  contact_name?: string
  contact_number?: string
  contact_email?: string
}

type JobUpdateInput = Partial<Omit<JobInput, 'title'>> & {
  title?: string
}

export async function createJob(data: JobInput) {
  await requireAdmin()
  const pb = await createClient()

  const payload = { ...data }

  // Convert positions to number if provided
  if (payload.positions !== undefined && payload.positions !== null) {
    if (typeof payload.positions === 'string') {
      const num = parseFloat(payload.positions)
      payload.positions = isNaN(num) ? undefined : num
    } else {
      payload.positions = Number(payload.positions)
    }
    if (payload.positions === undefined) delete (payload as any).positions
  }

  // Generate unique slug from title
  const baseSlug = slugify(data.title)
  const randomSuffix = Math.random().toString(36).slice(2, 7)
  ;(payload as any).slug = `${baseSlug}-${randomSuffix}`

  await pb.collection('jobs').create(payload)
  revalidatePath('/admin/jobs')
}

export async function updateJob(id: string, data: JobUpdateInput) {
  await requireAdmin()
  const pb = await createClient()

  const payload = { ...data }

  if (payload.positions !== undefined && payload.positions !== null) {
    if (typeof payload.positions === 'string') {
      const num = parseFloat(payload.positions)
      payload.positions = isNaN(num) ? undefined : num
    } else {
      payload.positions = Number(payload.positions)
    }
    if (payload.positions === undefined) delete (payload as any).positions
  }

  await pb.collection('jobs').update(id, payload)
  revalidatePath('/admin/jobs')
}

export async function deleteJob(id: string) {
  await requireAdmin()
  const pb = await createClient()
  await pb.collection('jobs').delete(id)
  revalidatePath('/admin/jobs')
  revalidatePath('/jobs')
}

export async function updateJobStatus(id: string, status: string) {
  await requireAdmin()
  const pb = await createClient()
  const job = await pb.collection('jobs').update(id, { status })
  revalidatePath('/admin/jobs')
  revalidatePath('/jobs')
  revalidatePath('/')
  if (job.slug) revalidatePath(`/jobs/${job.slug}`)
}

/** FormData-aware save (create or update) that supports image + gallery uploads. */
export async function saveJob(id: string | null, formData: FormData) {
  await requireAdmin()
  const pb = await createClient()
  if (!formData.get('positions')) formData.delete('positions')
  if (id) {
    await pb.collection('jobs').update(id, formData)
  } else {
    const title = String(formData.get('title') || '')
    formData.set('slug', `${slugify(title)}-${Math.random().toString(36).slice(2, 7)}`)
    if (!formData.get('status')) formData.set('status', 'published')
    await pb.collection('jobs').create(formData)
  }
  revalidatePath('/admin/jobs')
  revalidatePath('/jobs')
}