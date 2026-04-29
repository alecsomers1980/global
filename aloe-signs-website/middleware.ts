import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  // Only protect admin routes — everything else is public
  const isAdminRoute = pathname.startsWith('/portal/admin');
  if (!isAdminRoute) return res;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll().map(c => ({ name: c.name, value: c.value })), setAll: (cookies) => { cookies.forEach(({ name, value, options }) => { res.cookies.set(name, value, options); }); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/portal/login', request.url));

  const userEmail = user.email || '';

  // Only allow staff emails to access admin
  if (userEmail === 'view@aloesigns.co.za') {
    return NextResponse.redirect(new URL('/portal/', request.url));
  }

  return res;
}

export const config = { matcher: ['/portal/admin/:path*'] };
