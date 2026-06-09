import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'
import { resolveWorkspace } from '@/lib/resolve-workspace'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const workspaceId = searchParams.get('state')
    const oauthError = searchParams.get('error')

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const redirectUri = `${baseUrl}/api/auth/tiktok/callback`

    const workspace = workspaceId ? await resolveWorkspace(workspaceId) : null
    const redirectSlug = workspace?.slug || workspaceId
    const dashboardUrl = `${baseUrl}/dashboard/workspaces/${redirectSlug}/platforms`

    if (oauthError || !code || !workspaceId) {
        console.error('TikTok Auth Error:', oauthError)
        return NextResponse.redirect(`${dashboardUrl}?error=${oauthError || 'missing_params'}`)
    }

    try {
        // 1. Exchange code for access + refresh tokens
        const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_key: process.env.TIKTOK_CLIENT_KEY || '',
                client_secret: process.env.TIKTOK_CLIENT_SECRET || '',
                code,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri,
            }).toString(),
        })

        const tokenData = await tokenRes.json()
        if (!tokenRes.ok || tokenData.error) {
            console.error('TikTok Callback: Token Exchange Error', tokenData)
            throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange code')
        }

        const accessToken: string = tokenData.access_token
        const refreshToken: string | null = tokenData.refresh_token || null
        const openId: string = tokenData.open_id
        const expiresIn: number = tokenData.expires_in || 86400
        const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

        // 2. Fetch the display name for a friendly account label
        let accountName = 'TikTok Account'
        try {
            const uRes = await fetch(
                'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name',
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )
            const uData = await uRes.json()
            accountName = uData?.data?.user?.display_name || accountName
        } catch { /* non-fatal */ }

        // 3. Upsert into social_accounts
        const supabase = await createServerSupabaseClient()
        const { error: dbError } = await supabase
            .from('social_accounts')
            .upsert(
                {
                    workspace_id: workspaceId,
                    platform: 'tiktok' as const,
                    account_id: openId,
                    account_name: accountName,
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    token_expires_at: expiresAt,
                } as never,
                { onConflict: 'workspace_id,platform,account_id' }
            )

        if (dbError) {
            console.error('TikTok Callback: Supabase Insert Error:', dbError)
            throw new Error('Database error saving TikTok account')
        }

        return NextResponse.redirect(`${dashboardUrl}?success=true`)
    } catch (err: any) {
        console.error('TikTok Callback: Fatal Error:', err)
        return NextResponse.redirect(`${dashboardUrl}?error=auth_failed`)
    }
}
