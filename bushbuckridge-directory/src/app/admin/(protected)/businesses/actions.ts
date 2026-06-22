'use server'

import { createClient } from '@/utils/pocketbase/server'
import { requireAdmin } from '@/utils/pocketbase/admin'
import { revalidatePath } from 'next/cache'

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

async function uniqueBusinessSlug(pb: any, name: string) {
  const base = slugify(name) || 'business'
  let slug = base
  let n = 2
  while (true) {
    try {
      await pb.collection('businesses').getFirstListItem(`slug = "${slug}"`)
      slug = `${base}-${n++}`
    } catch {
      return slug
    }
  }
}

export async function updateBusinessStatus(businessId: string, status: string) {
    await requireAdmin()
    const pb = await createClient()

    try {
        await pb.collection('businesses').update(businessId, { status })
        revalidatePath('/admin/businesses')
    } catch (e: any) {
        throw new Error(e.message || 'Failed to update status')
    }
}

export async function updateBusinessTier(businessId: string, tier: string) {
    await requireAdmin()
    const pb = await createClient()

    try {
        await pb.collection('businesses').update(businessId, { package_tier: tier })
        revalidatePath('/admin/businesses')
    } catch (e: any) {
        throw new Error(e.message || 'Failed to update tier')
    }
}

export async function toggleBusinessVerification(businessId: string, isVerified: boolean) {
    await requireAdmin()
    const pb = await createClient()

    try {
        await pb.collection('businesses').update(businessId, { is_verified: isVerified })
        revalidatePath('/admin/businesses')
    } catch (e: any) {
        throw new Error(e.message || 'Failed to toggle verification')
    }
}

export async function createBusiness(data: {
  name: string
  sector?: string
  area?: string
  phone?: string
  whatsapp?: string
  email?: string
  website?: string
  description?: string
  package_tier?: string
  status?: string
}) {
  await requireAdmin()
  const pb = await createClient()
  await pb.collection('businesses').create({
    ...data,
    slug: await uniqueBusinessSlug(pb, data.name),
    package_tier: data.package_tier || 'basic',
    status: data.status || 'active',
    is_featured: false,
    is_verified: false,
  })
  revalidatePath('/admin/businesses')
}

export async function deleteBusiness(businessId: string) {
    await requireAdmin()
    const pb = await createClient()

    try {
        await pb.collection('businesses').delete(businessId)
        revalidatePath('/admin/businesses')
    } catch (e: any) {
        throw new Error(e.message || 'Failed to delete business')
    }
}

export async function updateBusiness(businessId: string, data: {
  name?: string
  sector?: string
  area?: string
  phone?: string
  whatsapp?: string
  email?: string
  website?: string
  description?: string
  package_tier?: string
  status?: string
}) {
  await requireAdmin()
  const pb = await createClient()
  await pb.collection('businesses').update(businessId, data)
  revalidatePath('/admin/businesses')
}

/**
 * Full business update accepting FormData (handles file uploads + JSON fields).
 * The client assembles a FormData with scalar fields, JSON-stringified fields
 * (business_hours, services, faqs, certifications), new File objects under
 * logo/cover_image/gallery, and `gallery-` keys for removed gallery files.
 */
export async function updateBusinessFull(businessId: string, formData: FormData) {
  await requireAdmin()
  const pb = await createClient()
  const updated = await pb.collection('businesses').update(businessId, formData)
  revalidatePath('/admin/businesses')
  revalidatePath(`/business/${updated.slug}`)
}