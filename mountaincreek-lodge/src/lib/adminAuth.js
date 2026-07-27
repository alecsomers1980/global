// Server-only helper for verifying the admin session cookie inside API routes.
import "server-only";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "mcl_admin_session";

export async function isAdminAuthed() {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return Boolean(value) && value === process.env.ADMIN_SESSION_SECRET;
}

export function unauthorizedResponse() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
