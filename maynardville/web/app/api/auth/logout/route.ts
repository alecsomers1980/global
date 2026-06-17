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