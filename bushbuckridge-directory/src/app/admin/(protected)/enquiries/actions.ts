'use server'

import { createClient } from '@/utils/pocketbase/server'
import { requireAdmin } from '@/utils/pocketbase/admin'
import { revalidatePath } from 'next/cache'

export async function updateEnquiryStatus(id: string, status: string) {
    await requireAdmin()
    const pb = await createClient()

    try {
        await pb.collection('enquiries').update(id, { status })
        revalidatePath('/admin/enquiries')
    } catch (e: any) {
        throw new Error(e.message || 'Failed to update status')
    }
}

export async function deleteEnquiry(id: string) {
    await requireAdmin()
    const pb = await createClient()

    try {
        await pb.collection('enquiries').delete(id)
        revalidatePath('/admin/enquiries')
    } catch (e: any) {
        throw new Error(e.message || 'Failed to delete enquiry')
    }
}
