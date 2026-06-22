'use server'
import { requireAdmin } from '@/utils/pocketbase/admin'
import { createClient } from '@/utils/pocketbase/server'
import { revalidatePath } from 'next/cache'

export async function savePricing(formData: FormData) {
    await requireAdmin()
    const pb = await createClient()
    const fields: Record<string, string> = {
        price_basic: (formData.get('price_basic') as string) || '0',
        price_pro_lead: (formData.get('price_pro_lead') as string) || '0',
        price_pro_business: (formData.get('price_pro_business') as string) || '0',
    }
    const existing = await pb.collection('settings').getList(1, 100)
    for (const [key, value] of Object.entries(fields)) {
        const record = existing.items.find((s: any) => s.key === key)
        if (record) {
            await pb.collection('settings').update(record.id, { value })
        } else {
            await pb.collection('settings').create({ key, value })
        }
    }
    revalidatePath('/admin/settings')
}