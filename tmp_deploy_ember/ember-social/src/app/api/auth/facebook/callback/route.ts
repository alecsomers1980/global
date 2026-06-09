import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'
import { resolveWorkspace } from '@/lib/resolve-workspace'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const workspaceId = searchParams.get('state') // We passed this earlier
    const error = searchParams.get('error')

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const redirectUri = `${baseUrl}/api/auth/facebook/callback`

    // Redirect using slug if available
    const workspace = workspaceId ? await resolveWorkspace(workspaceId) : null
    const redirectSlug = workspace?.slug || workspaceId
    const dashboardUrl = `${baseUrl}/dashboard/workspaces/${redirectSlug}/platforms`

    // If the user cancelled the login or something went wrong
    if (error || !code || !workspaceId) {
        console.error('Facebook Auth Error:', error)
        return NextResponse.redirect(`${dashboardUrl}?error=${error || 'missing_params'}`)
    }

    try {
        console.log('FB Callback: Starting token exchange...')
        // 1. Exchange the code for a User Access Token
        const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${process.env.META_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${process.env.META_APP_SECRET}&code=${code}`)
        const tokenData = await tokenRes.json()

        if (tokenData.error) {
            console.error('FB Callback: Token Exchange Error', tokenData.error)
            throw new Error(tokenData.error.message || 'Failed to get user token')
        }

        console.log('FB Callback: Token received from Facebook successfully.')
        const userAccessToken = tokenData.access_token

        // 2. Fetch the pages the user has access to
        // We will store all these pages as separate social accounts
        console.log('FB Callback: Fetching user pages...')
        const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${userAccessToken}`)
        const pagesData = await pagesRes.json()

        if (pagesData.error) {
            console.error('FB Callback: Pages Fetch Error', pagesData.error)
            throw new Error(pagesData.error.message || 'Failed to fetch pages')
        }

        console.log('FB Callback: Raw pages API response:', JSON.stringify(pagesData, null, 2))
        console.log(`FB Callback: Found ${pagesData.data?.length || 0} pages.`)

        // Initialize Supabase admin client to store the tokens securely
        const supabase = await createServerSupabaseClient()

        // 3. Store each page in the social_accounts table
        // The graph API response `data` contains an array of pages, each with its own `access_token`
        const accountsToInsert = pagesData.data.map((page: any) => ({
            workspace_id: workspaceId,
            platform: 'facebook' as const,
            account_id: page.id,
            account_name: page.name,
            access_token: page.access_token, // This is a Page Access Token, which we need for publishing
            // Page access tokens don't expire as long as the user access token is valid (and it's a long lived token if requested)
            token_expires_at: null,
            refresh_token: null
        }))

        // We use upsert so that if the user reconnects, we just update the tokens
        if (accountsToInsert.length > 0) {
            console.log('FB Callback: Upserting accounts into Supabase...')
            const { error: dbError } = await supabase
                .from('social_accounts')
                // Using upsert with conflict on workspace_id, platform, and account_id
                // Note: Make sure there is a unique constraint on (workspace_id, platform, account_id) in Supabase.
                .upsert(accountsToInsert, { onConflict: 'workspace_id,platform,account_id' })

            if (dbError) {
                console.error('FB Callback: Supabase Insert Error:', dbError)
                throw new Error('Database error saving accounts')
            }
            console.log('FB Callback: Successfully saved accounts to database.')
        } else {
            console.log('FB Callback: No pages found to insert.')
        }

        return NextResponse.redirect(`${dashboardUrl}?success=true`)

    } catch (err: any) {
        console.error('FB Callback: Fatal Error Catch:', err)
        return NextResponse.redirect(`${dashboardUrl}?error=auth_failed`)
    }
}
