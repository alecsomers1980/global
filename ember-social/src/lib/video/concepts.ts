// The 6-entry lifestyle-video concept bank documented in the July 2026 Everest
// plan (docs/superpowers/specs/2026-07-29-monthly-content-variety-design.md,
// originally everest-july-2026-content-plan.md §4). vehicleKeywords is matched
// case-insensitively against a vehicle's make/model to find a fitting car from
// live inventory each month.

import type { SupabaseClient } from '@supabase/supabase-js'

export interface VideoConcept {
    id: string
    title: string
    vehicleKeywords: string[]
    brief: string
}

export const VIDEO_CONCEPTS: VideoConcept[] = [
    {
        id: 'born_for_the_bundu',
        title: 'Born for the Bundu',
        vehicleKeywords: ['land cruiser', 'discovery', 'hilux', 'fortuner'],
        brief: 'Hardcore 4x4 adventure: a river crossing, a rocky mountain pass, dawn light breaking over the Kruger bushveld. Rugged, dusty, capable — the vehicle earns its keep off the tar.',
    },
    {
        id: 'first_car_first_freedom',
        title: 'First Car, First Freedom',
        vehicleKeywords: ['polo', 'swift', 'kiger', 'picanto', 'i10'],
        brief: 'Youthful independence: a young South African driver gets their first set of keys, city lights of Mbombela at dusk, the freedom of driving somewhere alone for the first time.',
    },
    {
        id: 'work_hard_play_harder',
        title: 'Work Hard, Play Harder',
        vehicleKeywords: ['hilux', 'np200', 'ranger', 'triton'],
        brief: 'A working bakkie through a weekday shift — loaded, dusty, capable — transitions into weekend escape: same vehicle, empty load bed, open road, golden hour.',
    },
    {
        id: 'date_night',
        title: 'Date Night',
        vehicleKeywords: ['grand vitara', 'tucson', 't-roc', 'crossover'],
        brief: 'Upmarket evening drive: a well-dressed couple, city or restaurant-district lights reflecting off the paintwork, an unhurried, romantic pace.',
    },
    {
        id: 'sunday_drive',
        title: 'Sunday Drive',
        vehicleKeywords: [], // deliberately open — picks whichever vehicle wasn't recently featured
        brief: 'A quiet, unhurried Sunday morning drive along a scenic backroad — no destination, just the drive itself. New route each time this concept is picked.',
    },
    {
        id: 'two_minute_tips',
        title: 'Two-Minute Tips',
        vehicleKeywords: [],
        brief: 'A quick, practical maintenance tip filmed at the dealership workshop — checking tyre tread, topping up washer fluid, a battery-terminal check. Helpful-expert tone, not a sales pitch.',
    },
]

const LOOKBACK_MONTHS = 6

export async function pickVideoConcepts(supabase: SupabaseClient, workspaceId: string, count: number): Promise<VideoConcept[]> {
    const cutoff = new Date()
    cutoff.setUTCMonth(cutoff.getUTCMonth() - LOOKBACK_MONTHS)

    const { data, error } = await supabase
        .from('posts')
        .select('video_concept, scheduled_at')
        .eq('workspace_id', workspaceId)
        .not('video_concept', 'is', null)
        .gte('scheduled_at', cutoff.toISOString())

    const lastUsed = new Map<string, number>()
    for (const c of VIDEO_CONCEPTS) lastUsed.set(c.id, 0)
    if (!error) {
        for (const row of (data ?? []) as any[]) {
            const t = new Date(row.scheduled_at).getTime()
            if (t > (lastUsed.get(row.video_concept) ?? 0)) lastUsed.set(row.video_concept, t)
        }
    } else {
        console.error('[concepts] history query failed, falling back to bank order:', error.message)
    }

    const ranked = [...VIDEO_CONCEPTS].sort((a, b) => (lastUsed.get(a.id) ?? 0) - (lastUsed.get(b.id) ?? 0))
    return ranked.slice(0, count)
}
