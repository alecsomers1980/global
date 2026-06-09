import type { SupabaseClient } from '@supabase/supabase-js'

export function isSunday(date: Date): boolean {
    return date.getUTCDay() === 0
}

// 6-posts-per-week cadence (Mon–Sat). Sundays excluded.
export const ALL_WEEKDAYS = [1, 2, 3, 4, 5, 6]

// Engagement-optimised publish times per weekday (UTC hours = SAST-2).
// Thursday 11:00 UTC (13:00 SAST) is the lunchtime peak.
export const TIME_BY_WEEKDAY: Record<number, { hour: number; minute: number }> = {
    1: { hour: 7,  minute: 0 },  // Monday    09:00 SAST
    2: { hour: 9,  minute: 0 },  // Tuesday   11:00 SAST
    3: { hour: 11, minute: 0 },  // Wednesday 13:00 SAST
    4: { hour: 11, minute: 0 },  // Thursday  13:00 SAST
    5: { hour: 13, minute: 0 },  // Friday    15:00 SAST
    6: { hour: 8,  minute: 0 },  // Saturday  10:00 SAST
}

export const SCHEDULE_PATTERN_KEY = 'all_weekdays'

export function weekdaysForPattern(pattern: string | null | undefined): number[] {
    return [...ALL_WEEKDAYS]
}

export function nextSchedulePattern(previousPattern: string | null | undefined): string {
    return SCHEDULE_PATTERN_KEY
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
        timeByWeekday?: Record<number, { hour: number; minute: number }>
        allowedWeekdays?: number[] // 0=Sun..6=Sat. Default Mon-Sat ([1..6]).
    }
): Promise<Date> {
    const now = new Date()
    const startFrom = opts?.startFrom || now
    const allowed = (opts?.allowedWeekdays && opts.allowedWeekdays.length > 0)
        ? opts.allowedWeekdays
        : [1, 2, 3, 4, 5, 6]
    const timeByWeekday = opts?.timeByWeekday

    for (let dayOffset = 0; dayOffset < 90; dayOffset++) {
        const checkDate = new Date(startFrom)
        checkDate.setUTCDate(checkDate.getUTCDate() + dayOffset)

        if (!allowed.includes(checkDate.getUTCDay())) continue

        const time = timeByWeekday
            ? timeByWeekday[checkDate.getUTCDay()]
            : opts?.timeOfDay

        if (time) {
            checkDate.setUTCHours(time.hour, time.minute, 0, 0)
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
    const time = timeByWeekday
        ? timeByWeekday[fallback.getUTCDay()]
        : opts?.timeOfDay
    if (time) {
        fallback.setUTCHours(time.hour, time.minute, 0, 0)
    }
    return fallback
}
