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