import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root to this app — the parent monorepo has its own
  // lockfile/node_modules and Next would otherwise infer it as the root.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
