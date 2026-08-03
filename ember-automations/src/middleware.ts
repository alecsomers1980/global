import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { adminGate } from "@/lib/auth";

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
  const { data: { session } } = await supabase.auth.getSession();
  const gate = adminGate(user, session?.access_token, process.env.ADMIN_EMAIL);
  const path = req.nextUrl.pathname;

  // API routes answer in JSON; a half-authenticated caller is still unauthorized.
  if (path.startsWith("/api/admin")) {
    if (!gate.ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    return res;
  }

  if (!gate.ok) {
    // The enrolment page lives under /admin, so it must stay reachable while
    // the user is still enrolling — otherwise this redirect loops forever.
    if (gate.reason === "enrol_required" && path === "/admin/security") return res;

    const to =
      gate.reason === "mfa_required" ? "/login/mfa"
      : gate.reason === "enrol_required" ? "/admin/security"
      : "/login";
    return NextResponse.redirect(new URL(to, req.url));
  }

  return res;
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
