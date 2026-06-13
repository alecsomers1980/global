'use server'
import { createClient } from '@/utils/pocketbase/server'
import { requireAdmin } from '@/utils/pocketbase/admin'
import { revalidatePath } from 'next/cache'

export async function saveEditorSpotlight(formData: FormData) {
    await requireAdmin()
    const pb = await createClient()
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const title = formData.get('title') as string
    const short_description = formData.get('short_description') as string
    const full_description = formData.get('full_description') as string
    const is_active = formData.get('is_active') === 'true'
    const layout = (formData.get('layout') as string) || 'default'
    const image = formData.get('image') as File | null

    try {
        const payload = new FormData()
        payload.append('name', name)
        payload.append('title', title)
        payload.append('short_description', short_description)
        payload.append('full_description', full_description)
        payload.append('is_active', is_active.toString())
        payload.append('layout', layout)
        if (image && image.size > 0) {
            payload.append('image', image)
        }

        const images = formData.getAll('images')
        images.forEach((img) => {
            if (img instanceof File && img.size > 0) {
                payload.append('images', img)
            }
        })

        if (id) {
            await pb.collection('editor_spotlight').update(id, payload)
        } else {
            await pb.collection('editor_spotlight').create(payload)
        }

        revalidatePath('/')
        revalidatePath('/admin/editor-spotlight')
        revalidatePath('/editor-spotlight')
    } catch (e: any) {
        console.error('Failed to save editor spotlight', e)
        throw new Error(e.message)
    }
}