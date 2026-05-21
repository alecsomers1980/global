import type { SupabaseClient } from '@supabase/supabase-js'

export function isSunday(date: Date): boolean {
    return date.getUTCDay() === 0
}

/**
 * Finds the next date that has fewer than maxPostsPerDay posts already scheduled.
 * Skips Sundays. Respects an optional timeOfDay to skip today if the slot has passed.
 */
export async function getNextAvailableDate(
    supabase: SupabaseClient,
    workspaceId: string,
    opts?: { startFrom?: Date; timeOfDay?: { hour: number; minute: number } }
): Promise<Date> {
    const now = new Date()
    const startFrom = opts?.startFrom || now

    for (let dayOffset = 0; dayOffset < 60; dayOffset++) {
        const checkDate = new Date(startFrom)
        checkDate.setUTCDate(checkDate.getUTCDate() + dayOffset)

        if (isSunday(checkDate)) continue

        // Skip today if the preferred time has already passed
        if (dayOffset === 0 && opts?.timeOfDay) {
            const slot = new Date(checkDate)
            slot.setUTCHours(opts.timeOfDay.hour, opts.timeOfDay.minute, 0, 0)
            if (slot.getTime() <= now.getTime()) continue
        }

        const dateStr = checkDate.toISOString().split('T')[0]
        const { count } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('workspace_id', workspaceId)
            .gte('scheduled_at', `${dateStr}T00:00:00Z`)
            .lt('scheduled_at', `${dateStr}T23:59:59Z`)

        if ((count || 0) === 0) {
            return checkDate
        }
    }

    // Fallback 60 days out, skipping Sundays
    const fallback = new Date(startFrom)
    fallback.setUTCDate(fallback.getUTCDate() + 60)
    while (isSunday(fallback)) {
        fallback.setUTCDate(fallback.getUTCDate() + 1)
    }
    return fallback
}
