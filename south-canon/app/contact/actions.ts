'use server'

import { createServiceClient } from '@/lib/supabase/server'

export type ContactState = { ok: boolean; message: string } | null

/** Honeypot + timing check. A real person takes longer than 3 seconds to fill this in. */
export async function submitEnquiry(_prev: ContactState, formData: FormData): Promise<ContactState> {
  if (formData.get('company')) return { ok: true, message: 'Thank you. We will be in touch.' }

  const startedAt = Number(formData.get('startedAt'))
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < 3000) {
    return { ok: true, message: 'Thank you. We will be in touch.' }
  }

  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()
  if (!name || !email || !message) {
    return { ok: false, message: 'Please complete every field.' }
  }

  const db = createServiceClient()
  const { error } = await db.from('enquiries').insert({
    name,
    email,
    message,
    play_slug: String(formData.get('play') ?? '') || null,
    intent: String(formData.get('intent') ?? '') || null,
  })
  if (error) return { ok: false, message: 'Something went wrong. Please email us directly.' }

  return { ok: true, message: 'Thank you. We will be in touch.' }
}
