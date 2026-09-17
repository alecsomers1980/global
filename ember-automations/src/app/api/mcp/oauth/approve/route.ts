import { NextResponse, type NextRequest } from "next/server";
import { serviceClient } from "@/lib/supabaseServer";
import { sessionUser } from "@/lib/supabaseSession";
import { clientIdOf } from "@/lib/mcp/auth";
import { getOauthClient, issueAuthCode } from "@/lib/mcp/store";
import { isAllowedRedirectUri, isRedirectRegistered } from "@/lib/mcp/redirect";
import { logMcpAudit } from "@/lib/mcp/audit";

/**
 * The consent decision. Re-validates everything the page validated: the page
 * renders with the user's session, but this POST is a separate request and must
 * not trust its hidden fields.
 */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const clientId = String(form.get("client_id") ?? "");
  const redirectUri = String(form.get("redirect_uri") ?? "");
  const codeChallenge = String(form.get("code_challenge") ?? "");
  const state = String(form.get("state") ?? "");
  const decision = String(form.get("decision") ?? "");

  if (!isAllowedRedirectUri(redirectUri)) {
    return NextResponse.json({ error: "invalid_redirect_uri" }, { status: 400 });
  }

  const db = serviceClient();
  const client = await getOauthClient(db, clientId);
  if (!client || !isRedirectRegistered(client.redirect_uris, redirectUri)) {
    return NextResponse.json({ error: "invalid_client" }, { status: 400 });
  }

  const target = new URL(redirectUri);
  if (state) target.searchParams.set("state", state);

  if (decision !== "approve") {
    target.searchParams.set("error", "access_denied");
    return NextResponse.redirect(target, { status: 303 });
  }

  const user = await sessionUser();
  const emberClientId = clientIdOf(user);
  if (!user || !emberClientId) return NextResponse.json({ error: "access_denied" }, { status: 403 });

  const code = await issueAuthCode(db, { clientId, userId: user.id, redirectUri, codeChallenge });

  await logMcpAudit(db, {
    userId: user.id,
    clientId: emberClientId,
    action: "consent_granted",
    args: { oauth_client_id: clientId, redirect_uri: redirectUri },
    summary: `Approved ${client.client_name} as an MCP connector`,
  });

  target.searchParams.set("code", code);
  return NextResponse.redirect(target, { status: 303 });
}
