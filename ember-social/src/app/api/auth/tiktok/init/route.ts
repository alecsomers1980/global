import { NextResponse } from 'next/server'
import { resolveWorkspaceId } from '@/lib/resolve-workspace'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const workspaceParam = searchParams.get('workspaceId')

    if (!workspaceParam) {
        return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 })
    }

    const workspaceId = await resolveWorkspaceId(workspaceParam)

    const clientKey = process.env.TIKTOK_CLIENT_KEY
    if (!clientKey) {
        return NextResponse.json({ error: 'TIKTOK_CLIENT_KEY not configured' }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const redirectUri = `${baseUrl}/api/auth/tiktok/callback`

    // user.info.basic: profile; video.publish: Direct Post (requires TikTok app audit approval)
    const scope = 'user.info.basic,video.publish'

    const params = new URLSearchParams({
        client_key: clientKey,
        scope,
        response_type: 'code',
        redirect_uri: redirectUri,
        state: workspaceId,
    })

    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`
    return NextResponse.redirect(authUrl)
}
