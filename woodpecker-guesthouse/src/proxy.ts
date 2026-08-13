import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { aalFromAccessToken, hasVerifiedFactor } from "@/lib/auth";

/** Next 16 renamed `middleware.ts` → `proxy.ts`. Refreshes the Supabase auth
 *  session on every matched request and gates the /admin (staff-only) area.
 *
 *  Guarded: this runs on nearly every request (see matcher below), so if no
 *  Supabase project is configured yet, it must not throw — that would 500 the
 *  entire public site, not just /admin. Confirmed by running it locally
 *  without env vars set: createServerClient() throws synchronously. */
export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const path = request.nextUrl.pathname;
  const isAdmin = path.startsWith("/admin");
  const isAdminLogin = path === "/admin/login";

  if (!supabaseUrl || !supabaseAnonKey) {
    // No Supabase project yet: let public pages through untouched, but still
    // send /admin/* to the login page instead of a raw crash or a 404 on a
    // route that can never authenticate anyone right now.
    if (isAdmin && !isAdminLogin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminVerify = path === "/admin/verify";

  const redirectTo = (pathname: string, withNext = false) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = "";
    if (withNext) url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  };

  let role: string | null = null;
  if (user && (isAdmin || isAdminLogin)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? null;
  }
  const isStaff = role === "admin" || role === "staff";

  if (isAdmin && !isAdminLogin) {
    if (!user) return redirectTo("/admin/login", true);
    if (!isStaff) return redirectTo("/");
  }
  if (isAdminLogin && user && isStaff) {
    return redirectTo("/admin");
  }

  // Optional 2FA: once a staff member has enrolled a TOTP factor, every admin
  // page (except the verify screen itself) requires a fresh aal2 session.
  if (isStaff && hasVerifiedFactor(user)) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const aal = aalFromAccessToken(session?.access_token);
    if (isAdmin && !isAdminLogin && !isAdminVerify && aal !== "aal2") {
      return redirectTo("/admin/verify");
    }
    if (isAdminVerify && aal === "aal2") {
      return redirectTo("/admin");
    }
  } else if (isAdminVerify && isStaff) {
    return redirectTo("/admin");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:mp4|png|jpg|jpeg|webp|svg|ico)$).*)"],
};