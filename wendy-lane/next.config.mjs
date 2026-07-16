/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * `next build` and `next dev` both write to .next by default, so building while the
   * dev server is running clobbers the chunks it has loaded and dev then dies with
   * "Cannot find module './xxx.js'". `npm run build` sets NEXT_DIST_DIR=.next-build
   * so a build can never disturb a running dev server.
   */
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
