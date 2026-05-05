import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 300;

function admin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

function authorized(req: Request): boolean {
    // Vercel cron jobs send this header automatically
    const ua = req.headers.get('user-agent') || ''
    if (ua.includes('Vercel-Cron')) return true

    const secret = process.env.CRON_SECRET
    if (!secret) return process.env.NODE_ENV !== 'production'
    const auth = req.headers.get('authorization') || ''
    return auth === `Bearer ${secret}`
}

export async function GET(req: Request) {
    if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const supabase = admin()

        // Pick workspaces that have news enabled (have client supabase creds set)
        const { data: workspaces } = await supabase
            .from('workspaces')
            .select('id, name')
            .not('client_supabase_url', 'is', null)
            .not('client_supabase_service_key', 'is', null)

        const list: any[] = workspaces || []
        const results: any[] = []

        const base = new URL(req.url)
        const origin = `${base.protocol}//${base.host}`

        for (const ws of list) {
            try {
                // 1. Generate draft
                const res = await fetch(`${origin}/api/workspaces/news`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ workspaceId: ws.id }),
                })
                const genJson = await res.json()
                if (!genJson?.id) {
                    results.push({ workspace: ws.name, error: genJson?.error || 'generate failed' })
                    continue
                }

                // 2. Auto-publish (approves + pushes to client site)
                const pubRes = await fetch(`${origin}/api/workspaces/news/${genJson.id}/publish`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'publish' }),
                })
                const pubJson = await pubRes.json()
                results.push({ workspace: ws.name, articleId: genJson.id, published: pubJson?.success })
            } catch (e: any) {
                results.push({ workspace: ws.name, error: e.message })
            }
        }

        const failures = results.filter((r) => r.error)
        if (failures.length > 0 && (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN)) {
            try {
                const Sentry = await import('@sentry/nextjs')
                Sentry.captureMessage(
                    `news-monthly cron had ${failures.length}/${list.length} failures`,
                    {
                        level: 'error',
                        tags: { cron: 'news-monthly' },
                        extra: { failures },
                    }
                )
            } catch { /* sentry not installed */ }
        }

        return NextResponse.json({ success: true, processed: list.length, results })
    } catch (error: any) {
        if (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) {
            try {
                const Sentry = await import('@sentry/nextjs')
                Sentry.captureException(error, { tags: { cron: 'news-monthly' } })
            } catch { /* sentry not installed */ }
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
