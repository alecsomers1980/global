import { NextResponse, type NextRequest } from "next/server";

/**
 * Content-Security-Policy, generated per request rather than in next.config.
 *
 * A nonce is the only way to allow Next's own bootstrap/hydration scripts
 * (App Router inlines a handful) without falling back to 'unsafe-inline' for
 * script-src, which is close to no policy at all. Next reads the nonce back
 * out of the CSP response header and stamps it onto every script tag it
 * renders itself — nothing in app code has to thread it through. The one
 * exception is the JSON-LD blocks in components/seo/JsonLd.tsx: CSP's
 * script-src does not govern a <script type="application/ld+json">, since a
 * non-JavaScript type never executes — those need no nonce.
 *
 * The Supabase host covers both the storage images (next/image already
 * allow-lists it in next.config.ts) and the browser auth client used on the
 * login/reset-password pages (lib/supabase/browser.ts) talking to Supabase's
 * auth API directly. form-action carries both PayFast hosts because
 * PAYFAST_MODE can point at either — the checkout page builds and submits a
 * real HTML form (see app/checkout/CheckoutForm.tsx), and CSP would otherwise
 * block that submission outright rather than degrade gracefully.
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
    : "";

  // React dev mode reconstructs component stacks with eval() — harmless (it
  // never runs in production, per React's own warning text) but CSP blocks
  // it outright without this, which floods the console on every route.
  const devEval = process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'";

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${devEval}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: ${supabaseHost}`,
    `font-src 'self'`,
    `connect-src 'self' ${supabaseHost}`,
    `form-action 'self' https://sandbox.payfast.co.za https://www.payfast.co.za`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    // Every route except static assets and the Next image optimizer, which
    // don't render HTML and gain nothing from a per-request nonce.
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png).*)",
  ],
};
