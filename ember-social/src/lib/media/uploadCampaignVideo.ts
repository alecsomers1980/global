import { createAdminClient } from '@/lib/supabase/client'

export async function uploadCampaignVideo(args: {
    workspaceId: string
    postId: string
    bytes: Buffer
}): Promise<{ ok: true; publicUrl: string } | { ok: false; error: string }> {
    try {
        const supabase = createAdminClient()
        const path = `${args.workspaceId}/${args.postId}-${Date.now()}.mp4`

        const { error } = await supabase.storage
            .from('campaign-media')
            .upload(path, args.bytes, {
                contentType: 'video/mp4',
                upsert: true,
                cacheControl: '31536000',
            })

        if (error) throw error

        const { data } = supabase.storage
            .from('campaign-media')
            .getPublicUrl(path)

        return { ok: true, publicUrl: data.publicUrl }
    } catch (e: any) {
        return { ok: false, error: e.message || 'Video upload failed' }
    }
}
