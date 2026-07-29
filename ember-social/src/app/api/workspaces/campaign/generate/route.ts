import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/client'
import { resolveWorkspaceId } from '@/lib/resolve-workspace'
import { fetchVehiclesForWorkspace } from '@/lib/inventory/fetchVehicles'
import { uploadCampaignImage } from '@/lib/media/uploadToStorage'
import { renderShowcase, renderLifestyle, renderMaintenance, renderSeasonal, renderFinance, renderComparison, renderSeasonalLocal } from '@/lib/templates'
import type { VehicleInput, HeadlineSpec } from '@/lib/templates'
import { pickRotationSeats } from '@/lib/rotation/pillarHistory'
import { generateFreshHeadlines } from '@/lib/templates/headlineGenerator'
import { pickVideoConcepts } from '@/lib/video/concepts'
import crypto from 'crypto'

const DOW: Record<string, number> = { mon: 1, wed: 3, fri: 5, sat: 6 }
const SAST_UTC: Record<string, number> = { mon: 7, wed: 10, fri: 9, sat: 8 }

// Season for a given 0-indexed month (0=Jan) in the South African calendar.
function seasonForMonth(m: number): string {
    if (m >= 10 || m <= 1) return 'festive_summer'
    if (m >= 2 && m <= 4) return 'autumn'
    if (m >= 5 && m <= 7) return 'winter'
    return 'spring'
}

function computeWeekday(monthStart: Date, weekOffset: number, dayName: string): Date {
    const targetDow = DOW[dayName]
    const hour = SAST_UTC[dayName] || 9
    const d = new Date(monthStart)
    // Start from day 1 of next month
    d.setUTCDate(1)
    // Advance to first occurrence of target weekday
    while (d.getUTCDay() !== targetDow) d.setUTCDate(d.getUTCDate() + 1)
    // Add week offset
    d.setUTCDate(d.getUTCDate() + weekOffset * 7)
    d.setUTCHours(hour, 0, 0, 0)
    return d
}

interface PillarDef {
    name: string
    dayName: string
    render: (car: VehicleInput, opts?: { targetDate?: Date; variantIndex?: number; headline?: HeadlineSpec | null; season?: string }) => Promise<{ image: Buffer; caption: string; hashtags: string[]; scheduledAt: Date; ctaUrl?: string }>
    needsCar: boolean
}

const PILLARS: PillarDef[] = [
    { name: 'showcase',    dayName: 'mon', render: renderShowcase as any,    needsCar: true },
    { name: 'lifestyle',   dayName: 'wed', render: renderLifestyle as any,   needsCar: true },
    { name: 'maintenance', dayName: 'fri', render: renderMaintenance as any, needsCar: false },
    { name: 'seasonal',    dayName: 'sat', render: renderSeasonal as any,    needsCar: true },
]

const ROTATION_RENDERERS: Record<string, (car: VehicleInput, opts?: any) => Promise<any>> = {
    finance: renderFinance as any,
    comparison: renderComparison as any, // called specially below — needs 2 cars
    seasonal_local: renderSeasonalLocal as any,
}

