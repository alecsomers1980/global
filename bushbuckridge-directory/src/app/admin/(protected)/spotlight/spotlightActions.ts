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
    const title = formData.get('title') as string
    const quarter = formData.get('quarter') as string
    const year = formData.get('year') as string
    const images = formData.getAll('images')
    try {
        const payload = new FormData()
        payload.append('business_id', businessId)
        payload.append('status', status)
        payload.append('layout', layout)
        payload.append('content', content)
        payload.append('title', title || '')
        payload.append('quarter', quarter || '')
        if (year) payload.append('year', year)
        images.forEach((img) => { if ((img as File).size > 0) { payload.append('images', img) } })
        if (articleId) { await pb.collection('spotlight_articles').update(articleId, payload) }
        else { await pb.collection('spotlight_articles').create(payload) }
        revalidatePath('/admin/spotlight')
        return { success: true }
    } catch (e: any) { console.error('Failed to save spotlight', e); return { success: false, error: e.message } }
}