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

    const appId = process.env.META_APP_ID
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const redirectUri = `${baseUrl}/api/auth/instagram/callback`

    // Instagram Business API requires these permissions via Facebook Login:
    // - instagram_basic: read IG account info
    // - instagram_content_publish: publish posts (requires Meta App Review)
    // - pages_show_list: list pages (needed to find linked IG account)
    // - pages_read_engagement: read page data
    const scope = 'public_profile,pages_show_list,pages_read_engagement,instagram_basic,instagram_content_publish'

    let authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${workspaceId}&scope=${scope}`

    if (reauth === '1') {
        authUrl += '&auth_type=reauthenticate'
    }

    return NextResponse.redirect(authUrl)
}
