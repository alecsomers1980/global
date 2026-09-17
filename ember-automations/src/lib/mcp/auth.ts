import type { SupabaseClient } from "@supabase/supabase-js";
import type { Client } from "@/lib/spine/types";
import { getClient } from "@/lib/spine/record";
import { lookupAccessToken, isConnectorEnabled } from "./store";

export type McpIdentity =
  | { ok: true; userId: string; email: string; client: Client; oauthClientId: string }
  | { ok: false; reason: "token" | "role" };

/** The one rule for "may this Supabase user act for a client". Shared with the consent page. */
export function clientIdOf(user: { app_metadata?: Record<string, unknown> } | null | undefined): string | null {
  const meta = user?.app_metadata ?? {};
  return meta.role === "client" && typeof meta.client_id === "string" ? meta.client_id : null;
}

/**
 * Resolve a bearer token to a client person, fresh, on every call.
 *
 * The token carries only a user id — never a Supabase credential — so the role
 * is re-read from Supabase each time. A revoked role, a deleted user or an
 * archived client takes effect on the next tool call rather than when the
 * token happens to expire.
 */
export async function resolveMcpClient(db: SupabaseClient, token: string): Promise<McpIdentity> {
  if (!(await isConnectorEnabled(db))) return { ok: false, reason: "role" };

  const row = await lookupAccessToken(db, token);
  if (!row) return { ok: false, reason: "token" };

  const { data, error } = await db.auth.admin.getUserById(row.user_id);
  if (error || !data?.user) return { ok: false, reason: "token" };

  const clientId = clientIdOf(data.user);
  if (!clientId) return { ok: false, reason: "role" };

  const client = await getClient(db, clientId);
  if (!client || client.status === "archived") return { ok: false, reason: "role" };

  return { ok: true, userId: row.user_id, email: data.user.email ?? "", client, oauthClientId: row.client_id };
}
