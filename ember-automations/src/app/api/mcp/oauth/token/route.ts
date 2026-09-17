import { NextResponse, type NextRequest } from 'next/server';
import { serviceClient } from '@/lib/supabaseServer';
import { consumeAuthCode, issueTokenPair, rotateRefreshToken } from '@/lib/mcp/store';
import { verifyPkceS256 } from '@/lib/mcp/crypto';
import { checkMcpRateLimit } from '@/lib/mcp/rate-limit';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status, headers: CORS });
}

export async function POST(req: NextRequest) {
  const db = serviceClient();
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!(await checkMcpRateLimit(db, `token:${ip}`, 20, 300))) return bad('rate_limited', 429);

  const form = await req.formData().catch(() => null);
  if (!form) return bad('invalid_request');

  const grantType = String(form.get('grant_type') ?? '');

  if (grantType === 'refresh_token') {
    const pair = await rotateRefreshToken(db, String(form.get('refresh_token') ?? ''));
    // null means reuse was detected and the whole chain is now revoked.
    if (!pair) return bad('invalid_grant');

    return NextResponse.json(
      {
        access_token: pair.accessToken,
        refresh_token: pair.refreshToken,
        token_type: 'Bearer',
        expires_in: pair.expiresIn,
        scope: 'ember:read ember:write',
      },
      { headers: CORS }
    );
  }

  if (grantType !== 'authorization_code') return bad('unsupported_grant_type');

  const code = String(form.get('code') ?? '');
  const verifier = String(form.get('code_verifier') ?? '');
  const redirectUri = String(form.get('redirect_uri') ?? '');
  const clientId = String(form.get('client_id') ?? '');

  const record = await consumeAuthCode(db, code);
  if (!record) return bad('invalid_grant');

  // Every field the code was issued against must match on redemption.
  if (record.client_id !== clientId) return bad('invalid_grant');
  if (record.redirect_uri !== redirectUri) return bad('invalid_grant');
  if (!verifyPkceS256(verifier, record.code_challenge)) return bad('invalid_grant');

  const pair = await issueTokenPair(db, record.client_id, record.user_id);

  return NextResponse.json(
    {
      access_token: pair.accessToken,
      refresh_token: pair.refreshToken,
      token_type: 'Bearer',
      expires_in: pair.expiresIn,
      scope: 'ember:read ember:write',
    },
    { headers: CORS }
  );
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}
