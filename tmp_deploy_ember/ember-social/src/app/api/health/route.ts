import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
    const started = Date.now()
    const checks: Record<string, { ok: boolean; error?: string }> = {}
    let ok = true

    const envOk = Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    checks.env = { ok: envOk }
    if (!envOk) ok = false

    try {
        if (envOk) {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            )
            const { error } = await supabase.from('workspaces').select('id', { head: true, count: 'exact' }).limit(1)
            checks.supabase = error ? { ok: false, error: error.message } : { ok: true }
            if (error) ok = false
        } else {
            checks.supabase = { ok: false, error: 'env missing' }
        }
    } catch (e: any) {
        checks.supabase = { ok: false, error: e.message }
        ok = false
    }

    return NextResponse.json(
        {
            ok,
            service: 'ember-social',
            commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local',
            region: process.env.VERCEL_REGION || 'local',
            uptime_ms: Math.round(process.uptime() * 1000),
            latency_ms: Date.now() - started,
            checks,
        },
        { status: ok ? 200 : 503 }
    )
}
