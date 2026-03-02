'use server'

import { createClient } from '@/utils/supabase/server'
import { requireAdmin } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateBusinessStatus(businessId: string, status: string) {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await supabase
        .from('businesses')
        .update({ status })
        .eq('id', businessId)

    if (error) throw new Error(error.message)
    revalidatePath('/admin/businesses')
}

export async function updateBusinessTier(businessId: string, tier: string) {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await supabase
        .from('businesses')
        .update({ package_tier: tier })
        .eq('id', businessId)

    if (error) throw new Error(error.message)
    revalidatePath('/admin/businesses')
}

export async function toggleBusinessVerification(businessId: string, isVerified: boolean) {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await supabase
        .from('businesses')
        .update({ is_verified: isVerified })
        .eq('id', businessId)

    if (error) throw new Error(error.message)
    revalidatePath('/admin/businesses')
}

export async function deleteBusiness(businessId: string) {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', businessId)

    if (error) throw new Error(error.message)
    revalidatePath('/admin/businesses')
}
