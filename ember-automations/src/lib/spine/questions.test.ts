import { describe, it, expect } from "vitest";
import { cleanAnswers } from "./questions";

describe("cleanAnswers", () => {
  it("drops blanks and non-objects, trims text", () => {
    expect(cleanAnswers([{ question_id: "a", answer: "  yes " }, { question_id: "b", answer: "  " }, null, "x"]))
      .toEqual([{ question_id: "a", answer: "yes" }]);
  });
  it("keeps the last answer for a repeated question", () => {
    expect(cleanAnswers([{ question_id: "a", answer: "1" }, { question_id: "a", answer: "2" }]))
      .toEqual([{ question_id: "a", answer: "2" }]);
  });
  it("returns [] for non-arrays", () => {
    expect(cleanAnswers(undefined)).toEqual([]);
    expect(cleanAnswers("nope")).toEqual([]);
  });
});
