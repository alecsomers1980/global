"use client";
import { createBrowserClient } from "@supabase/ssr";

export function browserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Shorten the session cookie that was just written.
 *
 * @supabase/ssr forces `maxAge` to its own 400-day default on every auth-cookie
 * write and ignores the `cookieOptions.maxAge` you pass, so an unticked "keep me
 * signed in" cannot be honoured through the client. Rewriting the cookies after the
 * fact can: they are not httpOnly, and the value is copied back verbatim. Chunked
 * sessions are covered by matching the whole `sb-…-auth-token` family.
 */
export function shortenAuthCookies(seconds: number): void {
  for (const pair of document.cookie.split("; ")) {
    const eq = pair.indexOf("=");
    if (eq < 1) continue;
    const name = pair.slice(0, eq);
    if (!(name.startsWith("sb-") && name.includes("-auth-token"))) continue;
    document.cookie = `${name}=${pair.slice(eq + 1)}; path=/; max-age=${seconds}; samesite=lax`;
  }
}
