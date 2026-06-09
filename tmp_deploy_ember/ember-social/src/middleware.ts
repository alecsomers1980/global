import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Auth is disabled — all routes are publicly accessible.
export default function middleware(request: NextRequest) {
    return NextResponse.next({ request })
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|approve|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
