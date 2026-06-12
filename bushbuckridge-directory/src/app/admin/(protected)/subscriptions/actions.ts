'use server'
import { createClient } from '@/utils/pocketbase/server'
import { requireAdmin } from '@/utils/pocketbase/admin'
import { revalidatePath } from 'next/cache'

export async function updateSubscriptionStatus(id: string, status: string) {
    await requireAdmin()
    const pb = await createClient()
    try {
        await pb.collection('subscriptions').update(id, { status })
        revalidatePath('/admin/subscriptions')
    } catch (e: any) {
        throw new Error(e.message || 'Failed to update status')
    }
}

export async function updateSubscription(
    id: string,
    data: { tier?: string; status?: string; expires_at?: string; amount_cents?: number }
) {
    await requireAdmin()
    const pb = await createClient()
    try {
        await pb.collection('subscriptions').update(id, data)
        revalidatePath('/admin/subscriptions')
    } catch (e: any) {
        throw new Error(e.message || 'Failed to update subscription')
    }
}

export async function deleteSubscription(id: string) {
    await requireAdmin()
    const pb = await createClient()
    try {
        await pb.collection('subscriptions').delete(id)
        revalidatePath('/admin/subscriptions')
    } catch (e: any) {
        throw new Error(e.message || 'Failed to delete subscription')
    }
}