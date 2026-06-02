import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'
import { resolveWorkspace } from '@/lib/resolve-workspace'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const workspaceId = searchParams.get('state')
    const oauthError = searchParams.get('error')

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const redirectUri = `${baseUrl}/api/auth/youtube/callback`

    const workspace = workspaceId ? await resolveWorkspace(workspaceId) : null
    const redirectSlug = workspace?.slug || workspaceId
    const dashboardUrl = `${baseUrl}/dashboard/workspaces/${redirectSlug}/platforms`

    if (oauthError || !code || !workspaceId) {
        console.error('YouTube Auth Error:', oauthError)
        return NextResponse.redirect(`${dashboardUrl}?error=${oauthError || 'missing_params'}`)
    }

    try {
        // 1. Exchange code for access + refresh tokens
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID || '',
                client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }).toString(),
        })

        const tokenData = await tokenRes.json()
        if (!tokenRes.ok || tokenData.error) {
            console.error('YouTube Callback: Token Exchange Error', tokenData)
            throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange code')
        }

        const accessToken: string = tokenData.access_token
        const refreshToken: string | null = tokenData.refresh_token || null
        const expiresIn: number = tokenData.expires_in || 3600
        const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

        // 2. Fetch the authenticated user's YouTube channel
        const chRes = await fetch(
            'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
            { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        const chData = await chRes.json()

        if (!chRes.ok || chData.error) {
            console.error('YouTube Callback: Channel fetch error', chData)
            throw new Error(chData.error?.message || 'Failed to fetch YouTube channel')
        }

        const channel = (chData.items || [])[0]
        if (!channel) {
            return NextResponse.redirect(`${dashboardUrl}?error=no_youtube_channel`)
        }

        const accountId: string = channel.id
        const accountName: string = channel.snippet?.title || 'YouTube Channel'

        // 3. Upsert into social_accounts
        const supabase = await createServerSupabaseClient()
        const { error: dbError } = await supabase
            .from('social_accounts')
            .upsert(
                {
                    workspace_id: workspaceId,
                    platform: 'youtube' as const,
                    account_id: accountId,
                    account_name: accountName,
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    token_expires_at: expiresAt,
                } as never,
                { onConflict: 'workspace_id,platform,account_id' }
            )

        if (dbError) {
            console.error('YouTube Callback: Supabase Insert Error:', dbError)
            throw new Error('Database error saving YouTube account')
        }

        return NextResponse.redirect(`${dashboardUrl}?success=true`)
    } catch (err: any) {
        console.error('YouTube Callback: Fatal Error:', err)
        return NextResponse.redirect(`${dashboardUrl}?error=auth_failed`)
    }
}
