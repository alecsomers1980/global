import { NextResponse } from 'next/server';

const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.emb3r.co.za';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// RFC 8414. S256 only — 'plain' PKCE is not offered.
export async function GET() {
  return NextResponse.json(
    {
      issuer: origin,
      authorization_endpoint: `${origin}/oauth/authorize`,
      token_endpoint: `${origin}/oauth/token`,
      registration_endpoint: `${origin}/oauth/register`,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      code_challenge_methods_supported: ['S256'],
      token_endpoint_auth_methods_supported: ['none'],
      scopes_supported: ['ember:read', 'ember:write'],
    },
    { headers: CORS }
  );
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}
