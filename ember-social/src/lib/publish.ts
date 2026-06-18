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

// Facebook returns a vague "Please reduce the amount of data..." error when
// the combined message + attached_media payload is too large. Caps below keep
// long-form vehicle descriptions + 10-photo carousels under that threshold
// while still looking good on the feed.
const FB_MAX_MESSAGE_CHARS = 5000
const FB_MAX_CAROUSEL_PHOTOS = 5

function trimForFacebook(content: string): string {
    if (!content || content.length <= FB_MAX_MESSAGE_CHARS) return content
    return content.slice(0, FB_MAX_MESSAGE_CHARS - 1).trimEnd() + '…'
}

async function publishToFacebook(
    pageId: string,
    accessToken: string,
    rawContent: string,
    mediaUrls: string[] | null
): Promise<{ id: string }> {
    const apiBase = `https://graph.facebook.com/v19.0/${pageId}`
    const content = trimForFacebook(rawContent)

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
    for (const mediaUrl of mediaUrls.slice(0, FB_MAX_CAROUSEL_PHOTOS)) {
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

// Instagram captions cap at 2,200 chars per Meta docs.
const IG_MAX_CAPTION_CHARS = 2200

function trimForInstagram(content: string): string {
    if (!content || content.length <= IG_MAX_CAPTION_CHARS) return content
    return content.slice(0, IG_MAX_CAPTION_CHARS - 1).trimEnd() + '…'
}

async function publishToInstagram(
    igUserId: string,
    accessToken: string,
    rawContent: string,
    mediaUrls: string[] | null
): Promise<{ id: string }> {
    if (!mediaUrls || mediaUrls.length === 0) {
        throw new Error('Instagram requires at least one image or video')
    }

    const content = trimForInstagram(rawContent)
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

// YouTube: title caps at 100 chars, description at 5,000.
const YT_MAX_TITLE_CHARS = 100
const YT_MAX_DESCRIPTION_CHARS = 5000

function deriveYouTubeTitle(content: string): string {
    const firstLine = (content || '').split('\n').map(s => s.trim()).find(Boolean) || 'New video'
    if (firstLine.length <= YT_MAX_TITLE_CHARS) return firstLine
    return firstLine.slice(0, YT_MAX_TITLE_CHARS - 1).trimEnd() + '…'
}

function trimForYouTubeDescription(content: string): string {
    if (!content || content.length <= YT_MAX_DESCRIPTION_CHARS) return content
    return content.slice(0, YT_MAX_DESCRIPTION_CHARS - 1).trimEnd() + '…'
}

// Google access tokens expire after ~1 hour. Scheduled posts will almost always
// run with a stale token, so we refresh from the stored refresh_token first.
async function refreshGoogleAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: string }> {
    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID || '',
            client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        }).toString(),
    })
    const data = await res.json()
    if (!res.ok || data.error) {
        throw new Error(data.error_description || data.error || 'Failed to refresh Google token')
    }
    const expiresIn: number = data.expires_in || 3600
    return {
        accessToken: data.access_token,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    }
}

async function publishToYouTube(
    accessToken: string,
    rawContent: string,
    mediaUrls: string[] | null
): Promise<{ id: string }> {
    if (!mediaUrls || mediaUrls.length === 0) {
        throw new Error('YouTube requires a video to upload')
    }

    let videoUrl = mediaUrls[0]
    const isVideo = /\.(mp4|mov|m3u8)(\?|$)/i.test(videoUrl) || videoUrl.includes('stream.mux.com')
    if (!isVideo) {
        throw new Error('YouTube requires a video file (mp4/mov); images are not supported')
    }

    // Convert Mux HLS playlist to a downloadable mp4
    if (videoUrl.includes('stream.mux.com') && videoUrl.endsWith('.m3u8')) {
        const playbackId = videoUrl.split('/').pop()!.replace('.m3u8', '')
        videoUrl = `https://stream.mux.com/${playbackId}/capped-1080p.mp4`
    }

    // YouTube has no fetch-by-URL upload — download the bytes, then upload them.
    const videoRes = await fetch(videoUrl)
    if (!videoRes.ok) throw new Error(`Failed to download video for upload (${videoRes.status})`)
    const videoBuffer = Buffer.from(await videoRes.arrayBuffer())
    const contentType = videoRes.headers.get('content-type') || 'video/mp4'

    const metadata = {
        snippet: {
            title: deriveYouTubeTitle(rawContent),
            description: trimForYouTubeDescription(rawContent),
        },
        status: { privacyStatus: 'public' },
    }

    // 1. Start a resumable upload session
    const initRes = await fetch(
        'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json; charset=UTF-8',
                'X-Upload-Content-Type': contentType,
                'X-Upload-Content-Length': String(videoBuffer.length),
            },
            body: JSON.stringify(metadata),
        }
    )
    if (!initRes.ok) {
        const body = await initRes.text()
        throw new Error(`YouTube upload init failed (${initRes.status}): ${body.slice(0, 300)}`)
    }
    const uploadUrl = initRes.headers.get('location')
    if (!uploadUrl) throw new Error('YouTube did not return a resumable upload URL')

    // 2. Upload the video bytes
    const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': contentType,
            'Content-Length': String(videoBuffer.length),
        },
        body: videoBuffer,
    })
    const uploadData = await uploadRes.json()
    if (!uploadRes.ok || uploadData.error) {
        throw new Error(uploadData.error?.message || `YouTube upload failed (${uploadRes.status})`)
    }
    return { id: uploadData.id }
}

