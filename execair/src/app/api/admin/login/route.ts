import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  const validPassword = process.env.ADMIN_PASSWORD;
  if (!validPassword || validPassword.length < 8) {
    return NextResponse.json(
      { error: "Server misconfigured: ADMIN_PASSWORD missing or too short" },
      { status: 500 }
    );
  }

  let payload: { password?: string; rememberMe?: boolean };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { password, rememberMe } = payload;
  if (typeof password !== "string" || password !== validPassword) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24;

  let token: string;
  try {
    token = await createSessionToken(maxAge);
  } catch (err: any) {
    return NextResponse.json({ error: "Server misconfigured: missing JWT_SECRET" }, { status: 500 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  return response;
}
