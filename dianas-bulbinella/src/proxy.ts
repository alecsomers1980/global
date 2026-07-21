import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { aalFromAccessToken, hasVerifiedFactor } from "@/lib/auth";

/** Next 16 renamed `middleware.ts` → `proxy.ts`. Refreshes the Supabase auth
 *  session on every matched request and gates the /admin (staff-only) and
 *  /account (any signed-in user) areas. */
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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdmin = path.startsWith("/admin");
  const isAdminLogin = path === "/admin/login";
  const isAdminVerify = path === "/admin/verify";
  const isAccount = path.startsWith("/account");

  const redirectTo = (pathname: string, withNext = false) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = "";
    if (withNext) url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  };

  // Resolve the caller's role only when it matters (admin area). The user's own
  // profile row is readable under the "read own profile" RLS policy.
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

  // /admin/* — staff/admin only.
  if (isAdmin && !isAdminLogin) {
    if (!user) return redirectTo("/admin/login", true);
    if (!isStaff) return redirectTo("/"); // logged-in customer → storefront
  }
  // Already-authenticated staff shouldn't sit on the admin login page.
  if (isAdminLogin && user && isStaff) {
    return redirectTo("/admin");
  }

  // Optional 2FA: once a staff member has enrolled a TOTP factor, every admin
  // page (except the verify screen itself) requires a fresh aal2 session. The
  // `aal` claim rides on the access token; user.factors comes from getUser().
  if (isStaff && hasVerifiedFactor(user)) {
    const { data: { session } } = await supabase.auth.getSession();
    const aal = aalFromAccessToken(session?.access_token);
    if (isAdmin && !isAdminLogin && !isAdminVerify && aal !== "aal2") {
      return redirectTo("/admin/verify");
    }
    // Nothing to verify (already aal2) — don't strand them on the verify page.
    if (isAdminVerify && aal === "aal2") {
      return redirectTo("/admin");
    }
  } else if (isAdminVerify && isStaff) {
    // Staff with no factor has nothing to verify.
    return redirectTo("/admin");
  }
  // /account/* — any signed-in user.
  if (isAccount && !user) {
    return redirectTo("/login", true);
  }

  return response;
}

export const config = {
  // run on everything except static assets & files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:mp4|png|jpg|jpeg|webp|svg|ico)$).*)"],
};
