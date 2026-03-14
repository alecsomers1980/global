import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    // We pass the workspaceId as the state parameter so we know which workspace
    // to attach the connected accounts to when Facebook redirects back.
    if (!workspaceId) {
        return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 })
    }

    const appId = process.env.META_APP_ID
    // Use NEXT_PUBLIC_BASE_URL to dynamically build the redirect URL
    // or default to localhost for development
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const redirectUri = `${baseUrl}/api/auth/facebook/callback`

    // Request only the basic permissions needed to list and read pages.
    // pages_manage_posts is an advanced permission that requires Meta App Review 
    // and causes Facebook to silently return 0 pages in development mode.
    // We add pages_manage_posts back once the app is approved.
    const scope = 'public_profile,pages_show_list,pages_read_engagement,pages_manage_metadata'

    // Construct the Facebook OAuth URL
    const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${workspaceId}&scope=${scope}`

    // Redirect the user to Facebook
    return NextResponse.redirect(authUrl)
}