// TikTok caption ("title") caps at 2,200 chars, same as Instagram.
const TT_MAX_TITLE_CHARS = 2200

function trimForTikTok(content: string): string {
    if (!content || content.length <= TT_MAX_TITLE_CHARS) return content
    return content.slice(0, TT_MAX_TITLE_CHARS - 1).trimEnd() + '…'
}

// TikTok access tokens expire after ~24h. Scheduled posts will almost always
// run with a stale token, so we refresh from the stored refresh_token first.
async function refreshTikTokAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresAt: string }> {
    const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_key: process.env.TIKTOK_CLIENT_KEY || '',
            client_secret: process.env.TIKTOK_CLIENT_SECRET || '',
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        }).toString(),
    })
    const data = await res.json()
    if (!res.ok || data.error) {
        throw new Error(data.error_description || data.error || 'Failed to refresh TikTok token')
    }
    const expiresIn: number = data.expires_in || 86400
    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    }
}

async function waitForTikTokPublish(publishId: string, accessToken: string, maxWaitMs = 180000): Promise<void> {
    const start = Date.now()
    while (Date.now() - start < maxWaitMs) {
        const res = await fetch('https://open.tiktokapis.com/v2/post/publish/status/fetch/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ publish_id: publishId }),
        })
        const data = await res.json()
        const status = data?.data?.status
        if (status === 'PUBLISH_COMPLETE') return
        if (status === 'FAILED') {
            throw new Error(data?.data?.fail_reason || 'TikTok publish failed')
        }
        await new Promise(r => setTimeout(r, 5000))
    }
    throw new Error('TikTok publish processing timeout')
}

