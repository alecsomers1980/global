import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface PublishResult {
    platform: string
    account_name: string
    success: boolean
    post_id?: string
    error?: string
}

export interface PublishOutcome {
    success: boolean
    allSuccess: boolean
    results: PublishResult[]
}

async function publishToFacebook(
    pageId: string,
    accessToken: string,
    content: string,
    mediaUrls: string[] | null
): Promise<{ id: string }> {
    const apiBase = `https://graph.facebook.com/v19.0/${pageId}`

    if (!mediaUrls || mediaUrls.length === 0) {
        const res = await fetch(`${apiBase}/feed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: content, access_token: accessToken }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error.message)
        return { id: data.id }
    }

    let firstMedia = mediaUrls[0]
    const isVideo = /\.(mp4|mov|m3u8)(\?|$)/i.test(firstMedia) || firstMedia.includes('stream.mux.com')

    if (isVideo) {
        if (firstMedia.includes('stream.mux.com') && firstMedia.endsWith('.m3u8')) {
            const playbackId = firstMedia.split('/').pop()!.replace('.m3u8', '')
            firstMedia = `https://stream.mux.com/${playbackId}/capped-1080p.mp4`
        }
        const res = await fetch(`${apiBase}/videos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                file_url: firstMedia,
                description: content,
                access_token: accessToken,
            }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error.message)
        await waitForFbVideoProcessing(data.id, accessToken)
        return { id: data.id }
    }

    if (mediaUrls.length === 1) {
        const res = await fetch(`${apiBase}/photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: firstMedia,
                caption: content,
                access_token: accessToken,
            }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error.message)
        return { id: data.id }
    }

    const photoIds: string[] = []
    for (const mediaUrl of mediaUrls.slice(0, 10)) {
        const res = await fetch(`${apiBase}/photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: mediaUrl,
                published: false,
                access_token: accessToken,
            }),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error.message)
        photoIds.push(data.id)
    }

    const feedRes = await fetch(`${apiBase}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: content,
            attached_media: photoIds.map(id => ({ media_fbid: id })),
            access_token: accessToken,
        }),
    })
    const feedData = await feedRes.json()
    if (feedData.error) throw new Error(feedData.error.message)
    return { id: feedData.id }
}

async function publishToInstagram(
    igUserId: string,
    accessToken: string,
    content: string,
    mediaUrls: string[] | null
): Promise<{ id: string }> {
    if (!mediaUrls || mediaUrls.length === 0) {
        throw new Error('Instagram requires at least one image or video')
    }

    const apiBase = `https://graph.facebook.com/v19.0/${igUserId}`

    let firstMedia = mediaUrls[0]
    const isVideo = /\.(mp4|mov|m3u8)(\?|$)/i.test(firstMedia) || firstMedia.includes('stream.mux.com')

    if (isVideo && firstMedia.includes('stream.mux.com') && firstMedia.endsWith('.m3u8')) {
        const playbackId = firstMedia.split('/').pop()!.replace('.m3u8', '')
        firstMedia = `https://stream.mux.com/${playbackId}/capped-1080p.mp4`
    }

    let creationId: string

    if (mediaUrls.length === 1) {
        const containerBody: any = {
            caption: content,
            access_token: accessToken,
        }
        if (isVideo) {
            containerBody.media_type = 'REELS'
            containerBody.video_url = firstMedia
        } else {
            containerBody.image_url = firstMedia
        }

        const res = await fetch(`${apiBase}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(containerBody),
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error.message)
        creationId = data.id

        if (isVideo) {
            await waitForIgProcessing(creationId, accessToken)
        }
    } else {
        const childIds: string[] = []
        for (const mediaUrl of mediaUrls.slice(0, 10)) {
            const childIsVideo = /\.(mp4|mov|m3u8)(\?|$)/i.test(mediaUrl) || mediaUrl.includes('stream.mux.com')
            const childBody: any = {
                is_carousel_item: true,
                access_token: accessToken,
            }
            if (childIsVideo) {
                childBody.media_type = 'VIDEO'
                childBody.video_url = mediaUrl
            } else {
                childBody.image_url = mediaUrl
            }

            const childRes = await fetch(`${apiBase}/media`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(childBody),
            })
            const childData = await childRes.json()
            if (childData.error) throw new Error(childData.error.message)
            childIds.push(childData.id)

            if (childIsVideo) {
                await waitForIgProcessing(childData.id, accessToken)
            }
        }

        const carouselRes = await fetch(`${apiBase}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                media_type: 'CAROUSEL',
                children: childIds.join(','),
                caption: content,
                access_token: accessToken,
            }),
        })
        const carouselData = await carouselRes.json()
        if (carouselData.error) throw new Error(carouselData.error.message)
        creationId = carouselData.id
    }

    const publishRes = await fetch(`${apiBase}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            creation_id: creationId,
            access_token: accessToken,
        }),
    })
    const publishData = await publishRes.json()
    if (publishData.error) throw new Error(publishData.error.message)
    return { id: publishData.id }
}

async function waitForFbVideoProcessing(videoId: string, accessToken: string, maxWaitMs = 180000) {
    const start = Date.now()
    while (Date.now() - start < maxWaitMs) {
        const res = await fetch(
            `https://graph.facebook.com/v19.0/${videoId}?fields=status&access_token=${accessToken}`
        )
        const data = await res.json()
        const phase = data?.status?.video_status
        if (phase === 'ready') return
        if (phase === 'error') {
            const reason = data?.status?.processing_phase?.errors?.[0]?.message || 'Facebook video processing failed'
            throw new Error(reason)
        }
        await new Promise(r => setTimeout(r, 5000))
    }
}

