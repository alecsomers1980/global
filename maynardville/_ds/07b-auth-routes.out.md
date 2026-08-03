===FILE: lib/session.ts===
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readSessionToken } from "@/lib/auth-tokens";
import type { StaffSession } from "@/lib/types";

export function getStaffSession(): StaffSession | null {
  const sessionCookie = cookies().get("mv_session")?.value;
  if (!sessionCookie) return null;
  return readSessionToken(sessionCookie);
}

export function requireStaff(allowedRoles?: string[]): StaffSession {
  const session = getStaffSession();
  if (!session) redirect("/staff-login");
  if (allowedRoles && !allowedRoles.includes(session.role)) redirect("/dashboard");
  return session;
}

export function getStaffFromRequest(req: Request): StaffSession | null {
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("mv_session="));
  if (!match) return null;
  const value = match.substring("mv_session=".length);
  const decoded = decodeURIComponent(value);
  return readSessionToken(decoded);
}
===END===
===FILE: app/api/auth/request-link/route.ts===
import { NextResponse } from "next/server";
import { createMagicToken } from "@/lib/auth-tokens";
import { getUserByEmail } from "@/lib/users";
import { sendMail } from "@/lib/email";
import type { StaffSession } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const email = formData.get("email")?.toString();
    if (email) {
      const user = await getUserByEmail(email);
      if (user) {
        const token = createMagicToken(email);
        const baseUrl = process.env.APP_BASE_URL || new URL(req.url).origin;
        const link = `${baseUrl}/api/auth/callback?token=${encodeURIComponent(token)}`;
        await sendMail({
          to: email,
          subject: "Your Maynardville sign-in link",
          html: `<p>Click <a href="${link}">here</a> to sign in. This link expires in 15 minutes.</p>`,
        });
      }
    }
  } catch (error) {
    console.error("Error processing magic link request:", error);
  }

  const redirectUrl = new URL("/staff-login?sent=1", process.env.APP_BASE_URL || new URL(req.url).origin);
  return NextResponse.redirect(redirectUrl, 303);
}
===END===
===FILE: app/api/auth/callback/route.ts===
import { NextResponse } from "next/server";
import { readMagicToken, createSessionToken } from "@/lib/auth-tokens";
import { getUserByEmail } from "@/lib/users";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/staff-login?error=expired", process.env.APP_BASE_URL || req.url));
  }

  const payload = readMagicToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/staff-login?error=expired", process.env.APP_BASE_URL || req.url));
  }

  const user = await getUserByEmail(payload.email);
  if (!user) {
    return NextResponse.redirect(new URL("/staff-login?error=denied", process.env.APP_BASE_URL || req.url));
  }

  const sessionToken = createSessionToken(user);
  const res = NextResponse.redirect(new URL("/dashboard", process.env.APP_BASE_URL || req.url));

  res.cookies.set("mv_session", sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
  });

  return res;
}
===END===
===FILE: app/api/auth/logout/route.ts===
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const redirectUrl = new URL("/staff-login", process.env.APP_BASE_URL || req.url);
  const res = NextResponse.redirect(redirectUrl);

  res.cookies.set("mv_session", "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });

  return res;
}
===END===
===FILE: app/api/auth/dev-login/route.ts===
import { NextResponse } from "next/server";
import { createSessionToken } from "@/lib/auth-tokens";
import type { StaffSession } from "@/lib/types";

// This is a temporary local-testing shortcut
export async function GET(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.redirect(new URL("/staff-login", req.url));
  }

  const url = new URL(req.url);
  const name = url.searchParams.get("name") || "Dev User";
  const role = url.searchParams.get("role") || "Box Office";

  const staff: StaffSession = {
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    role,
  };

  const sessionToken = createSessionToken(staff);
  const res = NextResponse.redirect(new URL("/dashboard", url.origin));

  res.cookies.set("mv_session", sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
  });

  return res;
}
===END===
===FILE: app/staff-login/page.tsx===
export default function StaffLoginPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const sent = searchParams.sent;
  const error = searchParams.error;
  const isDev = process.env.NODE_ENV !== "production";

  return (
    <div className="min-h-screen flex items-center justify-center bg-mv-navy font-body">
      <div className="w-full max-w-md px-6 py-12 rounded-[3px] bg-mv-navy border border-mv-blue/30 shadow-2xl">
        <h1 className="text-3xl font-heading text-mv-cream mb-8 text-center">
          Staff Sign-in
        </h1>

        {sent && (
          <div className="mb-6 rounded-[3px] bg-mv-mint/20 p-4 text-mv-cream">
            Check your email for a sign-in link (valid 15 minutes).
          </div>
        )}

        {error === "expired" && (
          <div className="mb-6 rounded-[3px] bg-red-100/20 p-4 text-mv-cream">
            That link has expired, please request a new one.
          </div>
        )}

        {error === "denied" && (
          <div className="mb-6 rounded-[3px] bg-red-100/20 p-4 text-mv-cream">
            That email isn’t authorised. Contact the festival office.
          </div>
        )}

        <form action="/api/auth/request-link" method="post" className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-mv-cream mb-1">
              Email address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="w-full rounded-[3px] border border-mv-blue/50 bg-white/10 px-3 py-2 text-mv-cream placeholder-mv-cream/50 focus:border-mv-mint focus:outline-none focus:ring-1 focus:ring-mv-mint"
              placeholder="you@maynardville.org"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-[3px] bg-mv-blue px-4 py-2 font-semibold text-white hover:bg-mv-blue/90 transition-colors"
          >
            Email me a sign-in link
          </button>
        </form>

        <hr className="my-8 border-t border-mv-blue/40" />

        {isDev && (
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wider text-mv-cream/60 mb-3">
              Dev quick-login
            </p>
            <div className="space-y-2">
              <a
                href="/api/auth/dev-login?role=Admin&name=Jaco"
                className="block rounded-[3px] border border-mv-mint/40 px-3 py-2 text-sm text-mv-cream hover:bg-mv-mint/10"
              >
                Continue as Jaco — Admin
              </a>
              <a
                href="/api/auth/dev-login?role=Box%20Office&name=Jeff"
                className="block rounded-[3px] border border-mv-mint/40 px-3 py-2 text-sm text-mv-cream hover:bg-mv-mint/10"
              >
                Continue as Jeff — Box Office
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
===END===