import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface PublishResult {
    platform: string
    account_name: string
    success: boolean
    post_id?: string
    error?: string
}

async function publishToFacebook(
    pageId: string,
    accessToken: string,
    content: string,
    mediaUrls: string[] | null
): Promise<{ id: string }> {
    const apiBase = `https://graph.facebook.com/v19.0/${pageId}`

    // No media: simple text post to feed
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

    // Video post
    if (isVideo) {
        // Facebook /videos doesn't accept m3u8 HLS — convert Mux HLS to static MP4
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

        // Poll upload status — FB returns ID immediately but async-processes; silent failures are common
        await waitForFbVideoProcessing(data.id, accessToken)
        return { id: data.id }
    }

    // Single photo
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

    // Multiple photos: upload each as unpublished, then create combined feed post
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

    // Instagram doesn't accept m3u8 either — convert Mux HLS to static MP4
    if (isVideo && firstMedia.includes('stream.mux.com') && firstMedia.endsWith('.m3u8')) {
        const playbackId = firstMedia.split('/').pop()!.replace('.m3u8', '')
        firstMedia = `https://stream.mux.com/${playbackId}/capped-1080p.mp4`
    }

    let creationId: string

    if (mediaUrls.length === 1) {
        // Single media container
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

        // For videos/reels, wait for processing
        if (isVideo) {
            await waitForIgProcessing(creationId, accessToken)
        }
    } else {
        // Carousel: create child containers, then a carousel container
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

    // Publish the container
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
    // Don't throw on timeout — FB may still publish; caller gets soft success
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

export async function POST(req: Request) {
    try {
        const { postId } = await req.json()

        if (!postId) {
            return NextResponse.json({ error: 'postId is required' }, { status: 400 })
        }

        // Mark as publishing immediately
        await supabase.from('posts').update({ status: 'publishing' } as never).eq('id', postId)

        // Fetch post
        const { data: post, error: postErr } = await supabase
            .from('posts')
            .select('id, workspace_id, content, platforms, media_urls')
            .eq('id', postId)
            .single()

        if (postErr || !post) {
            await supabase.from('posts').update({ status: 'failed' } as never).eq('id', postId)
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        const postAny = post as any

        // Fetch all connected social accounts for this workspace's targeted platforms
        const { data: accounts } = await supabase
            .from('social_accounts')
            .select('platform, account_id, account_name, access_token')
            .eq('workspace_id', postAny.workspace_id)
            .in('platform', postAny.platforms)

        if (!accounts || accounts.length === 0) {
            await supabase.from('posts').update({ status: 'failed' } as never).eq('id', postId)
            return NextResponse.json({
                error: 'No connected accounts for the targeted platforms. Connect them on the Platforms page first.',
            }, { status: 400 })
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

        await supabase
            .from('posts')
            .update({ status: anySuccess ? 'published' : 'failed' } as never)
            .eq('id', postId)

        return NextResponse.json({
            success: anySuccess,
            allSuccess,
            results,
        })
    } catch (error: any) {
        console.error('Publish API error:', error)
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
}
