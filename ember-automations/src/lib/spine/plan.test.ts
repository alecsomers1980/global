import { describe, it, expect } from "vitest";
import { DEFAULT_PLAN, parsePlan, creditsFor, periodOf, addWorkingDays, dueBy, balance } from "./plan";

describe("parsePlan", () => {
  it("fills defaults and validates", () => {
    const p = parsePlan({ monthly_credits: 6 });
    expect(p.monthly_credits).toBe(6);
    expect(p.max_active).toBe(1);
    expect(p.credit_sizes).toEqual({ S: 1, M: 3, L: 6 });
    expect(p.turnaround).toEqual({ S: "48h", M: "5wd", L: "quoted" });
    expect(p.rollover).toBe(false);
    expect(p.renews_on).toBe(1);
  });
  it("rejects nonsense", () => {
    expect(() => parsePlan({ monthly_credits: -1 })).toThrow();
    expect(() => parsePlan({ renews_on: 32 })).toThrow();
  });
});

describe("creditsFor / periodOf", () => {
  it("maps sizes", () => {
    expect(creditsFor(DEFAULT_PLAN, "S")).toBe(1);
    expect(creditsFor(DEFAULT_PLAN, "M")).toBe(3);
    expect(creditsFor(DEFAULT_PLAN, "L")).toBe(6);
  });
  it("formats period in UTC", () => {
    expect(periodOf(new Date("2026-09-17T23:30:00Z"))).toBe("2026-09");
    expect(periodOf(new Date("2026-01-01T00:00:00Z"))).toBe("2026-01");
  });
});

describe("addWorkingDays / dueBy", () => {
  it("skips weekends", () => {
    // Thu 2026-09-17 + 5 working days = Thu 2026-09-24
    expect(addWorkingDays(new Date("2026-09-17T08:00:00Z"), 5).toISOString()).toBe("2026-09-24T08:00:00.000Z");
    // Fri + 1 = Mon
    expect(addWorkingDays(new Date("2026-09-18T08:00:00Z"), 1).toISOString()).toBe("2026-09-21T08:00:00.000Z");
  });
  it("computes due_by per size", () => {
    const from = new Date("2026-09-17T08:00:00Z");
    expect(dueBy(DEFAULT_PLAN, "S", from)!.toISOString()).toBe("2026-09-19T08:00:00.000Z");
    expect(dueBy(DEFAULT_PLAN, "M", from)!.toISOString()).toBe("2026-09-24T08:00:00.000Z");
    expect(dueBy(DEFAULT_PLAN, "L", from)).toBeNull();
  });
});

describe("balance", () => {
  const rows = [
    { delta: 6, period: "2026-08" }, { delta: -3, period: "2026-08" },
    { delta: 6, period: "2026-09" }, { delta: -1, period: "2026-09" },
  ];
  const now = new Date("2026-09-17T00:00:00Z");
  it("counts only the current period when rollover is off", () => {
    expect(balance(rows, DEFAULT_PLAN, now)).toBe(5);
  });
  it("counts everything when rollover is on", () => {
    expect(balance(rows, { ...DEFAULT_PLAN, rollover: true }, now)).toBe(8);
  });
  it("can go negative", () => {
    expect(balance([{ delta: -3, period: "2026-09" }], DEFAULT_PLAN, now)).toBe(-3);
  });
});
