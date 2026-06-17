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