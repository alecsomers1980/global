'use server'

import { createClient } from '@/utils/pocketbase/server'
import { createServiceClient } from '@/utils/pocketbase/service'
import { revalidatePath } from 'next/cache'

// Server-side source of truth for which fields each tier may edit.
const TIER_TEXT: Record<string, string[]> = {
  basic: ['name', 'description', 'phone', 'address'],
  'pro-lead': ['name', 'description', 'phone', 'address', 'whatsapp', 'email', 'facebook', 'instagram', 'linkedin'],
  'pro-business': ['name', 'description', 'phone', 'address', 'whatsapp', 'email', 'website', 'facebook', 'instagram', 'linkedin', 'video_url', 'special_offer', 'special_offer_expires', 'team_size'],
}
const TIER_JSON: Record<string, string[]> = {
  basic: ['business_hours', 'services'],
  'pro-lead': ['business_hours', 'services'],
  'pro-business': ['business_hours', 'services', 'faqs', 'certifications'],
}
const TIER_NUM: Record<string, string[]> = {
  basic: [],
  'pro-lead': [],
  'pro-business': ['map_lat', 'map_lng', 'years_in_business'],
}
function coverAllowed(tier: string) { return tier === 'pro-lead' || tier === 'pro-business' }
function galleryMax(tier: string) { return tier === 'pro-business' ? 10 : tier === 'pro-lead' ? 3 : 0 }

export async function updateMyBusiness(formData: FormData) {
  const pb = await createClient()
  const user = pb.authStore.model
  if (!user) throw new Error('Not authenticated')

  let biz: any
  try {
    biz = await pb.collection('businesses').getFirstListItem(`owner = "${user.id}"`)
  } catch {
    throw new Error('No business found for your account')
  }
  const tier: string = biz.package_tier || 'basic'

  const out = new FormData()
  ;(TIER_TEXT[tier] || []).forEach((k) => { if (formData.has(k)) out.append(k, String(formData.get(k) ?? '')) })
  ;(TIER_JSON[tier] || []).forEach((k) => { if (formData.has(k)) out.append(k, String(formData.get(k) ?? '[]')) })
  ;(TIER_NUM[tier] || []).forEach((k) => { const v = formData.get(k); if (v != null && v !== '') out.append(k, String(v)) })

  // logo — all tiers
  if (formData.has('logo')) {
    const f = formData.get('logo')
    if (f instanceof File) { if (f.size > 0) out.append('logo', f) }
    else out.append('logo', String(f)) // '' clears
  }
  // cover — pro-lead+
  if (coverAllowed(tier) && formData.has('cover_image')) {
    const f = formData.get('cover_image')
    if (f instanceof File) { if (f.size > 0) out.append('cover_image', f) }
    else out.append('cover_image', String(f))
  }
  // gallery — pro-lead (3) / pro-business (10)
  const max = galleryMax(tier)
  if (max > 0) {
    formData.getAll('gallery-').forEach((fn) => out.append('gallery-', String(fn)))
    const files = (formData.getAll('gallery').filter((x) => x instanceof File && (x as File).size > 0)) as File[]
    files.slice(0, max).forEach((f) => out.append('gallery', f))
  }

  const svc = await createServiceClient()
  await svc.collection('businesses').update(biz.id, out)
  revalidatePath('/portal/settings')
  revalidatePath(`/business/${biz.slug}`)
}
