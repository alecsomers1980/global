import type { SupabaseClient } from "@supabase/supabase-js";

export async function logMcpAudit(
  db: SupabaseClient,
  entry: { userId: string; clientId: string | null; action: string; tool?: string; args?: unknown; summary: string },
): Promise<void> {
  const { error } = await db.from("mcp_audit").insert({
    user_id: entry.userId,
    client_id: entry.clientId,
    action: entry.action,
    tool: entry.tool ?? null,
    args: entry.args ?? {},
    summary: entry.summary,
  });
  if (error) console.error("mcp audit failed:", error.message);
}
