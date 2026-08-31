import { getServerClient } from "./supabase/server";

/**
 * Admin authorisation.
 *
 * The client-side guard in the admin layout is for navigation only — it stops
 * a staff member seeing a broken page, and stops nobody determined. The real
 * check is here: every admin action verifies the caller's access token against
 * Supabase and reads the role from the token's own app_metadata, which only the
 * service role can write. A user cannot promote themselves by editing anything
 * the browser can reach.
 */

export class NotAdminError extends Error {
  constructor() {
    super("You do not have access to that.");
    this.name = "NotAdminError";
  }
}

/**
 * A refusal the operator is meant to read: a blocked claim, an order that is
 * not payable. Its message reaches the screen; every other throw is a fault
 * and gets a generic message, because a raw Postgres error is neither useful
 * to a shopkeeper nor safe to display.
 */
export class RefusedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RefusedError";
  }
}

export type AdminIdentity = { userId: string; email: string };

export async function requireAdmin(accessToken: string): Promise<AdminIdentity> {
  if (!accessToken || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new NotAdminError();

  const { data, error } = await getServerClient().auth.getUser(accessToken);
  if (error || !data.user) throw new NotAdminError();

  const role = (data.user.app_metadata as { role?: string } | null)?.role;
  if (role !== "admin") {
    console.warn(`[admin] refused ${data.user.email ?? data.user.id} (role=${role ?? "none"})`);
    throw new NotAdminError();
  }

  return { userId: data.user.id, email: data.user.email ?? "" };
}

/** Wraps an admin action so a refusal is a message, not an unhandled throw. */
export async function asAdmin<T>(
  accessToken: string,
  work: (who: AdminIdentity) => Promise<T>
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const who = await requireAdmin(accessToken);
    return { ok: true, data: await work(who) };
  } catch (e) {
    if (e instanceof NotAdminError || e instanceof RefusedError) {
      return { ok: false, error: e.message };
    }
    console.error("[admin] action failed", e);
    return { ok: false, error: "That did not save. Please try again." };
  }
}
