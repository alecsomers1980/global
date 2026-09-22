import { describe, it, expect } from "vitest";
import { previousPeriod, periodOfDate, periodBounds, periodLabel, isWithinDays } from "./period";

describe("previousPeriod", () => {
  it("returns the month before the one we are in", () => {
    expect(previousPeriod(new Date("2026-09-22T02:20:00Z"))).toBe("2026-08");
  });
  it("rolls back across the year boundary", () => {
    expect(previousPeriod(new Date("2026-01-01T00:00:00Z"))).toBe("2025-12");
  });
  it("pads single-digit months", () => {
    expect(previousPeriod(new Date("2026-03-15T12:00:00Z"))).toBe("2026-02");
  });
});

describe("periodOfDate", () => {
  it("uses UTC, not local time, at the edge of a month", () => {
    expect(periodOfDate(new Date("2026-08-31T23:59:59Z"))).toBe("2026-08");
    expect(periodOfDate(new Date("2026-09-01T00:00:00Z"))).toBe("2026-09");
  });
});

describe("periodBounds", () => {
  it("is half-open: start of the month to start of the next", () => {
    const { start, end } = periodBounds("2026-08");
    expect(start.toISOString()).toBe("2026-08-01T00:00:00.000Z");
    expect(end.toISOString()).toBe("2026-09-01T00:00:00.000Z");
  });
  it("handles December rolling into January", () => {
    const { end } = periodBounds("2026-12");
    expect(end.toISOString()).toBe("2027-01-01T00:00:00.000Z");
  });
  it("rejects a malformed period", () => {
    expect(() => periodBounds("2026-13")).toThrow(/invalid period/);
    expect(() => periodBounds("2026-8")).toThrow(/invalid period/);
    expect(() => periodBounds("august")).toThrow(/invalid period/);
  });
});

describe("periodLabel", () => {
  it("reads as a month and year", () => {
    expect(periodLabel("2026-08")).toBe("August 2026");
    expect(periodLabel("2025-12")).toBe("December 2025");
    expect(periodLabel("2026-01")).toBe("January 2026");
  });
  it("rejects a malformed period", () => {
    expect(() => periodLabel("2026-00")).toThrow(/invalid period/);
  });
});

describe("isWithinDays", () => {
  const now = new Date("2026-09-22T00:00:00Z");
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);

  it("includes both ends of the window", () => {
    expect(isWithinDays(daysAgo(21), now, 21, 45)).toBe(true);
    expect(isWithinDays(daysAgo(45), now, 21, 45)).toBe(true);
  });
  it("excludes anything outside it", () => {
    expect(isWithinDays(daysAgo(20), now, 21, 45)).toBe(false);
    expect(isWithinDays(daysAgo(46), now, 21, 45)).toBe(false);
  });
  it("never counts a future date", () => {
    expect(isWithinDays(new Date(now.getTime() + 86_400_000), now, 21, 45)).toBe(false);
  });
});
