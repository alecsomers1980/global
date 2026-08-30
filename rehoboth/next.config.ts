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
};

export default nextConfig;
