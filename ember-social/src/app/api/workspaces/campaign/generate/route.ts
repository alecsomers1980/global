import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'
import { resolveWorkspaceId } from '@/lib/resolve-workspace'
import { getNextAvailableDate } from '@/lib/scheduling'
import { generateCampaign } from '@/lib/ai/campaignGenerator'
import crypto from 'crypto'

export async function POST(req: Request) {
    try {
        const { workspaceId, durationDays } = await req.json()
        if (!workspaceId) {
            return NextResponse.json({ error: 'workspaceId required' }, { status: 400 })
        }

        const resolvedId = await resolveWorkspaceId(workspaceId)
        const supabase = await createServerSupabaseClient()

        const [{ data: intel }, { data: socialAccounts }] = await Promise.all([
            supabase.from('client_intelligence').select('*').eq('workspace_id', resolvedId).single(),
            supabase.from('social_accounts').select('platform').eq('workspace_id', resolvedId)
        ])

        const connectedPlatforms = (socialAccounts || []).map((a: any) => a.platform)
        const days = durationDays || 30

        const result = await generateCampaign({
            workspaceId: resolvedId,
            durationDays: days,
            connectedPlatforms,
            intel
        })

        const defaultHour = (intel as any)?.best_performing_hours?.facebook?.[0] ?? 9

        // posts.approval_token is uniquely constrained — each post gets its own UUID.
        // Returning the first one keeps the API response compatible with single-post review flows.
        // Day 3 introduces campaign_batches to group posts under a shared batch id.
        const firstApprovalToken = crypto.randomUUID()

        const tomorrow = new Date()
        tomorrow.setUTCHours(0, 0, 0, 0)
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)

        let inserted = 0
        const errors: string[] = []

        for (let i = 0; i < result.posts.length; i++) {
            const post = result.posts[i]
            const approvalToken = i === 0 ? firstApprovalToken : crypto.randomUUID()
            try {
                // Compute the target date from day_offset
                const targetDate = new Date(tomorrow)
                targetDate.setUTCDate(targetDate.getUTCDate() + (post.day_offset || 0))

                const scheduledDate = await getNextAvailableDate(supabase, resolvedId, {
                    startFrom: targetDate,
                    timeOfDay: { hour: defaultHour, minute: 0 }
                })

                const variants = post.variants || {}
                const fbVariant = variants.facebook
                // Populate content from FB variant, fall back to first available variant
                const content = fbVariant?.content ||
                    (variants as any).instagram?.content ||
                    (variants as any).tiktok?.content ||
                    ''

                // Platforms = union of variant keys present
                const platforms = Object.keys(variants).filter(k =>
                    ['facebook', 'instagram', 'tiktok'].includes(k) &&
                    (variants as any)[k]?.content
                )

                const { error: insertError } = await supabase
                    .from('posts')
                    .insert({
                        workspace_id: resolvedId,
                        content,
                        variants,
                        pillar: post.pillar,
                        rationale: post.rationale,
                        platforms,
                        media_urls: null,
                        scheduled_at: scheduledDate.toISOString(),
                        status: 'pending_approval',
                        approval_token: approvalToken
                    } as any)

                if (insertError) {
                    errors.push(`Post ${inserted}: ${insertError.message}`)
                } else {
                    inserted++
                }
            } catch (e: any) {
                errors.push(`Post ${inserted}: ${e.message}`)
            }
        }

        return NextResponse.json({
            ok: true,
            count: inserted,
            approval_token: firstApprovalToken,
            strategy_rationale: result.strategy_rationale,
            pillars: result.pillars,
            errors: errors.length > 0 ? errors : undefined
        })
    } catch (error: any) {
        console.error('Campaign generate error:', error)
        return NextResponse.json({ ok: false, error: error.message || 'Generation failed' })
    }
}
