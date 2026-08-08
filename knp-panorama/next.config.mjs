/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { formats: ['image/webp'] },
  // This project sits inside a larger workspace that has its own lockfile, so
  // pin the root explicitly rather than let Next infer the parent directory.
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