async function publishToTikTok(
    accessToken: string,
    rawContent: string,
    mediaUrls: string[] | null
): Promise<{ id: string }> {
    if (!mediaUrls || mediaUrls.length === 0) {
        throw new Error('TikTok requires a video to upload')
    }

    let videoUrl = mediaUrls[0]
    const isVideo = /\.(mp4|mov|m3u8)(\?|$)/i.test(videoUrl) || videoUrl.includes('stream.mux.com')
    if (!isVideo) {
        throw new Error('TikTok requires a video file (mp4/mov); images are not supported')
    }

    if (videoUrl.includes('stream.mux.com') && videoUrl.endsWith('.m3u8')) {
        const playbackId = videoUrl.split('/').pop()!.replace('.m3u8', '')
        videoUrl = `https://stream.mux.com/${playbackId}/capped-1080p.mp4`
    }

    // TikTok's Content Posting API has no fetch-by-URL upload for our use
    // case — download the bytes, then upload them directly to TikTok.
    const videoRes = await fetch(videoUrl)
    if (!videoRes.ok) throw new Error(`Failed to download video for upload (${videoRes.status})`)
    const videoBuffer = Buffer.from(await videoRes.arrayBuffer())

    // 1. Initialize the post. Until this app passes TikTok's content posting
    // audit, posted videos are restricted to SELF_ONLY visibility.
    const initRes = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            post_info: {
                title: trimForTikTok(rawContent),
                privacy_level: 'SELF_ONLY',
                disable_duet: false,
                disable_comment: false,
                disable_stitch: false,
            },
            source_info: {
                source: 'FILE_UPLOAD',
                video_size: videoBuffer.length,
                chunk_size: videoBuffer.length,
                total_chunk_count: 1,
            },
        }),
    })
    const initData = await initRes.json()
    if (!initRes.ok || initData.error?.code !== 'ok') {
        throw new Error(initData.error?.message || `TikTok publish init failed (${initRes.status})`)
    }
    const publishId: string = initData.data.publish_id
    const uploadUrl: string = initData.data.upload_url

    // 2. Upload the video bytes
    const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': 'video/mp4',
            'Content-Range': `bytes 0-${videoBuffer.length - 1}/${videoBuffer.length}`,
        },
        body: videoBuffer,
    })
    if (!uploadRes.ok) {
        const body = await uploadRes.text()
        throw new Error(`TikTok video upload failed (${uploadRes.status}): ${body.slice(0, 300)}`)
    }

    // 3. Poll until TikTok finishes processing the upload
    await waitForTikTokPublish(publishId, accessToken)

    return { id: publishId }
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
        .select('id, workspace_id, content, platforms, media_urls, first_comment')
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
        .select('platform, account_id, account_name, access_token, refresh_token, token_expires_at')
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

                // Post first-comment on IG after successful publish — best-effort
                let firstCommentWarning: string | null = null
                if (postAny.first_comment && publishedRef?.id) {
                    try {
                        const commentRes = await fetch(
                            `https://graph.facebook.com/v19.0/${publishedRef.id}/comments`,
                            {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    message: postAny.first_comment,
                                    access_token: account.access_token,
                                }),
                            }
                        )
                        const commentData = await commentRes.json()
                        if (commentData.error) {
                            firstCommentWarning = `first_comment failed: ${commentData.error.message}`
                            console.error('publishPost: IG first comment error:', commentData.error)
                        }
                    } catch (err: any) {
                        firstCommentWarning = `first_comment failed: ${err.message}`
                        console.error('publishPost: IG first comment exception:', err)
                    }
                }

                if (firstCommentWarning) {
                    // Append warning to last_error later — track it on the result
                    ;(publishedRef as any)._firstCommentWarning = firstCommentWarning
                }
            } else if (account.platform === 'youtube') {
                // Google tokens last ~1h; refresh if missing/expired before uploading.
                let token: string = account.access_token
                const expiresAt = account.token_expires_at ? new Date(account.token_expires_at).getTime() : 0
                if (!expiresAt || expiresAt < Date.now() + 60_000) {
                    if (!account.refresh_token) {
                        throw new Error('YouTube token expired and no refresh token stored — reconnect the channel')
                    }
                    const refreshed = await refreshGoogleAccessToken(account.refresh_token)
                    token = refreshed.accessToken
                    await supabase
                        .from('social_accounts')
                        .update({ access_token: token, token_expires_at: refreshed.expiresAt } as never)
                        .eq('workspace_id', postAny.workspace_id)
                        .eq('platform', 'youtube')
                        .eq('account_id', account.account_id)
                }
                publishedRef = await publishToYouTube(token, postAny.content, postAny.media_urls)
            } else if (account.platform === 'tiktok') {
                // TikTok tokens last ~24h; refresh if missing/expired before uploading.
                let token: string = account.access_token
                const expiresAt = account.token_expires_at ? new Date(account.token_expires_at).getTime() : 0
                if (!expiresAt || expiresAt < Date.now() + 60_000) {
                    if (!account.refresh_token) {
                        throw new Error('TikTok token expired and no refresh token stored — reconnect the account')
                    }
                    const refreshed = await refreshTikTokAccessToken(account.refresh_token)
                    token = refreshed.accessToken
                    await supabase
                        .from('social_accounts')
                        .update({ access_token: token, refresh_token: refreshed.refreshToken, token_expires_at: refreshed.expiresAt } as never)
                        .eq('workspace_id', postAny.workspace_id)
                        .eq('platform', 'tiktok')
                        .eq('account_id', account.account_id)
                }
                publishedRef = await publishToTikTok(token, postAny.content, postAny.media_urls)
            } else {
                throw new Error(`Publishing to ${account.platform} not yet supported`)
            }

            const resultEntry: PublishResult = {
                platform: account.platform,
                account_name: account.account_name,
                success: true,
                post_id: publishedRef?.id,
            }

            // Attach first-comment warning if present
            const fcWarn = (publishedRef as any)?._firstCommentWarning
            if (fcWarn) {
                ;(resultEntry as any).first_comment_warning = fcWarn
            }

            results.push(resultEntry)
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
    const fcWarnings = results
        .filter(r => r.success && (r as any).first_comment_warning)
        .map(r => `${r.platform}: ${(r as any).first_comment_warning}`)
    const lastErrorParts: string[] = []
    if (failed.length > 0) {
        lastErrorParts.push(failed.map(r => `${r.platform} (${r.account_name}): ${r.error || 'unknown'}`).join(' | '))
    }
    if (fcWarnings.length > 0) {
        lastErrorParts.push(fcWarnings.join(' | '))
    }
    const lastError = lastErrorParts.length > 0 ? lastErrorParts.join(' | ') : null

    const updatePayload: Record<string, any> = { status: anySuccess ? 'published' : 'failed' }
    if (lastError) updatePayload.last_error = lastError

    const { error: finalErr } = await supabase
        .from('posts')
        .update(updatePayload as never)
        .eq('id', postId)

    if (finalErr) console.error('publishPost: failed to set final status:', finalErr)

    // Persist platform post IDs for later engagement fetching — best-effort
    for (const result of results) {
        if (!result.success || !result.post_id) continue
        try {
            const { error: prErr } = await supabase
                .from('post_results')
                .upsert({
                    post_id: postId,
                    platform: result.platform,
                    platform_post_id: result.post_id,
                    impressions: null,
                    reach: null,
                    likes: null,
                    comments: null,
                    shares: null,
                    saved: null,
                    fetched_at: null,
                } as any, { onConflict: 'post_id,platform' })

            if (prErr) {
                console.error(`publishPost: failed to upsert post_results for ${result.platform}:`, prErr)
            }
        } catch (err: any) {
            console.error(`publishPost: error upserting post_results for ${result.platform}:`, err)
        }
    }

    return {
        success: anySuccess,
        allSuccess,
        results,
    }
}
