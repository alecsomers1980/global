import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * While the catalogue is still being built, the public site is gated: every public route
 * renders the coming-soon page instead. Visiting /preview sets a cookie that unlocks the
 * real site for that browser, so the client can walk through work in progress.
 *
 * This is a soft gate, not a security boundary — anyone who knows the /preview URL gets in.
 * Admin remains behind its own Supabase auth, which is the real boundary.
 */
const PREVIEW_COOKIE = 'sc-preview'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin has its own auth and must stay reachable while the site is gated.
  if (pathname.startsWith('/admin')) {
    return updateSession(request)
  }

  // /preview unlocks the real site; /preview/off re-locks it (so the gate can be re-tested).
  if (pathname === '/preview' || pathname === '/preview/off') {
    const response = NextResponse.redirect(new URL('/', request.url))
    if (pathname === '/preview/off') {
      response.cookies.delete(PREVIEW_COOKIE)
    } else {
      response.cookies.set(PREVIEW_COOKIE, '1', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      })
    }
    return response
  }

  const hasPreview = request.cookies.get(PREVIEW_COOKIE)?.value === '1'
  if (!hasPreview && pathname !== '/coming-soon') {
    // Rewrite, not redirect: the visitor stays on the URL they asked for and simply sees the
    // holding page, so no real URLs leak into browser history or get bookmarked mid-build.
    return NextResponse.rewrite(new URL('/coming-soon', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Everything except Next internals, the brand assets the holding page itself needs, and
     * the crawler files — robots.txt and sitemap.xml must keep serving their real content
     * rather than being rewritten to HTML.
     */
    '/((?!_next/static|_next/image|favicon.ico|brand/|robots.txt|sitemap.xml).*)',
  ],
}
