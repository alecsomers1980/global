import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  const isPortalPublic = pathname === '/portal/login' || pathname === '/portal/register';
  const isPortalRoute = pathname.startsWith('/portal');

  if (!isPortalRoute || isPortalPublic) return res;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll().map(c => ({ name: c.name, value: c.value })), setAll: (cookies) => { cookies.forEach(({ name, value, options }) => { res.cookies.set(name, value, options); }); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/portal/login', request.url));

  const isAdminRoute = pathname.startsWith('/portal/admin');
  if (isAdminRoute && !user.email?.endsWith('@aloesigns.co.za')) {
    return NextResponse.redirect(new URL('/portal/', request.url));
  }

  return res;
}

export const config = { matcher: ['/portal/:path*'] };
