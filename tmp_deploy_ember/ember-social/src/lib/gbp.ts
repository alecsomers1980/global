/**
 * Google Business Profile integration.
 *
 * OAuth + token refresh work today with the four newer "My Business *" APIs.
 * Creating localPosts still uses the legacy Google My Business API v4.9, which
 * Google only enables on an individual project after you submit the
 * Business Profile API access request form. Everything here is wired so that
 * the moment that access is granted, posts will start publishing with zero
 * code changes — just set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET and have
 * the user reconnect if needed.
 */

import { createServerSupabaseClient } from '@/lib/supabase/client'

type TokenRow = {
    id: string
    access_token: string
    refresh_token: string | null
    token_expires_at: string | null
    account_id: string
}

export class GbpApiNotApproved extends Error {
    constructor(message = 'Google Business Profile API access has not been approved yet') {
        super(message)
        this.name = 'GbpApiNotApproved'
    }
}

async function refreshAccessToken(row: TokenRow): Promise<string> {
    if (!row.refresh_token) {
        throw new Error('No refresh token stored — user must reconnect Google Business')
    }
    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID || '',
            client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
            refresh_token: row.refresh_token,
            grant_type: 'refresh_token',
        }).toString(),
    })
    const data = await res.json()
    if (!res.ok || data.error) {
        throw new Error(data.error_description || data.error || 'Failed to refresh GBP token')
    }

    const supabase = await createServerSupabaseClient()
    const expiresAt = new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString()
    await supabase
        .from('social_accounts')
        .update({ access_token: data.access_token, token_expires_at: expiresAt } as never)
        .eq('id', row.id)

    return data.access_token
}

async function getFreshAccessToken(workspaceId: string): Promise<{ token: string; accountId: string }> {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
        .from('social_accounts')
        .select('id, access_token, refresh_token, token_expires_at, account_id')
        .eq('workspace_id', workspaceId)
        .eq('platform', 'google_business')
        .limit(1)
        .maybeSingle()

    if (error) throw error
    if (!data) throw new Error('No Google Business account connected for this workspace')

    const row = data as unknown as TokenRow
    const expiresAt = row.token_expires_at ? new Date(row.token_expires_at).getTime() : 0
    const expiresSoon = !expiresAt || expiresAt < Date.now() + 60_000

    const token = expiresSoon ? await refreshAccessToken(row) : row.access_token
    return { token, accountId: row.account_id }
}

/**
 * Resolve the first location name (e.g. "accounts/123/locations/456") for this account.
 * Requires the My Business Business Information API to be enabled and the user to
 * have at least one verified location.
 */
export async function getFirstLocationName(workspaceId: string): Promise<string> {
    const { token, accountId } = await getFreshAccessToken(workspaceId)
    if (accountId === 'pending_approval') throw new GbpApiNotApproved()

    const res = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations?readMask=name,title`,
        { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!res.ok) {
        const body = await res.text()
        if (res.status === 403) throw new GbpApiNotApproved(body)
        throw new Error(`GBP locations fetch failed: ${res.status} ${body.slice(0, 200)}`)
    }
    const data = await res.json()
    const locations = data.locations || []
    if (locations.length === 0) throw new Error('No verified Google Business locations found')
    return locations[0].name
}

type LocalPostInput = {
    summary: string
    mediaUrl?: string
    ctaType?: 'LEARN_MORE' | 'BOOK' | 'ORDER' | 'SHOP' | 'SIGN_UP' | 'CALL'
    ctaUrl?: string
}

/**
 * Publish a Google Business Profile "local post" (text + optional media + optional CTA).
 *
 * Uses the legacy v4 endpoint because that's still where localPosts live. Throws
 * GbpApiNotApproved if the endpoint returns 403 / 404 — which is exactly what
 * happens until Google approves the Business Profile API access request.
 */
export async function createLocalPost(workspaceId: string, input: LocalPostInput): Promise<{ name: string }> {
    const { token } = await getFreshAccessToken(workspaceId)
    const locationName = await getFirstLocationName(workspaceId)

    const body: Record<string, any> = {
        languageCode: 'en',
        summary: input.summary.slice(0, 1500),
        topicType: 'STANDARD',
    }
    if (input.mediaUrl) {
        body.media = [{ mediaFormat: 'PHOTO', sourceUrl: input.mediaUrl }]
    }
    if (input.ctaType && input.ctaUrl) {
        body.callToAction = { actionType: input.ctaType, url: input.ctaUrl }
    }

    const res = await fetch(`https://mybusiness.googleapis.com/v4/${locationName}/localPosts`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })

    const text = await res.text()
    if (!res.ok) {
        if (res.status === 403 || res.status === 404) throw new GbpApiNotApproved(text)
        throw new Error(`GBP localPost failed: ${res.status} ${text.slice(0, 300)}`)
    }
    return JSON.parse(text)
}
