import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'
import { resolveWorkspace } from '@/lib/resolve-workspace'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const workspaceId = searchParams.get('state')
    const error = searchParams.get('error')

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const redirectUri = `${baseUrl}/api/auth/instagram/callback`

    const workspace = workspaceId ? await resolveWorkspace(workspaceId) : null
    const redirectSlug = workspace?.slug || workspaceId
    const dashboardUrl = `${baseUrl}/dashboard/workspaces/${redirectSlug}/platforms`

    if (error || !code || !workspaceId) {
        console.error('Instagram Auth Error:', error)
        return NextResponse.redirect(`${dashboardUrl}?error=${error || 'missing_params'}`)
    }

    try {
        // 1. Exchange code for User Access Token
        const tokenRes = await fetch(
            `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${process.env.META_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${process.env.META_APP_SECRET}&code=${code}`
        )
        const tokenData = await tokenRes.json()

        if (tokenData.error) {
            console.error('IG Callback: Token Exchange Error', tokenData.error)
            throw new Error(tokenData.error.message || 'Failed to get user token')
        }

        const userAccessToken = tokenData.access_token

        // 2. Fetch user's Facebook Pages (needed to find linked IG accounts)
        const pagesRes = await fetch(
            `https://graph.facebook.com/v19.0/me/accounts?access_token=${userAccessToken}`
        )
        const pagesData = await pagesRes.json()

        if (pagesData.error) {
            console.error('IG Callback: Pages Fetch Error', pagesData.error)
            throw new Error(pagesData.error.message || 'Failed to fetch pages')
        }

        console.log(`IG Callback: Found ${pagesData.data?.length || 0} pages, checking for linked IG accounts...`)

        const supabase = await createServerSupabaseClient()
        const accountsToInsert: any[] = []

        // 3. For each page, check if it has a linked Instagram Business account
        for (const page of (pagesData.data || [])) {
            try {
                const igRes = await fetch(
                    `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
                )
                const igData = await igRes.json()

                if (igData.instagram_business_account) {
                    const igAccountId = igData.instagram_business_account.id

                    // Fetch IG account details (username, profile pic)
                    const igDetailsRes = await fetch(
                        `https://graph.facebook.com/v19.0/${igAccountId}?fields=username,name,profile_picture_url&access_token=${page.access_token}`
                    )
                    const igDetails = await igDetailsRes.json()

                    accountsToInsert.push({
                        workspace_id: workspaceId,
                        platform: 'instagram',
                        account_id: igAccountId,
                        account_name: igDetails.username ? `@${igDetails.username}` : page.name,
                        access_token: page.access_token, // IG API uses the Page Access Token
                        token_expires_at: null,
                        refresh_token: null,
                    })

                    console.log(`IG Callback: Found IG account @${igDetails.username} linked to page "${page.name}"`)
                }
            } catch (igErr) {
                console.error(`IG Callback: Error checking page ${page.name}:`, igErr)
            }
        }

        // 4. Store Instagram accounts
        if (accountsToInsert.length > 0) {
            const { error: dbError } = await supabase
                .from('social_accounts')
                .upsert(accountsToInsert as never, { onConflict: 'workspace_id,platform,account_id' })

            if (dbError) {
                console.error('IG Callback: Supabase Insert Error:', dbError)
                throw new Error('Database error saving Instagram accounts')
            }
            console.log(`IG Callback: Saved ${accountsToInsert.length} Instagram account(s).`)
        } else {
            console.log('IG Callback: No Instagram Business accounts found linked to any pages.')
            return NextResponse.redirect(`${dashboardUrl}?error=no_instagram_account`)
        }

        return NextResponse.redirect(`${dashboardUrl}?success=true`)

    } catch (err: any) {
        console.error('IG Callback: Fatal Error:', err)
        return NextResponse.redirect(`${dashboardUrl}?error=auth_failed`)
    }
}
