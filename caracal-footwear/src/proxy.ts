import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next 16 renamed `middleware.ts` -> `proxy.ts`. Refreshes the Supabase auth
 * session on every matched request and gates /admin and /api/admin.
 *
 * Caracal has one admin operator -- any authenticated user is staff. No
 * roles table, no 2FA: that's dianas-bulbinella's multi-staff machinery and
 * is out of scope here.
 *
 * This is not the only auth check: every /api/admin/* route also calls
 * requireAdminSession() itself (src/lib/adminAuth.ts). Next's own proxy
 * docs warn that a routing refactor can silently remove proxy coverage from
 * a route, so each Server Function/route handler must verify on its own
 * rather than trusting proxy alone.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdminArea = path.startsWith('/admin') || path.startsWith('/api/admin');
  const isAdminLogin = path === '/admin/login';

  if (isAdminArea && !isAdminLogin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = '';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }
  if (isAdminLogin && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|ico)$).*)'],
};
