'use server'

import { createClient } from '@/utils/pocketbase/server'
import { requireAdmin } from '@/utils/pocketbase/admin'
import { revalidatePath } from 'next/cache'

export async function saveSpotlightArticle(formData: FormData) {
    await requireAdmin()
    const pb = await createClient()

    const businessId = formData.get('business_id') as string
    const articleId = formData.get('article_id') as string
    const status = formData.get('status') as string
    const layout = formData.get('layout') as string
    const content = formData.get('content') as string
    
    // We can handle images separately if needed, but for simplicity we assume text/layout for now.
    // If PocketBase expects files, you can append them here from the FormData.
    const images = formData.getAll('images') // File objects

    try {
        const payload = new FormData()
        payload.append('business_id', businessId)
        payload.append('status', status)
        payload.append('layout', layout)
        payload.append('content', content)
        
        images.forEach((img) => {
            if ((img as File).size > 0) {
                payload.append('images', img)
            }
        })

        if (articleId) {
            await pb.collection('spotlight_articles').update(articleId, payload)
        } else {
            await pb.collection('spotlight_articles').create(payload)
        }

        revalidatePath('/admin/spotlight')
        return { success: true }
    } catch (e: any) {
        console.error('Failed to save spotlight', e)
        return { success: false, error: e.message }
    }
}
