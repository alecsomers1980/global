import { describe, expect, it } from "vitest";
import { monthBefore, monthFromKey, previousMonth } from "./period";

describe("previousMonth", () => {
  it("reports the month that just ended at 00:30 SAST on the 1st", () => {
    // 2026-10-01 00:30 SAST = 2026-09-30 22:30 UTC
    const p = previousMonth(new Date("2026-09-30T22:30:00Z"));
    expect(p.key).toBe("2026-09");
  });

  it("still reports the month before at 23:30 UTC on the 30th (01:30 SAST on the 1st)", () => {
    expect(previousMonth(new Date("2026-09-30T23:30:00Z")).key).toBe("2026-09");
  });

  it("reports the month before that at 21:30 UTC on the 30th (still September in SAST)", () => {
    expect(previousMonth(new Date("2026-09-30T21:30:00Z")).key).toBe("2026-08");
  });

  it("expresses SAST boundaries as UTC instants", () => {
    const p = previousMonth(new Date("2026-10-01T06:00:00Z"));
    expect(p).toEqual({
      key: "2026-09",
      label: "September 2026",
      startUtc: "2026-08-31T22:00:00.000Z",
      endUtc: "2026-09-30T22:00:00.000Z",
      startDate: "2026-09-01",
      endDate: "2026-09-30",
    });
  });

  it("crosses the year in January", () => {
    const p = previousMonth(new Date("2027-01-01T06:00:00Z"));
    expect(p.key).toBe("2026-12");
    expect(p.endDate).toBe("2026-12-31");
  });
});

describe("monthFromKey / monthBefore", () => {
  it("handles February in a leap year", () => {
    expect(monthFromKey("2028-02").endDate).toBe("2028-02-29");
  });

  it("steps back across a year", () => {
    expect(monthBefore(monthFromKey("2027-01")).key).toBe("2026-12");
  });

  it("rejects anything that is not YYYY-MM", () => {
    expect(() => monthFromKey("2026-13")).toThrow();
    expect(() => monthFromKey("../x")).toThrow();
  });
});
