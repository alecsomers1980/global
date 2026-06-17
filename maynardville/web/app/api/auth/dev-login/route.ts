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
    secure: false, // dev-login only runs in non-production (guarded above), so local http is fine
    maxAge: 60 * 60 * 12,
  });

  return res;
}