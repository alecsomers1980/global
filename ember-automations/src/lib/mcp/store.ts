import type { SupabaseClient } from "@supabase/supabase-js";
import { sha256, randomToken } from "./crypto";

const AUTH_CODE_TTL_SECONDS = 60;
const ACCESS_TTL_SECONDS = 60 * 60;            // 1 hour
const REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
const MAX_CLIENTS = 50;

const inSeconds = (s: number) => new Date(Date.now() + s * 1000).toISOString();
const nowIso = () => new Date().toISOString();

/** The kill switch. One UPDATE disables the connector without a redeploy. */
export async function isConnectorEnabled(db: SupabaseClient): Promise<boolean> {
  const { data } = await db.from("mcp_settings").select("enabled").eq("id", 1).maybeSingle();
  return data?.enabled === true;
}

export async function countClients(db: SupabaseClient): Promise<number> {
  const { count, error } = await db.from("mcp_clients").select("client_id", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}

/**
 * Drop clients that registered but never completed a flow. Registration is open,
 * so without this the table is a free-for-all; with it, abandoned rows expire.
 */
export async function sweepStaleClients(db: SupabaseClient): Promise<void> {
  const { error } = await db.rpc("mcp_sweep_stale_clients");
  if (error) throw new Error(error.message);
}

export async function registerClient(
  db: SupabaseClient,
  name: string,
  redirectUris: string[],
): Promise<{ client_id: string } | { error: string }> {
  await sweepStaleClients(db);

  if ((await countClients(db)) >= MAX_CLIENTS) {
    // Refuse new registrations rather than evicting — an approved connector must
    // keep working through a registration flood.
    return { error: "registration temporarily unavailable" };
  }

  const clientId = randomToken(16);
  const { error } = await db.from("mcp_clients").insert({ client_id: clientId, client_name: name, redirect_uris: redirectUris });
  if (error) throw new Error(error.message);
  return { client_id: clientId };
}

export async function getOauthClient(db: SupabaseClient, clientId: string) {
  const { data, error } = await db.from("mcp_clients")
    .select("client_id, client_name, redirect_uris")
    .eq("client_id", clientId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as { client_id: string; client_name: string; redirect_uris: string[] } | null;
}

export async function issueAuthCode(
  db: SupabaseClient,
  args: { clientId: string; userId: string; redirectUri: string; codeChallenge: string },
): Promise<string> {
  const code = randomToken();
  const { error } = await db.from("mcp_auth_codes").insert({
    code_hash: sha256(code),
    client_id: args.clientId,
    user_id: args.userId,
    redirect_uri: args.redirectUri,
    code_challenge: args.codeChallenge,
    expires_at: inSeconds(AUTH_CODE_TTL_SECONDS),
  });
  if (error) throw new Error(error.message);
  return code;
}

/** Single-use: the UPDATE ... WHERE NOT used makes a replay a no-op atomically. */
export async function consumeAuthCode(db: SupabaseClient, code: string) {
  const { data, error } = await db.from("mcp_auth_codes")
    .update({ used: true })
    .eq("code_hash", sha256(code))
    .eq("used", false)
    .gt("expires_at", nowIso())
    .select("client_id, user_id, redirect_uri, code_challenge");
  if (error) throw new Error(error.message);
  const row = data?.[0];
  return row
    ? {
        client_id: row.client_id as string,
        user_id: row.user_id as string,
        redirect_uri: row.redirect_uri as string,
        code_challenge: row.code_challenge as string,
      }
    : null;
}

export async function issueTokenPair(db: SupabaseClient, clientId: string, userId: string) {
  const accessToken = randomToken();
  const refreshToken = randomToken();

  const { error } = await db.from("mcp_tokens").insert([
    { token_hash: sha256(accessToken), kind: "access", client_id: clientId, user_id: userId, expires_at: inSeconds(ACCESS_TTL_SECONDS) },
    { token_hash: sha256(refreshToken), kind: "refresh", client_id: clientId, user_id: userId, expires_at: inSeconds(REFRESH_TTL_SECONDS) },
  ]);
  if (error) throw new Error(error.message);

  return { accessToken, refreshToken, expiresIn: ACCESS_TTL_SECONDS };
}

export async function lookupAccessToken(db: SupabaseClient, token: string) {
  const { data, error } = await db.from("mcp_tokens")
    .update({ last_used_at: nowIso() })
    .eq("token_hash", sha256(token))
    .eq("kind", "access")
    .is("revoked_at", null)
    .gt("expires_at", nowIso())
    .select("user_id, client_id");
  if (error) throw new Error(error.message);
  const row = data?.[0];
  return row ? { user_id: row.user_id as string, client_id: row.client_id as string } : null;
}

/**
 * Rotate a refresh token, with reuse detection.
 *
 * A refresh token is single-use. If one is presented twice, the second use means
 * either a replay or a stolen token, and there is no way to tell which — so the
 * whole chain for that user and client is revoked and the holder must re-consent.
 */
export async function rotateRefreshToken(db: SupabaseClient, token: string) {
  const hash = sha256(token);

  const { data, error } = await db.from("mcp_tokens")
    .update({ revoked_at: nowIso() })
    .eq("token_hash", hash)
    .eq("kind", "refresh")
    .is("revoked_at", null)
    .gt("expires_at", nowIso())
    .select("user_id, client_id");
  if (error) throw new Error(error.message);

  const row = data?.[0];
  if (!row) {
    const { data: seen } = await db.from("mcp_tokens")
      .select("user_id, client_id")
      .eq("token_hash", hash)
      .eq("kind", "refresh")
      .maybeSingle();
    if (seen) {
      const { error: revokeError } = await db.from("mcp_tokens")
        .update({ revoked_at: nowIso() })
        .eq("user_id", seen.user_id)
        .eq("client_id", seen.client_id)
        .is("revoked_at", null);
      if (revokeError) throw new Error(revokeError.message);
    }
    return null;
  }

  return issueTokenPair(db, row.client_id as string, row.user_id as string);
}
