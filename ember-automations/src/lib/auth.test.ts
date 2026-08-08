import { describe, it, expect } from "vitest";
import { adminGate, aalFromAccessToken, hasVerifiedFactor } from "./auth";
import type { User } from "@supabase/supabase-js";

const ADMIN = "admin@example.com";

// Minimal JWT: header.payload.signature — only the payload is read.
const tokenWithAal = (aal: string) =>
  `x.${Buffer.from(JSON.stringify({ aal })).toString("base64")}.y`;

const user = (email: string, factorStatus?: string) =>
  ({
    email,
    factors: factorStatus ? [{ id: "f1", status: factorStatus }] : [],
  } as unknown as User);

describe("aalFromAccessToken", () => {
  it("reads aal2 from the token", () => {
    expect(aalFromAccessToken(tokenWithAal("aal2"))).toBe("aal2");
  });
  it("defaults to aal1 for missing/garbage tokens", () => {
    expect(aalFromAccessToken(undefined)).toBe("aal1");
    expect(aalFromAccessToken("not-a-jwt")).toBe("aal1");
    expect(aalFromAccessToken(tokenWithAal("aal1"))).toBe("aal1");
  });
});

describe("hasVerifiedFactor", () => {
  it("only counts verified factors", () => {
    expect(hasVerifiedFactor(user(ADMIN, "verified"))).toBe(true);
    expect(hasVerifiedFactor(user(ADMIN, "unverified"))).toBe(false);
    expect(hasVerifiedFactor(user(ADMIN))).toBe(false);
    expect(hasVerifiedFactor(null)).toBe(false);
  });
});

describe("adminGate", () => {
  it("rejects anonymous callers", () => {
    expect(adminGate(null, undefined, ADMIN)).toEqual({ ok: false, reason: "unauthenticated" });
  });

  it("rejects a signed-in user who is not the admin", () => {
    const r = adminGate(user("someone@else.com", "verified"), tokenWithAal("aal2"), ADMIN);
    expect(r).toEqual({ ok: false, reason: "unauthenticated" });
  });

  it("rejects when ADMIN_EMAIL is unset (fail closed, not open)", () => {
    const r = adminGate(user(ADMIN, "verified"), tokenWithAal("aal2"), undefined);
    expect(r.ok).toBe(false);
  });

  it("demands the code when enrolled but still at aal1", () => {
    const r = adminGate(user(ADMIN, "verified"), tokenWithAal("aal1"), ADMIN);
    expect(r).toEqual({ ok: false, reason: "mfa_required" });
  });

  it("forces enrolment when no factor exists (2FA is mandatory)", () => {
    const r = adminGate(user(ADMIN), tokenWithAal("aal1"), ADMIN);
    expect(r).toEqual({ ok: false, reason: "enrol_required" });
  });

  it("an unverified factor still counts as not enrolled", () => {
    const r = adminGate(user(ADMIN, "unverified"), tokenWithAal("aal1"), ADMIN);
    expect(r).toEqual({ ok: false, reason: "enrol_required" });
  });

  it("admits the admin only at aal2 with a verified factor", () => {
    expect(adminGate(user(ADMIN, "verified"), tokenWithAal("aal2"), ADMIN)).toEqual({ ok: true });
  });
});
