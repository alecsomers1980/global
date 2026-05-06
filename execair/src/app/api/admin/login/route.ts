import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { password, rememberMe } = await request.json();

  const validPassword = process.env.ADMIN_PASSWORD || "12345678";

  if (password !== validPassword) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days or 24 hours

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin-session", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  return response;
}
