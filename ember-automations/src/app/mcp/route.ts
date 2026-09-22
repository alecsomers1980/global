import { createMcpHandler, withMcpAuth } from "mcp-handler";
import type { AuthInfo } from "@modelcontextprotocol/server";
import { serviceClient } from "@/lib/supabaseServer";
import { resolveMcpClient } from "@/lib/mcp/auth";
import { registerTools } from "@/lib/mcp/tools";

// Tools query Supabase and call DeepSeek, so this cannot run on the edge.
export const runtime = "nodejs";
export const maxDuration = 60; // submit_request awaits triage (≤25s) inside the call

async function verifyToken(_req: Request, bearerToken?: string): Promise<AuthInfo | undefined> {
  if (!bearerToken) return undefined;

  const identity = await resolveMcpClient(serviceClient(), bearerToken);
  if (!identity.ok) return undefined;

  return {
    token: bearerToken,
    clientId: identity.oauthClientId,
    scopes: ["ember:read", "ember:write"],
    extra: { userId: identity.userId, email: identity.email, clientId: identity.client.id },
  };
}

/**
 * The handler is built per request with the caller's identity closed over, so a
 * tool can never act for a different client than the one whose token authorised
 * the call. withMcpAuth has already rejected anonymous requests by the time this
 * runs, and it emits the 401 + WWW-Authenticate itself.
 */
const authed = withMcpAuth(
  async (req: Request) => {
    const db = serviceClient();
    // Re-resolve rather than trust req.auth.extra: the client row (status, plan,
    // ai_provider) is needed in full and must be current.
    const identity = await resolveMcpClient(db, String(req.auth?.token ?? ""));
    if (!identity.ok) return new Response("Unauthorized", { status: 401 });

    const perRequest = createMcpHandler((server) => registerTools(server, db, identity));
    return perRequest(req);
  },
  verifyToken,
  { required: true, resourceMetadataPath: "/.well-known/oauth-protected-resource" },
);

export { authed as GET, authed as POST, authed as DELETE };
