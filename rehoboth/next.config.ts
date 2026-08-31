import type { NextConfig } from "next";
import path from "node:path";

// Allow next/image to load from the Supabase Storage bucket (product images
// uploaded via the admin). Derived from the project URL so it stays correct
// across environments.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

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
  // The Content-Security-Policy is set per request in src/middleware.ts (it
  // needs a fresh nonce every time); these are the headers that don't, so
  // they live here instead of being recomputed on every request.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
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
