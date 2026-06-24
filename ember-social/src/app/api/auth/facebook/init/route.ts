import { NextResponse } from 'next/server'
import { resolveWorkspaceId } from '@/lib/resolve-workspace'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const workspaceParam = searchParams.get('workspaceId')
    const reauth = searchParams.get('reauth') // Force fresh login to switch accounts

    if (!workspaceParam) {
        return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 })
    }

    const workspaceId = await resolveWorkspaceId(workspaceParam)

    const appId = process.env.META_APP_ID
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const redirectUri = `${baseUrl}/api/auth/facebook/callback`

    // Request permissions for pages and Instagram Business
    // read_insights is required for post_impressions / post_impressions_unique (reach)
    const scope = 'public_profile,pages_show_list,pages_read_engagement,pages_manage_metadata,pages_manage_posts,pages_manage_engagement,read_insights'

    let authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${workspaceId}&scope=${scope}`

    // Force re-authentication so user can pick a different Facebook account
    if (reauth === '1') {
        authUrl += '&auth_type=reauthenticate'
    }

    return NextResponse.redirect(authUrl)
}
