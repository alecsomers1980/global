'use server'

import { createClient } from '@/utils/pocketbase/server'
import { requireAdmin } from '@/utils/pocketbase/admin'
import { revalidatePath } from 'next/cache'

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
