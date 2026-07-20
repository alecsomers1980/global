import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (c) => c.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = !!user && user.email === process.env.ADMIN_EMAIL;
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
