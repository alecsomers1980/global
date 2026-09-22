import { describe, it, expect } from "vitest";
import { makeToken, tokenExpiry, isExpired, TOKEN_TTL_DAYS } from "./tokens";

describe("tokens", () => {
  it("makes 43-char url-safe tokens that differ", () => {
    const a = makeToken(), b = makeToken();
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(a).not.toBe(b);
  });
  it("expires after 30 days", () => {
    const now = new Date("2026-09-17T00:00:00Z");
    expect(TOKEN_TTL_DAYS).toBe(30);
    expect(tokenExpiry(now).toISOString()).toBe("2026-10-17T00:00:00.000Z");
    expect(isExpired("2026-10-17T00:00:00Z", new Date("2026-10-16T23:59:59Z"))).toBe(false);
    expect(isExpired("2026-10-17T00:00:00Z", new Date("2026-10-17T00:00:00Z"))).toBe(true);
  });
});
