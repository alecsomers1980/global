import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  // /admin/reset must stay reachable pre-session: the recovery link's token (a `?code=` param
  // under @supabase/ssr's default PKCE flow) is exchanged for a session by client-side JS on
  // that page on load — this request arrives before that exchange, so no session cookie exists
  // for the middleware to check yet.
  const isExempt = request.nextUrl.pathname === '/admin/login' || request.nextUrl.pathname === '/admin/reset'
  const isAdmin = user?.app_metadata?.role === 'admin'

  if (isAdminRoute && !isExempt && !isAdmin) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  return response
}