'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/adminServer' // service-role client
import { createAuthClient } from '@/lib/supabase/adminServer' // auth client
import { createServiceClient } from '@/lib/supabase/adminServer' // plain service-role client for writes

interface StatusPayload {
  id?: number
  slug: string
  label: string
  phase: string
  sortOrder: number
  clientMessage: string
  defaultNote?: string
  requiresNote: boolean
  requiresDate: boolean
  requiresClientAction: boolean
}

export async function saveStatus(payload: StatusPayload) {
  try {
    // 1. Authenticate
    const authClient = createAuthClient()
    const {
      data: { user },
    } = await authClient.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // 2. Authorize (admin only)
    const supabase = createAdminClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin') return { error: 'Admin access required' }

    // 3. Map payload to snake_case
    const row = {
      slug: payload.slug,
      label: payload.label,
      phase: payload.phase,
      sort_order: payload.sortOrder,
      default_note: payload.defaultNote || null,
      requires_note: payload.requiresNote,
      requires_date: payload.requiresDate,
      requires_client_action: payload.requiresClientAction,
      client_message: payload.clientMessage,
    }

    // 4. Insert or update (use service client for guaranteed RLS bypass on writes)
    const serviceClient = createServiceClient()
    if (payload.id) {
      const { error } = await serviceClient
        .from('case_statuses')
        .update(row)
        .eq('id', payload.id)
      if (error) return { error: error.message }
    } else {
      const { error } = await serviceClient.from('case_statuses').insert(row)
      if (error) return { error: error.message }
    }

    // 5. Revalidate relevant pages
    revalidatePath('/admin/statuses')
    revalidatePath('/admin/cases')
    return { success: true }
  } catch (err: any) {
    console.error('saveStatus error:', err)
    return { error: err?.message ?? 'Unexpected error' }
  }
}

export async function deleteStatus(id: number) {
  try {
    // 1. Authenticate
    const authClient = createAuthClient()
    const {
      data: { user },
    } = await authClient.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // 2. Authorize (admin only)
    const supabase = createAdminClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin') return { error: 'Admin access required' }

    // 3. Delete (use service client for guaranteed RLS bypass on writes)
    const serviceClient = createServiceClient()
    const { error } = await serviceClient.from('case_statuses').delete().eq('id', id)
    if (error) return { error: error.message }

    // 4. Revalidate
    revalidatePath('/admin/statuses')
    return { success: true }
  } catch (err: any) {
    console.error('deleteStatus error:', err)
    return { error: err?.message ?? 'Unexpected error' }
  }
}
