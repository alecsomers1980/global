// Server-only helpers for admin auth: verifying/creating the session cookie
// and checking the login password against the hash stored in Supabase.
import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const ADMIN_COOKIE_NAME = "mcl_admin_session";
const DEFAULT_SESSION_SECONDS = 60 * 60 * 8; // 8 hours
const REMEMBER_SESSION_SECONDS = 60 * 60 * 24 * 7; // 7 days

function secretKey() {
  return new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET);
}

export async function getAdminAccount() {
  const { data, error } = await supabaseAdmin
    .from("admin_account")
    .select("id, email, password_hash")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function verifyAdminPassword(password) {
  const account = await getAdminAccount();
  if (!account) return null;
  const match = await bcrypt.compare(password, account.password_hash);
  return match ? account : null;
}

export async function createSessionCookie(remember) {
  const maxAge = remember ? REMEMBER_SESSION_SECONDS : DEFAULT_SESSION_SECONDS;
  const jwt = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(secretKey());

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, jwt, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

export async function isAdminAuthed() {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!value) return false;
  try {
    await jwtVerify(value, secretKey());
    return true;
  } catch {
    return false;
  }
}

export function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
