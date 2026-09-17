import { describe, it, expect } from "vitest";
import { shouldGrant } from "./grant";

const plan = { monthly_credits: 6, renews_on: 17 };
describe("shouldGrant", () => {
  const now = new Date("2026-09-17T02:10:00Z");
  it("grants on renewal day once per period", () => {
    expect(shouldGrant({ status: "active", plan }, [], now)).toEqual({ grant: true, period: "2026-09", credits: 6 });
    expect(shouldGrant({ status: "active", plan }, ["2026-09"], now).grant).toBe(false);
  });
  it("skips paused clients, zero-credit plans and other days", () => {
    expect(shouldGrant({ status: "paused", plan }, [], now).grant).toBe(false);
    expect(shouldGrant({ status: "active", plan: { ...plan, monthly_credits: 0 } }, [], now).grant).toBe(false);
    expect(shouldGrant({ status: "active", plan }, [], new Date("2026-09-18T02:10:00Z")).grant).toBe(false);
  });
});
