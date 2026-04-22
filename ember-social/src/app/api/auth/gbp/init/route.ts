import { NextResponse } from 'next/server'
import { resolveWorkspaceId } from '@/lib/resolve-workspace'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const workspaceParam = searchParams.get('workspaceId')
    const reauth = searchParams.get('reauth')

    if (!workspaceParam) {
        return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 })
    }

    const workspaceId = await resolveWorkspaceId(workspaceParam)

    const clientId = process.env.GOOGLE_CLIENT_ID
    if (!clientId) {
        return NextResponse.json({ error: 'GOOGLE_CLIENT_ID not configured' }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const redirectUri = `${baseUrl}/api/auth/gbp/callback`

    // business.manage covers reading accounts/locations and (once API is approved) publishing localPosts
    const scope = [
        'https://www.googleapis.com/auth/business.manage',
        'openid',
        'email',
    ].join(' ')

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope,
        access_type: 'offline',
        include_granted_scopes: 'true',
        state: workspaceId,
        // prompt=consent forces refresh_token to be returned every time, including reconnect
        prompt: reauth === '1' ? 'consent select_account' : 'consent',
    })

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    return NextResponse.redirect(authUrl)
}
