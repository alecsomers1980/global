const EXACT_ALLOWED = new Set([
  'https://claude.ai/api/mcp/auth_callback',
  'https://claude.com/api/mcp/auth_callback',
]);

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

/**
 * Redirect URIs are exact-matched, not host-matched.
 *
 * This is what stops a stolen authorization code being delivered anywhere but
 * Claude: dynamic client registration is open, so this allowlist — not the
 * registration step — is the boundary.
 */
export function isAllowedRedirectUri(uri: string): boolean {
  if (!uri) return false;

  if (EXACT_ALLOWED.has(uri)) return true;

  let parsed: URL;
  try {
    parsed = new URL(uri);
  } catch {
    return false;
  }

  // Local development clients (MCP Inspector, Claude Desktop) use loopback on
  // an arbitrary port, so the port and path cannot be pinned.
  return parsed.protocol === 'http:' && LOCAL_HOSTS.has(parsed.hostname);
}

/**
 * May this client use this redirect URI?
 *
 * Normally a client may only use a URI it registered. Claude is the exception:
 * it registers one of claude.ai / claude.com and may then authorise with the
 * other — different surfaces (web, desktop, mobile) do not agree on which host
 * they use, and the client is registered once.
 *
 * Treating the pair as equivalent widens nothing. Both are pinned in
 * EXACT_ALLOWED, which is the real boundary: dynamic registration is open, so
 * anyone could register a client naming either host anyway. Loopback stays
 * strictly per-client, because those URIs are not pinned.
 *
 * Call this only after isAllowedRedirectUri() has passed.
 */
export function isRedirectRegistered(registered: readonly string[], uri: string): boolean {
  if (registered.includes(uri)) return true;
  return EXACT_ALLOWED.has(uri) && registered.some((r) => EXACT_ALLOWED.has(r));
}
