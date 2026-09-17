import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Postgres-backed fixed-window limiter (function mcp_rate_limit_hit in
 * 0003_mcp.sql). An in-memory Map would give each serverless instance its own
 * count; one round trip buys a limit that is actually shared.
 *
 * Returns true when the call is allowed.
 */
export async function checkMcpRateLimit(
  db: SupabaseClient,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const { data, error } = await db.rpc("mcp_rate_limit_hit", { p_key: key, p_window_seconds: windowSeconds });
  if (error) throw new Error(error.message);
  return Number(data ?? 0) <= limit;
}
