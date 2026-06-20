import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Conservative, static-rendering-friendly CSP. We intentionally do NOT set
// script-src/style-src/default-src/frame-src here: a strict script CSP needs
// nonces (which would force every page to be dynamically rendered, killing the
// static SEO matrix + ISR), and frame-src would have to allowlist the external
// PlacementPartner careers iframe. These directives are the safe subset that
// hardens without risking the iframe, PayFast checkout, or Supabase calls.
const cspDirectives = [
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Content-Security-Policy", value: cspDirectives },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // Pin the workspace root to this project (a parent lockfile exists in the monorepo dir).
  turbopack: { root: import.meta.dirname },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Order portal authenticates via a token in the URL — never leak it via Referer.
      { source: "/orders/:path*", headers: [{ key: "Referrer-Policy", value: "no-referrer" }] },
    ];
  },
};

export default nextConfig;
