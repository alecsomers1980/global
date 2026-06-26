import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const EXEMPT_ADMIN_PATHS = ['/admin/complete-profile', '/admin/update-password']

// Sections only admins may access; staff are redirected to the dashboard.
const ADMIN_ONLY_PREFIXES = ['/admin/insights', '/admin/statuses', '/admin/users']

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: { headers: request.headers },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options })
                    response = NextResponse.next({ request: { headers: request.headers } })
                    response.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options })
                    response = NextResponse.next({ request: { headers: request.headers } })
                    response.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // Admin route protection
    if (pathname.startsWith('/admin')) {
        // Not logged in → redirect to login
        if (!user) {
            const loginUrl = new URL('/login', request.url)
            return NextResponse.redirect(loginUrl)
        }

        // Exempt these paths from profile completion check
        if (!EXEMPT_ADMIN_PATHS.includes(pathname)) {
            // Check if profile is completed
            const { data: profile } = await supabase
                .from('profiles')
                .select('profile_completed, role')
                .eq('id', user.id)
                .single()

            if (profile && profile.profile_completed === false) {
                const completeUrl = new URL('/admin/complete-profile', request.url)
                return NextResponse.redirect(completeUrl)
            }

            // Admin-only sections: redirect non-admins to the dashboard
            const isAdminOnly = ADMIN_ONLY_PREFIXES.some(
                (p) => pathname === p || pathname.startsWith(p + '/')
            )
            if (isAdminOnly && profile?.role !== 'admin') {
                return NextResponse.redirect(new URL('/admin', request.url))
            }
        }
    }

    // Redirect logged-in users away from login page
    if (user && pathname === '/login') {
        const { data: profile } = await supabase
            .from('profiles')
            .select('profile_completed')
            .eq('id', user.id)
            .single()

        if (profile?.profile_completed === false) {
            return NextResponse.redirect(new URL('/admin/complete-profile', request.url))
        }
        return NextResponse.redirect(new URL('/admin', request.url))
    }

    return response
}

export const config = {
    matcher: ['/admin/:path*', '/login', '/api/:path*'],
}
