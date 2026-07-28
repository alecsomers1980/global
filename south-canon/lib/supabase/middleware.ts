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
  // /admin/reset must stay reachable pre-session: Supabase's recovery link carries its token
  // in the URL fragment, which the server never sees, so the client-side JS on that page is
  // what actually establishes the session — the middleware can't check it on this request.
  const isExempt = request.nextUrl.pathname === '/admin/login' || request.nextUrl.pathname === '/admin/reset'
  const isAdmin = user?.app_metadata?.role === 'admin'

  if (isAdminRoute && !isExempt && !isAdmin) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  return response
}