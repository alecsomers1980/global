'use server'

import { createClient } from '@/utils/pocketbase/server'
import { requireAdmin } from '@/utils/pocketbase/admin'
import { revalidatePath } from 'next/cache'

export async function suspendUser(userId: string, suspended: boolean) {
    const me = await requireAdmin()
    if (me.id === userId) {
        throw new Error('You cannot suspend your own account.')
    }
    const pb = await createClient()
    try {
        await pb.collection('users').update(userId, { suspended })
        revalidatePath('/admin/users')
    } catch (e: any) {
        throw new Error(e.message || 'Failed to suspend user')
    }
}

export async function deleteUser(userId: string) {
    const me = await requireAdmin()
    if (me.id === userId) {
        throw new Error('You cannot delete your own account.')
    }
    const pb = await createClient()
    try {
        await pb.collection('users').delete(userId)
        revalidatePath('/admin/users')
    } catch (e: any) {
        throw new Error(e.message || 'Failed to delete user')
    }
}

export async function updateUser(
    userId: string,
    data: { email?: string; is_admin?: boolean; business_id?: string }
) {
    await requireAdmin()
    const pb = await createClient()
    try {
        await pb.collection('users').update(userId, data)
        revalidatePath('/admin/users')
    } catch (e: any) {
        throw new Error(e.message || 'Failed to update user')
    }
}

export async function sendPasswordResetLink(email: string) {
    await requireAdmin()
    const pb = await createClient()
    try {
        await pb.collection('users').requestPasswordReset(email)
    } catch (e: any) {
        throw new Error(e.message || 'Failed to send password reset')
    }
}
