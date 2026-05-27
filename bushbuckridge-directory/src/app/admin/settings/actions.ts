'use server'

import { requireAdmin } from '@/utils/pocketbase/admin'
import { createClient } from '@/utils/pocketbase/server'
import { revalidatePath } from 'next/cache'

export async function saveYocoSettings(formData: FormData) {
    await requireAdmin()

    const pb = await createClient()

    const fields: Record<string, string> = {
        yoco_secret_key: (formData.get('yoco_secret_key') as string) || 'not_set',
        yoco_public_key: (formData.get('yoco_public_key') as string) || 'not_set',
        yoco_webhook_secret: (formData.get('yoco_webhook_secret') as string) || 'not_set',
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
