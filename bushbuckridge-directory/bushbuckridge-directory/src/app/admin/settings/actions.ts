'use server'

import { requireAdmin } from '@/utils/pocketbase/admin'
import { createClient } from '@/utils/pocketbase/server'
import { revalidatePath } from 'next/cache'

export async function savePayFastSettings(formData: FormData) {
    await requireAdmin()

    const pb = await createClient()

    const fields: Record<string, string> = {
        payfast_merchant_id: (formData.get('payfast_merchant_id') as string) || 'not_set',
        payfast_merchant_key: (formData.get('payfast_merchant_key') as string) || 'not_set',
        payfast_passphrase: (formData.get('payfast_passphrase') as string) || 'not_set',
        payfast_test_mode: formData.get('payfast_test_mode') === 'on' ? 'true' : 'false',
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
    return { success: true }
}
