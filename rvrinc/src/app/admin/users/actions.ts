'use server'

import { revalidatePath } from 'next/cache'
import { createAuthClient, createAdminClient, createServiceClient } from '@/lib/supabase/adminServer'

// Long ban used to represent "suspended". 'none' lifts the ban.
const SUSPEND_DURATION = '876000h' // ~100 years

async function requireAdmin() {
  const authClient = createAuthClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()
  if (!user) return { error: 'Not authenticated' as const }

  const admin = createAdminClient()
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Admin access required' as const }

  return { userId: user.id }
}

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.'
  if (!/[A-Z]/.test(password)) return 'Password must contain a capital letter.'
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter.'
  return null
}

export interface AdminUser {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
  branch: string | null
  profile_completed: boolean | null
  created_at: string
  suspended: boolean
}

export async function getUsers(): Promise<{ users?: AdminUser[]; error?: string }> {
  const auth = await requireAdmin()
  if ('error' in auth) return { error: auth.error }

  const service = createServiceClient()

  const { data: profiles, error: profErr } = await service
    .from('profiles')
    .select('id, full_name, email, role, branch, profile_completed, created_at')
    .order('created_at', { ascending: false })
  if (profErr) return { error: profErr.message }

  // Merge in suspend (ban) status from auth.
  const bannedIds = new Set<string>()
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 200 })
    if (error) return { error: error.message }
    if (!data?.users?.length) break
    for (const u of data.users) {
      const bannedUntil = (u as any).banned_until as string | null | undefined
      if (bannedUntil && new Date(bannedUntil) > new Date()) bannedIds.add(u.id)
    }
    if (data.users.length < 200) break
  }

  const users: AdminUser[] = (profiles || []).map((p) => ({
    ...p,
    suspended: bannedIds.has(p.id),
  }))

  return { users }
}

export async function createUser(input: {
  fullName: string
  email: string
  role: string
  branch: string | null
  password: string
}): Promise<{ success?: true; error?: string }> {
  const auth = await requireAdmin()
  if ('error' in auth) return { error: auth.error }

  if (!input.fullName.trim()) return { error: 'Full name is required.' }
  if (!input.email.trim()) return { error: 'Email is required.' }
  const pwErr = validatePassword(input.password)
  if (pwErr) return { error: pwErr }

  const service = createServiceClient()

  const { data: created, error: createErr } = await service.auth.admin.createUser({
    email: input.email.trim(),
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName.trim(), branch: input.branch },
  })
  if (createErr) return { error: createErr.message }

  const { error: profileErr } = await service.from('profiles').upsert({
    id: created.user.id,
    full_name: input.fullName.trim(),
    email: input.email.trim(),
    role: input.role,
    branch: input.branch,
    profile_completed: false,
  })
  if (profileErr) return { error: profileErr.message }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function updateUser(input: {
  id: string
  fullName: string
  email: string
  role: string
  branch: string | null
  password?: string
}): Promise<{ success?: true; error?: string }> {
  const auth = await requireAdmin()
  if ('error' in auth) return { error: auth.error }

  if (!input.fullName.trim()) return { error: 'Full name is required.' }
  if (!input.email.trim()) return { error: 'Email is required.' }

  const service = createServiceClient()

  // Update auth record (email and/or password) if needed.
  const authUpdate: { email?: string; password?: string } = {}
  authUpdate.email = input.email.trim()
  if (input.password) {
    const pwErr = validatePassword(input.password)
    if (pwErr) return { error: pwErr }
    authUpdate.password = input.password
  }
  const { error: authErr } = await service.auth.admin.updateUserById(input.id, {
    ...authUpdate,
    email_confirm: true,
  })
  if (authErr) return { error: authErr.message }

  const { error: profileErr } = await service
    .from('profiles')
    .update({
      full_name: input.fullName.trim(),
      email: input.email.trim(),
      role: input.role,
      branch: input.branch,
    })
    .eq('id', input.id)
  if (profileErr) return { error: profileErr.message }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function setSuspended(
  id: string,
  suspend: boolean
): Promise<{ success?: true; error?: string }> {
  const auth = await requireAdmin()
  if ('error' in auth) return { error: auth.error }

  if (id === auth.userId) return { error: 'You cannot suspend your own account.' }

  const service = createServiceClient()
  const { error } = await service.auth.admin.updateUserById(id, {
    ban_duration: suspend ? SUSPEND_DURATION : 'none',
  })
  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function deleteUser(id: string): Promise<{ success?: true; error?: string }> {
  const auth = await requireAdmin()
  if ('error' in auth) return { error: auth.error }

  if (id === auth.userId) return { error: 'You cannot delete your own account.' }

  const service = createServiceClient()
  const { error: authErr } = await service.auth.admin.deleteUser(id)
  if (authErr) return { error: authErr.message }

  // Remove profile row in case it is not cascaded.
  await service.from('profiles').delete().eq('id', id)

  revalidatePath('/admin/users')
  return { success: true }
}
