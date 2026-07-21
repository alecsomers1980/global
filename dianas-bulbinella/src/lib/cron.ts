import type { NextRequest } from "next/server";

/** Cron routes are public URLs, so they're gated on a shared secret.
 *  No CRON_SECRET set = nothing is authorised (fail closed, never open). */
export function isAuthorizedCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return (req.headers.get("authorization") || "") === `Bearer ${secret}`;
}
