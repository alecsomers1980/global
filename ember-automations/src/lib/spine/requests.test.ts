import { describe, it, expect } from "vitest";
import { assertFresh } from "./requests";
import { StaleWriteError } from "./types";

describe("assertFresh", () => {
  it("passes when no expectation is given", () => { expect(() => assertFresh({ updated_at: "a" }, undefined)).not.toThrow(); });
  it("passes when it matches", () => { expect(() => assertFresh({ updated_at: "a" }, "a")).not.toThrow(); });
  it("throws StaleWriteError carrying the current value", () => {
    try { assertFresh({ updated_at: "b" }, "a"); throw new Error("no throw"); }
    catch (e) { expect(e).toBeInstanceOf(StaleWriteError); expect((e as StaleWriteError).current).toBe("b"); }
  });
});
