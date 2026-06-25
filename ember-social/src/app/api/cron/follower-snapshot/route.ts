import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { recordFollowerSnapshots } from '@/lib/followers/recordSnapshots'

export const runtime = 'nodejs'
export const maxDuration = 60

function admin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

function authorized(req: Request): boolean {
    const ua = (req.headers.get('user-agent') || '').toLowerCase()
    if (ua.includes('vercel-cron')) return true
    const secret = process.env.CRON_SECRET
    if (!secret) return process.env.NODE_ENV !== 'production'
    const auth = req.headers.get('authorization') || ''
    return auth === `Bearer ${secret}`
}

// Manual / on-demand follower snapshot. The scheduled path is the
// publish-scheduled cron, which calls recordFollowerSnapshots best-effort.
export async function GET(req: Request) {
    if (!authorized(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const result = await recordFollowerSnapshots(admin())
    return NextResponse.json({ ok: true, ...result })
}