export async function POST(req: Request) {
    try {
        const { workspaceId, days = 28, month } = await req.json()
        if (!workspaceId) {
            return NextResponse.json({ error: 'workspaceId required' }, { status: 400 })
        }

        const resolvedId = await resolveWorkspaceId(workspaceId)
        const supabase = createAdminClient()

        // Fetch workspace with all needed columns
        const { data: workspace } = await supabase
            .from('workspaces')
            .select('*')
            .eq('id', resolvedId)
            .single()

        if (!workspace) {
            return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
        }

        const ws = workspace as any
        const weeks = Math.round(days / 7)

        // Fetch the FULL inventory (no recency filter) so we can spread distinct
        // cars across the batch. With ~13 cars and 12 car-posts we want each car
        // used at most once or twice — not the same handful repeated.
        const vehicles = await fetchVehiclesForWorkspace({
            clientSupabaseUrl: ws.client_supabase_url,
            clientServiceKey: ws.client_supabase_service_key,
            table: (ws.content_source as any)?.table || 'cars',
            fields: (ws.content_source as any)?.fields || 'id,make,model,year,price,mileage,transmission,fuel_type,colour,main_image_url',
            filter: (ws.content_source as any)?.filter || {},
            limit: 60,
            notSharedWithinDays: 0,
        })

        if (!vehicles.length) {
            return NextResponse.json({ error: 'No vehicles in inventory' }, { status: 400 })
        }

        // Shuffle so different cars are featured each month (Fisher-Yates).
        for (let i = vehicles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[vehicles[i], vehicles[j]] = [vehicles[j], vehicles[i]]
        }

        // Create campaign batch
        const publicToken = crypto.randomUUID()
        const batchId = crypto.randomUUID()

        const { error: batchError } = await supabase
            .from('campaign_batches')
            .insert({
                id: batchId,
                workspace_id: resolvedId,
                public_token: publicToken,
                duration_days: days,
                schedule_pattern: 'mon_wed_fri_sat',
                strategy_rationale: '4-pillar weekly rotation: Showcase (Mon), Lifestyle (Wed), Maintenance (Fri), Seasonal (Sat). Posting at SA-audience peak engagement times.',
            } as any)

        if (batchError) {
            console.error('[campaign/generate] batch insert failed:', batchError)
            return NextResponse.json({ error: 'Failed to create batch' }, { status: 500 })
        }

        // Schedule into the chosen month ("YYYY-MM"), or default to next month.
        let monthStart: Date
        if (typeof month === 'string' && /^\d{4}-\d{2}$/.test(month)) {
            const [y, mo] = month.split('-').map(Number)
            monthStart = new Date(Date.UTC(y, mo - 1, 1, 0, 0, 0, 0))
        } else {
            const now = new Date()
            monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0))
        }
        const planSeason = seasonForMonth(monthStart.getUTCMonth())

        // Generate FRESH text overlays for this batch so headlines + tips never
        // repeat month-to-month. Returns null on failure → templates use their
        // curated pools as a fallback (batch still succeeds).
        const fresh = await generateFreshHeadlines({ count: weeks, season: planSeason })

        const [seatA, seatB] = await pickRotationSeats(supabase, resolvedId)

        const tasks: Array<Promise<void>> = []
        const errors: string[] = []
        let vehicleIdx = 0
        let inserted = 0

        for (let week = 0; week < weeks; week++) {
            for (const pillar of PILLARS) {
                const isSeatA = week === 1 && pillar.name === 'seasonal'
                const isSeatB = week === 3 && pillar.name === 'lifestyle'
                const seatPillarName = isSeatA ? seatA : isSeatB ? seatB : null

                const car = vehicles[vehicleIdx % vehicles.length]
                if (pillar.needsCar) vehicleIdx++

                const headline = fresh && !seatPillarName
                    ? (fresh as any)[pillar.name]?.[week] ?? null
                    : null

                tasks.push((async () => {
                    try {
                        const targetDate = computeWeekday(monthStart, week, pillar.dayName)
                        const effectivePillarName = seatPillarName || pillar.name

                        let result: { image: Buffer; caption: string; hashtags: string[]; scheduledAt: Date; ctaUrl?: string }
                        if (seatPillarName === 'comparison') {
                            const carB = vehicles[vehicleIdx % vehicles.length]
                            vehicleIdx++
                            result = await renderComparison(car as VehicleInput, carB as VehicleInput, 'Family', 'Fun', { targetDate, variantIndex: week })
                        } else if (seatPillarName) {
                            result = await ROTATION_RENDERERS[seatPillarName](car as VehicleInput, { targetDate, variantIndex: week })
                        } else {
                            result = await pillar.render(car as VehicleInput, { targetDate, variantIndex: week, headline, season: planSeason })
                        }

                        const postId = crypto.randomUUID()
                        let mediaUrl: string | null = null

                        const up = await uploadCampaignImage({
                            workspaceId: resolvedId,
                            postId,
                            bytes: result.image,
                        })
                        if (up.ok) mediaUrl = up.publicUrl

                        const approvalToken = crypto.randomUUID()

                        const { error: insertError } = await supabase
                            .from('posts')
                            .insert({
                                id: postId,
                                workspace_id: resolvedId,
                                campaign_batch_id: batchId,
                                pillar: effectivePillarName,
                                vehicle_id: pillar.needsCar ? (car as any)?.id || null : null,
                                content: result.caption,
                                variants: { facebook: { content: result.caption, hashtags: result.hashtags } },
                                platforms: ['facebook'],
                                media_urls: mediaUrl ? [mediaUrl] : null,
                                scheduled_at: result.scheduledAt.toISOString(),
                                status: 'pending_approval',
                                client_status: 'pending',
                                approval_token: approvalToken,
                                cta_url: result.ctaUrl || null,
                                image_status: mediaUrl ? 'ready' : 'failed',
                            } as any)

                        if (insertError) {
                            errors.push(`${effectivePillarName} week ${week + 1}: ${insertError.message}`)
                        } else {
                            inserted++
                        }
                    } catch (e: any) {
                        errors.push(`${pillar.name} week ${week + 1}: ${e?.message || e}`)
                    }
                })())
            }
        }

        await Promise.all(tasks)

        // 3 video jobs, concepts picked by least-recently-used so they don't
        // repeat what recent months already ran. Actual rendering happens
        // asynchronously via /api/cron/generate-videos — this just reserves
        // the slots and stores the brief.
        const videoConcepts = await pickVideoConcepts(supabase, resolvedId, 3)
        const videoWeeks = [0, 1, 2].filter(w => w < weeks) // one per week 1/2/3, skip if the batch is shorter than 3 weeks

        for (let i = 0; i < videoConcepts.length && i < videoWeeks.length; i++) {
            const concept = videoConcepts[i]
            const car = vehicles.find(v =>
                concept.vehicleKeywords.length === 0 ||
                concept.vehicleKeywords.some(kw => `${v.make} ${v.model}`.toLowerCase().includes(kw))
            ) || vehicles[i % vehicles.length]

            const videoPrompt = `${concept.brief} Hero vehicle: a ${(car as any).colour || ''} ${(car as any).year} ${(car as any).make} ${(car as any).model} — keep its exact colour and shape throughout. South Africa: driving is on the LEFT-hand side of the road, right-hand-drive vehicle. Photorealistic, cinematic, no text, no logos, blank number plates.`

            const targetDate = computeWeekday(monthStart, videoWeeks[i], 'mon')
            const postId = crypto.randomUUID()
            const approvalToken = crypto.randomUUID()

            const { error: videoInsertError } = await supabase
                .from('posts')
                .insert({
                    id: postId,
                    workspace_id: resolvedId,
                    campaign_batch_id: batchId,
                    pillar: 'video',
                    vehicle_id: (car as any)?.id || null,
                    content: `${concept.title} — video generating`,
                    variants: {},
                    platforms: ['facebook'],
                    media_urls: null,
                    scheduled_at: targetDate.toISOString(),
                    status: 'pending_approval',
                    client_status: 'pending',
                    approval_token: approvalToken,
                    video_status: 'pending',
                    video_concept: concept.id,
                    video_prompt: videoPrompt,
                } as any)

            if (videoInsertError) {
                errors.push(`video ${concept.id}: ${videoInsertError.message}`)
            } else {
                inserted++
            }
        }

        return NextResponse.json({
            ok: true,
            batchId,
            public_token: publicToken,
            count: inserted,
            strategy_rationale: `4-pillar weekly rotation — ${weeks} weeks of Showcase (Mon), Lifestyle (Wed), Maintenance (Fri), Seasonal (Sat) at peak SA engagement times.`,
            pillars: ['Showcase', 'Lifestyle', 'Maintenance', 'Seasonal'],
            totalExpected: weeks * PILLARS.length,
            errors: errors.length > 0 ? errors : undefined,
        })
    } catch (error: any) {
        console.error('Campaign generate error:', error)
        return NextResponse.json({ ok: false, error: error.message || 'Generation failed' })
    }
}
