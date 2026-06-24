import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Routes reachable without a logged-in session: public marketing/legal pages,
// client-facing token-gated views, and endpoints that have their own auth
// scheme (Vercel cron secret, workspace API keys, health checks).
const PUBLIC_EXACT = ['/', '/login', '/reset-password', '/terms', '/privacy', '/api/health']
const PUBLIC_PREFIXES = ['/approve', '/plan', '/auth', '/api/cron', '/api/trigger', '/api/report']

function isPublicPath(pathname: string): boolean {
    if (PUBLIC_EXACT.includes(pathname)) return true
    return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export default async function middleware(request: NextRequest) {
    if (isPublicPath(request.nextUrl.pathname)) {
        return NextResponse.next({ request })
    }

    let response = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        return response
    }

    if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|txt)$).*)'],
}
