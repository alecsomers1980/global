import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail, SHORT_SESSION_COOKIE, SHORT_SESSION_SECONDS } from "@/lib/admin";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  // Honour an unticked "keep me signed in": without this, the refresh below rewrites
  // the auth cookie with the default 400-day lifetime.
  const shortSession = req.cookies.get(SHORT_SESSION_COOKIE)?.value === "1";
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (c) =>
          c.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, shortSession ? { ...options, maxAge: SHORT_SESSION_SECONDS } : options),
          ),
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = isAdminEmail(user?.email);
  const path = req.nextUrl.pathname;

  // API routes answer with JSON, pages redirect to the login screen.
  if (path.startsWith("/api/admin")) {
    if (!isAdmin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    return res;
  }

  if (path.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