async function waitForIgProcessing(containerId: string, accessToken: string, maxWaitMs = 60000) {
    const start = Date.now()
    while (Date.now() - start < maxWaitMs) {
        const res = await fetch(
            `https://graph.facebook.com/v19.0/${containerId}?fields=status_code&access_token=${accessToken}`
        )
        const data = await res.json()
        if (data.status_code === 'FINISHED') return
        if (data.status_code === 'ERROR') throw new Error('Instagram media processing failed')
        await new Promise(r => setTimeout(r, 3000))
    }
    throw new Error('Instagram media processing timeout')
}

export async function publishPost(postId: string): Promise<PublishOutcome> {
    // Clear any previous error at the start of a new attempt so stale
    // messages don't linger after a successful retry.
    const { error: clearErr } = await supabase
        .from('posts')
        .update({ status: 'publishing', last_error: null } as never)
        .eq('id', postId)
    if (clearErr) console.error('publishPost: failed to set publishing status:', clearErr)

    const { data: post, error: postErr } = await supabase
        .from('posts')
        .select('id, workspace_id, content, platforms, media_urls')
        .eq('id', postId)
        .single()

    if (postErr || !post) {
        const message = postErr?.message || 'Post not found'
        const { error: failErr } = await supabase
            .from('posts')
            .update({ status: 'failed', last_error: message } as never)
            .eq('id', postId)
        if (failErr) console.error('publishPost: failed to set failed status:', failErr)
        return { success: false, allSuccess: false, results: [] }
    }

    const postAny = post as any

    const { data: accounts } = await supabase
        .from('social_accounts')
        .select('platform, account_id, account_name, access_token')
        .eq('workspace_id', postAny.workspace_id)
        .in('platform', postAny.platforms)

    if (!accounts || accounts.length === 0) {
        const message = `No connected social accounts for platforms: ${(postAny.platforms || []).join(', ')}. Connect them on the Platforms page.`
        const { error: noAcctErr } = await supabase
            .from('posts')
            .update({ status: 'failed', last_error: message } as never)
            .eq('id', postId)
        if (noAcctErr) console.error('publishPost: failed to set no-accounts status:', noAcctErr)
        return {
            success: false,
            allSuccess: false,
            results: [],
        }
    }

    const results: PublishResult[] = []

    for (const account of accounts as any[]) {
        try {
            let publishedRef: { id: string } | null = null

            if (account.platform === 'facebook') {
                publishedRef = await publishToFacebook(
                    account.account_id,
                    account.access_token,
                    postAny.content,
                    postAny.media_urls
                )
            } else if (account.platform === 'instagram') {
                publishedRef = await publishToInstagram(
                    account.account_id,
                    account.access_token,
                    postAny.content,
                    postAny.media_urls
                )
            } else {
                throw new Error(`Publishing to ${account.platform} not yet supported`)
            }

            results.push({
                platform: account.platform,
                account_name: account.account_name,
                success: true,
                post_id: publishedRef?.id,
            })
        } catch (err: any) {
            console.error(`Publish error for ${account.platform}:`, err)
            results.push({
                platform: account.platform,
                account_name: account.account_name,
                success: false,
                error: err.message || 'Unknown error',
            })
        }
    }

    const anySuccess = results.some(r => r.success)
    const allSuccess = results.every(r => r.success)
    const failed = results.filter(r => !r.success)
    const lastError = failed.length === 0
        ? null
        : failed.map(r => `${r.platform} (${r.account_name}): ${r.error || 'unknown'}`).join(' | ')

    const updatePayload: Record<string, any> = { status: anySuccess ? 'published' : 'failed' }
    if (lastError) updatePayload.last_error = lastError

    const { error: finalErr } = await supabase
        .from('posts')
        .update(updatePayload as never)
        .eq('id', postId)

    if (finalErr) console.error('publishPost: failed to set final status:', finalErr)

    return {
        success: anySuccess,
        allSuccess,
        results,
    }
}
