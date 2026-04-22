import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'
import { resolveWorkspace } from '@/lib/resolve-workspace'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const workspaceId = searchParams.get('state')
    const oauthError = searchParams.get('error')

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const redirectUri = `${baseUrl}/api/auth/gbp/callback`

    const workspace = workspaceId ? await resolveWorkspace(workspaceId) : null
    const redirectSlug = workspace?.slug || workspaceId
    const dashboardUrl = `${baseUrl}/dashboard/workspaces/${redirectSlug}/platforms`

    if (oauthError || !code || !workspaceId) {
        console.error('GBP Auth Error:', oauthError)
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
            console.error('GBP Callback: Token Exchange Error', tokenData)
            throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange code')
        }

        const accessToken: string = tokenData.access_token
        const refreshToken: string | null = tokenData.refresh_token || null
        const expiresIn: number = tokenData.expires_in || 3600
        const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

        // 2. Grab user email (cheap, always works)
        let email = 'Google Business'
        try {
            const uRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` },
            })
            if (uRes.ok) {
                const u = await uRes.json()
                email = u.email || email
            }
        } catch { /* non-fatal */ }

        // 3. Try to fetch GBP accounts — only works once API access is approved by Google.
        //    If it fails (403 PERMISSION_DENIED / SERVICE_DISABLED), store a placeholder so the user
        //    still sees the account as "connected — awaiting API approval".
        let accountId = 'pending_approval'
        let accountName = `${email} (awaiting API approval)`
        let apiApproved = false

        try {
            const accRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
                headers: { Authorization: `Bearer ${accessToken}` },
            })
            if (accRes.ok) {
                const accData = await accRes.json()
                const accounts = accData.accounts || []
                if (accounts.length > 0) {
                    // accounts[0].name is like "accounts/1234567890"
                    const raw = accounts[0].name as string
                    accountId = raw.split('/').pop() || raw
                    accountName = accounts[0].accountName || accounts[0].name || email
                    apiApproved = true
                }
            } else {
                const body = await accRes.text()
                console.warn(`GBP Callback: accounts fetch returned ${accRes.status}:`, body.slice(0, 300))
            }
        } catch (e: any) {
            console.warn('GBP Callback: accounts fetch exception (likely API not yet approved):', e.message)
        }

        // 4. Upsert into social_accounts
        const supabase = await createServerSupabaseClient()
        const { error: dbError } = await supabase
            .from('social_accounts')
            .upsert(
                {
                    workspace_id: workspaceId,
                    platform: 'google_business' as const,
                    account_id: accountId,
                    account_name: accountName,
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    token_expires_at: expiresAt,
                } as never,
                { onConflict: 'workspace_id,platform,account_id' }
            )

        if (dbError) {
            console.error('GBP Callback: Supabase Insert Error:', dbError)
            throw new Error('Database error saving Google Business account')
        }

        const successFlag = apiApproved ? 'success=true' : 'success=pending_approval'
        return NextResponse.redirect(`${dashboardUrl}?${successFlag}`)
    } catch (err: any) {
        console.error('GBP Callback: Fatal Error:', err)
        return NextResponse.redirect(`${dashboardUrl}?error=auth_failed`)
    }
}
