import { createAdminClient } from '@/lib/supabase/client'

export async function uploadCampaignImage(args: {
    workspaceId: string
    postId: string
    bytes: Buffer
    mimeType?: string
}): Promise<{ ok: true; publicUrl: string } | { ok: false; error: string }> {
    try {
        const supabase = createAdminClient()
        const mime = args.mimeType || 'image/jpeg'
        const path = `${args.workspaceId}/${args.postId}-${Date.now()}.jpg`

        const { error } = await supabase.storage
            .from('campaign-media')
            .upload(path, args.bytes, {
                contentType: mime,
                upsert: true,
                cacheControl: '31536000'
            })

        if (error) throw error

        const { data } = supabase.storage
            .from('campaign-media')
            .getPublicUrl(path)

        return { ok: true, publicUrl: data.publicUrl }
    } catch (e: any) {
        return { ok: false, error: e.message || 'Upload failed' }
    }
}
