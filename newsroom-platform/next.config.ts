import type { NextConfig } from "next";

// Derived from the env var rather than hardcoded so it tracks whichever
// Supabase project is configured — TODO(Task 14): replace with the R2 host
// once media moves off Supabase Storage.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...(supabaseHostname
        ? [{
            protocol: 'https' as const,
            hostname: supabaseHostname,
            port: '',
            pathname: '/storage/v1/object/public/**',
          }]
        : []),
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
};

export default nextConfig;
