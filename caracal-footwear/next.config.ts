import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    // The parent Antigravity folder has its own package-lock.json, so Next
    // otherwise infers the workspace root one level too high and resolves
    // modules from the wrong tree.
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
