import { describe, test, expect } from "vitest";
import { isBot, MIN_SUBMIT_MS } from "./bot-guard";

const NOW = 1_700_000_000_000;
const human = { company: "", renderedAt: NOW - 10_000 };

describe("isBot", () => {
  test("a filled honeypot is a bot", () => {
    expect(isBot({ ...human, company: "Acme" }, NOW)).toBe(true);
  });

  test("a honeypot of only whitespace is not treated as filled", () => {
    expect(isBot({ ...human, company: "   " }, NOW)).toBe(false);
  });

  test("a submission faster than the floor is a bot", () => {
    expect(isBot({ ...human, renderedAt: NOW - 100 }, NOW)).toBe(true);
  });

  test("exactly at the floor is allowed through", () => {
    expect(isBot({ ...human, renderedAt: NOW - MIN_SUBMIT_MS }, NOW)).toBe(false);
  });

  test("a real submission passes", () => {
    expect(isBot(human, NOW)).toBe(false);
  });

  test("a missing timestamp is a bot — a browser always sends it", () => {
    expect(isBot({ company: "" }, NOW)).toBe(true);
  });

  test("a non-numeric timestamp is a bot", () => {
    expect(isBot({ company: "", renderedAt: "soon" }, NOW)).toBe(true);
  });

  test("a non-string honeypot is a bot", () => {
    expect(isBot({ company: ["a"], renderedAt: NOW - 10_000 }, NOW)).toBe(true);
  });

  test("a future timestamp is not rejected as too fast", () => {
    // Clock skew between browser and server must not lock a customer out.
    expect(isBot({ company: "", renderedAt: NOW + 60_000 }, NOW)).toBe(false);
  });
});
