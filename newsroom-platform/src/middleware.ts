import { NextResponse, type NextRequest } from 'next/server';
import { resolveSiteByHost } from './sites/registry';

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|placeholder-news.jpg|sites).*)'],
};

export function middleware(request: NextRequest) {
  const site = resolveSiteByHost(request.headers.get('host'));

  if (!site) {
    return new NextResponse('Unknown site', { status: 404 });
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${site.id}${url.pathname}`;
  return NextResponse.rewrite(url);
}