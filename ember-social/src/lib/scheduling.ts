import type { SupabaseClient } from '@supabase/supabase-js'

export function isSunday(date: Date): boolean {
    return date.getUTCDay() === 0
}

// A/B schedule patterns — we alternate per campaign batch so we can compare
// engagement between Tue/Thu/Sat and Mon/Wed/Fri cadences.
export const SCHEDULE_PATTERNS = {
    tue_thu_sat: [2, 4, 6],    // Tue, Thu, Sat (UTC day numbers; Sun=0)
    mon_wed_fri: [1, 3, 5],
} as const

export type SchedulePatternKey = keyof typeof SCHEDULE_PATTERNS

export function weekdaysForPattern(pattern: SchedulePatternKey | string | null | undefined): number[] {
    if (pattern && pattern in SCHEDULE_PATTERNS) {
        return [...SCHEDULE_PATTERNS[pattern as SchedulePatternKey]]
    }
    return [1, 2, 3, 4, 5, 6] // Mon-Sat default
}

// Alternates from the workspace's most recent batch pattern. Defaults to
// 'tue_thu_sat' if nothing has run before.
export function nextSchedulePattern(previousPattern: string | null | undefined): SchedulePatternKey {
    return previousPattern === 'tue_thu_sat' ? 'mon_wed_fri' : 'tue_thu_sat'
}

// SAST is UTC+2 year-round. The publish window 09:00–17:00 SAST maps to 07:00–15:00 UTC.
export const SAST_WINDOW_UTC = { minHour: 7, maxHour: 15 } as const

export function clampHourToSastWindow(hour: number | null | undefined): number {
    const h = typeof hour === 'number' && Number.isFinite(hour) ? hour : 9
    if (h < SAST_WINDOW_UTC.minHour) return SAST_WINDOW_UTC.minHour
    if (h > SAST_WINDOW_UTC.maxHour) return SAST_WINDOW_UTC.maxHour
    return h
}

// First day of the next calendar month at 00:00 UTC.
export function firstOfNextMonthUtc(from: Date = new Date()): Date {
    const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 1, 0, 0, 0, 0))
    return d
}

/**
 * Finds the next date that has no posts already scheduled for that workspace.
 * Skips Sundays. Applies timeOfDay to the returned Date so the caller gets the
 * exact scheduled_at they asked for (the trigger flow's vehicle path applies
 * its own time formatting and doesn't use this helper).
 */
export async function getNextAvailableDate(
    supabase: SupabaseClient,
    workspaceId: string,
    opts?: {
        startFrom?: Date
        timeOfDay?: { hour: number; minute: number }
        allowedWeekdays?: number[] // 0=Sun..6=Sat. Default Mon-Sat ([1..6]).
    }
): Promise<Date> {
    const now = new Date()
    const startFrom = opts?.startFrom || now
    const allowed = (opts?.allowedWeekdays && opts.allowedWeekdays.length > 0)
        ? opts.allowedWeekdays
        : [1, 2, 3, 4, 5, 6]

    for (let dayOffset = 0; dayOffset < 90; dayOffset++) {
        const checkDate = new Date(startFrom)
        checkDate.setUTCDate(checkDate.getUTCDate() + dayOffset)

        if (!allowed.includes(checkDate.getUTCDay())) continue

        if (opts?.timeOfDay) {
            checkDate.setUTCHours(opts.timeOfDay.hour, opts.timeOfDay.minute, 0, 0)
            // Skip past slots so cron never fires retroactively.
            if (checkDate.getTime() <= now.getTime()) continue
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

    const fallback = new Date(startFrom)
    fallback.setUTCDate(fallback.getUTCDate() + 90)
    while (!allowed.includes(fallback.getUTCDay())) {
        fallback.setUTCDate(fallback.getUTCDate() + 1)
    }
    if (opts?.timeOfDay) {
        fallback.setUTCHours(opts.timeOfDay.hour, opts.timeOfDay.minute, 0, 0)
    }
    return fallback
}
