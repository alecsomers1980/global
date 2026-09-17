import { NextResponse, type NextRequest } from 'next/server';
import { serviceClient } from '@/lib/supabaseServer';
import { registerClient } from '@/lib/mcp/store';
import { isAllowedRedirectUri } from '@/lib/mcp/redirect';
import { checkMcpRateLimit } from '@/lib/mcp/rate-limit';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * RFC 7591 dynamic client registration.
 *
 * Deliberately open — Claude registers itself. Registration mints no access:
 * a token only exists once a signed-in staff member approves the consent screen.
 * The redirect allowlist is what stops a registered client redirecting a stolen
 * code anywhere but Claude.
 */
export async function POST(req: NextRequest) {
  const db = serviceClient();
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!(await checkMcpRateLimit(db, `register:${ip}`, 5, 300))) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429, headers: CORS });
  }

  const body = await req.json().catch(() => null);
  const redirectUris: unknown = body?.redirect_uris;

  if (!Array.isArray(redirectUris) || redirectUris.length === 0) {
    return NextResponse.json(
      { error: 'invalid_client_metadata', error_description: 'redirect_uris is required' },
      { status: 400, headers: CORS }
    );
  }

  const uris = redirectUris.map(String);
  if (!uris.every(isAllowedRedirectUri)) {
    return NextResponse.json(
      { error: 'invalid_redirect_uri', error_description: 'redirect_uri is not allowed' },
      { status: 400, headers: CORS }
    );
  }

  const name = String(body?.client_name ?? 'Unnamed client').slice(0, 120);
  const result = await registerClient(db, name, uris);

  if ('error' in result) {
    return NextResponse.json({ error: 'temporarily_unavailable' }, { status: 503, headers: CORS });
  }

  return NextResponse.json(
    {
      client_id: result.client_id,
      client_name: name,
      redirect_uris: uris,
      token_endpoint_auth_method: 'none',
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
    },
    { status: 201, headers: CORS }
  );
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}
