import { describe, it, expect, afterEach } from "vitest";
import { adminEmails, isAdminEmail } from "./admin";

const original = process.env.ADMIN_EMAIL;
afterEach(() => {
  if (original === undefined) delete process.env.ADMIN_EMAIL;
  else process.env.ADMIN_EMAIL = original;
});

describe("isAdminEmail", () => {
  it("admits the single configured address", () => {
    process.env.ADMIN_EMAIL = "alec@emb3r.co.za";
    expect(isAdminEmail("alec@emb3r.co.za")).toBe(true);
    expect(isAdminEmail("someone@else.com")).toBe(false);
  });

  it("admits any address in a comma-separated list", () => {
    process.env.ADMIN_EMAIL = "alec@emb3r.co.za, alec@firewireit.co.za";
    expect(isAdminEmail("alec@emb3r.co.za")).toBe(true);
    expect(isAdminEmail("alec@firewireit.co.za")).toBe(true);
    expect(adminEmails()).toHaveLength(2);
  });

  it("ignores case and stray whitespace on both sides", () => {
    process.env.ADMIN_EMAIL = "  Alec@Emb3r.co.za  ";
    expect(isAdminEmail("alec@emb3r.co.za")).toBe(true);
    expect(isAdminEmail(" ALEC@EMB3R.CO.ZA ")).toBe(true);
  });

  it("fails closed when nothing is configured", () => {
    delete process.env.ADMIN_EMAIL;
    expect(isAdminEmail("alec@emb3r.co.za")).toBe(false);
    process.env.ADMIN_EMAIL = "";
    expect(isAdminEmail("alec@emb3r.co.za")).toBe(false);
    process.env.ADMIN_EMAIL = " , ";
    expect(isAdminEmail("alec@emb3r.co.za")).toBe(false);
  });

  it("refuses a missing email", () => {
    process.env.ADMIN_EMAIL = "alec@emb3r.co.za";
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
    expect(isAdminEmail("")).toBe(false);
  });
});
