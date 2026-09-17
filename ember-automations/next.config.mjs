import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root to this app — the parent monorepo has its own
  // lockfile/node_modules and Next would otherwise infer it as the root.
  outputFileTracingRoot: __dirname,
  async rewrites() {
    // The MCP connector's public URLs. Claude only ever sees these; the handlers
    // live under /api/mcp so all connector code sits in one folder. /oauth/authorize
    // is deliberately absent — it is a real page, not a rewrite.
    return [
      { source: "/.well-known/oauth-protected-resource", destination: "/api/mcp/well-known/protected-resource" },
      { source: "/.well-known/oauth-protected-resource/mcp", destination: "/api/mcp/well-known/protected-resource" },
      { source: "/.well-known/oauth-authorization-server", destination: "/api/mcp/well-known/authorization-server" },
      { source: "/oauth/register", destination: "/api/mcp/oauth/register" },
      { source: "/oauth/approve", destination: "/api/mcp/oauth/approve" },
      { source: "/oauth/token", destination: "/api/mcp/oauth/token" },
    ];
  },
  async headers() {
    return [
      {
        // Scoped to /mcp only. The OAuth routes set their own CORS headers.
        source: "/mcp",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version" },
          { key: "Access-Control-Expose-Headers", value: "Mcp-Session-Id, WWW-Authenticate" },
        ],
      },
    ];
  },
};

export default nextConfig;
