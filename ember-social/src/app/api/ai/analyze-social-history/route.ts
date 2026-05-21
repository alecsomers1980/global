import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { resolveWorkspaceId } from '@/lib/resolve-workspace'
import { createAdminClient } from '@/lib/supabase/client'

interface FbPost {
    message?: string
    created_time: string
    reactions?: { summary?: { total_count?: number } }
    comments?: { summary?: { total_count?: number } }
    shares?: number
}

interface IgPost {
    caption?: string
    timestamp: string
    like_count?: number
    comments_count?: number
}

function engagementFb(p: FbPost): number {
    return (p.reactions?.summary?.total_count || 0) +
        (p.comments?.summary?.total_count || 0) +
        (p.shares || 0)
}

function engagementIg(p: IgPost): number {
    return (p.like_count || 0) + (p.comments_count || 0)
}

function computeCadence(posts: { created_time: string }[]): number | null {
    if (posts.length < 2) return null
    const times = posts.map(p => new Date(p.created_time).getTime())
    const spanDays = (Math.max(...times) - Math.min(...times)) / (1000 * 60 * 60 * 24)
    const weeks = Math.max(spanDays / 7, 1)
    return Math.round((posts.length / weeks) * 10) / 10
}

function computeBestHours(
    posts: { created_time: string; eng: number }[]
): number[] {
    const buckets: Record<number, { total: number; count: number }> = {}
    for (const p of posts) {
        const h = new Date(p.created_time).getUTCHours()
        if (!buckets[h]) buckets[h] = { total: 0, count: 0 }
        buckets[h].total += p.eng
        buckets[h].count++
    }
    return Object.entries(buckets)
        .map(([h, d]) => ({ hour: parseInt(h), mean: d.total / d.count }))
        .sort((a, b) => b.mean - a.mean)
        .slice(0, 3)
        .map(e => e.hour)
}

export async function POST(req: Request) {
    try {
        const { workspaceId } = await req.json()
        if (!workspaceId) {
            return NextResponse.json({ ok: false, reason: 'workspaceId required' })
        }

        const resolvedId = await resolveWorkspaceId(workspaceId)
        const supabase = createAdminClient()

        const { data: accounts, error: acctError } = await supabase
            .from('social_accounts')
            .select('*')
            .eq('workspace_id', resolvedId)
            .in('platform', ['facebook', 'instagram'])

        if (acctError || !accounts?.length) {
            return NextResponse.json({
                ok: false,
                reason: acctError?.message || 'No social accounts connected'
            })
        }

        const fbAccounts = accounts.filter(a => a.platform === 'facebook')
        const igAccounts = accounts.filter(a => a.platform === 'instagram')

        // ── Fetch Facebook posts ──
        const allFbPosts: FbPost[] = []
        for (const acct of fbAccounts) {
            try {
                const url = `https://graph.facebook.com/v19.0/${acct.account_id}/posts?fields=message,created_time,reactions.summary(total_count),comments.summary(total_count),shares&limit=50&access_token=${acct.access_token}`
                const res = await fetch(url)
                if (!res.ok) {
                    console.error(`FB fetch failed for ${acct.account_id}: ${res.status}`)
                    continue
                }
                const json = await res.json()
                if (json.data) allFbPosts.push(...json.data)
            } catch (e) {
                console.error(`FB fetch error for ${acct.account_id}:`, e)
                continue
            }
        }

        // ── Fetch Instagram posts ──
        const allIgPosts: IgPost[] = []
        for (const acct of igAccounts) {
            try {
                const url = `https://graph.facebook.com/v19.0/${acct.account_id}/media?fields=caption,timestamp,like_count,comments_count&limit=50&access_token=${acct.access_token}`
                const res = await fetch(url)
                if (!res.ok) {
                    console.error(`IG fetch failed for ${acct.account_id}: ${res.status}`)
                    continue
                }
                const json = await res.json()
                if (json.data) allIgPosts.push(...json.data)
            } catch (e) {
                console.error(`IG fetch error for ${acct.account_id}:`, e)
                continue
            }
        }

        // ── Compute per-platform stats ──
        const fbCadence = computeCadence(allFbPosts)
        const igCadence = computeCadence(allIgPosts)

        const fbHours = computeBestHours(
            allFbPosts.map(p => ({ created_time: p.created_time, eng: engagementFb(p) }))
        )
        const igHours = computeBestHours(
            allIgPosts.map(p => ({ created_time: p.timestamp, eng: engagementIg(p) }))
        )

        // ── GPT-4o-mini: top 30 captions by engagement ──
        let historicalVoice: string | null = null
        let topThemes: string[] = []

        const rankedPosts = [
            ...allFbPosts.map(p => ({ caption: p.message || '', eng: engagementFb(p) })),
            ...allIgPosts.map(p => ({ caption: p.caption || '', eng: engagementIg(p) }))
        ]
            .sort((a, b) => b.eng - a.eng)
            .slice(0, 30)
            .filter(p => p.caption.trim())

        if (rankedPosts.length > 0) {
            try {
                const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
                const completion = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'Return JSON {historical_voice: string, top_themes: string[5]} extracting the actual tone and recurring topics from these captions.'
                        },
                        {
                            role: 'user',
                            content: rankedPosts.map((p, i) => `${i + 1}. ${p.caption}`).join('\n\n')
                        }
                    ],
                    response_format: { type: 'json_object' },
                    temperature: 0.2
                })
                const result = JSON.parse(completion.choices[0].message.content || '{}')
                historicalVoice = result.historical_voice || null
                topThemes = result.top_themes || []
            } catch (e) {
                console.error('GPT theme extraction failed:', e)
            }
        }

        // ── Upsert into client_intelligence ──
        const { error: upsertError } = await supabase
            .from('client_intelligence')
            .upsert({
                workspace_id: resolvedId,
                historical_voice: historicalVoice,
                top_performing_themes: topThemes,
                posting_cadence_observed: {
                    facebook: fbCadence,
                    instagram: igCadence
                },
                best_performing_hours: {
                    facebook: fbHours,
                    instagram: igHours
                },
                last_scanned_at: new Date().toISOString()
            }, { onConflict: 'workspace_id' })

        if (upsertError) {
            console.error('Upsert error:', upsertError)
            return NextResponse.json({ ok: false, reason: upsertError.message })
        }

        return NextResponse.json({
            ok: true,
            summary: {
                facebook_posts_analysed: allFbPosts.length,
                instagram_posts_analysed: allIgPosts.length,
                cadence: { facebook: fbCadence, instagram: igCadence },
                best_hours: { facebook: fbHours, instagram: igHours },
                voice_detected: !!historicalVoice
            }
        })
    } catch (error: any) {
        console.error('Social history analysis error:', error)
        return NextResponse.json({ ok: false, reason: error.message || 'Analysis failed' })
    }
}
