import { describe, it, expect } from "vitest";
import { makeSlug } from "./slug";

describe("makeSlug", () => {
  it("kebab-cases the project name and appends a random suffix", () => {
    const s = makeSlug("Maynardville Festival");
    expect(s).toMatch(/^maynardville-festival-[a-z0-9]{6}$/);
  });
  it("is URL-safe and unique across calls", () => {
    const a = makeSlug("A B!"); const b = makeSlug("A B!");
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[a-z0-9-]+$/);
  });
  it("handles empty/odd names without crashing", () => {
    expect(makeSlug("")).toMatch(/^project-[a-z0-9]{6}$/);
  });
});
