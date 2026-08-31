import type { NextConfig } from "next";
import path from "node:path";

// Allow next/image to load from the Supabase Storage bucket (product images
// uploaded via the admin). Derived from the project URL so it stays correct
// across environments.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
  : undefined;
const supabaseHost = supabaseUrl?.hostname;
const supabaseOrigin = supabaseUrl?.origin ?? "";

const isDev = process.env.NODE_ENV === "development";

/**
 * Content-Security-Policy — set here rather than a nonce-based proxy.ts.
 *
 * A nonce needs a live request to generate, but most of this site is
 * statically generated at build time (shop, product, news, about...), when
 * no request exists — per Next's own docs, static pages simply never receive
 * the nonce, so every framework script tag on them fails CSP in production.
 * (Found this the hard way: a nonce-based proxy passed every local `next dev`
 * check, because dev mode renders everything dynamically and never exposed
 * the gap — then broke every static page, including /admin's client bundle,
 * the moment it hit the real static build on Vercel.) 'unsafe-inline' for
 * script-src gives up blocking inline-script injection specifically, but
 * this site has no user-authored script content anywhere for that to apply
 * to — the meaningful protections (blocking other-origin scripts/frames/
 * form targets) all still hold.
 */
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: ${supabaseOrigin}`,
  `font-src 'self'`,
  `connect-src 'self' ${supabaseOrigin}`,
  `form-action 'self' https://sandbox.payfast.co.za https://www.payfast.co.za`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `object-src 'none'`,
  `upgrade-insecure-requests`,
].join("; ");

const nextConfig: NextConfig = {
  // The Antigravity workspace above has its own lockfile; without this
  // Turbopack picks the wrong project root.
  turbopack: { root: path.resolve(__dirname) },
  experimental: {
    // Product photographs are posted to a server action. The browser shrinks
    // them to 1600px webp first (lib/image-resize.ts), so a normal upload is
    // ~200KB — but the default 1MB ceiling would reject the occasional large
    // one from a browser that could not re-encode.
    serverActions: { bodySizeLimit: "6mb" },
  },
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // includeSubDomains but not preload: preload submits the domain to
          // browsers' baked-in HSTS lists, which is close to irreversible —
          // that step should be a deliberate choice once the real domain is
          // live, not a side effect of a security pass on a Vercel preview.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
