import { describe, it, expect } from "vitest";
import { detectGaps, isBlank } from "./gapDetection";
import type { Question, AnswerValue } from "./types";

const Q = (id: string, extra: Partial<Question> = {}): Question =>
  ({ id, module: "core", label: id, type: "text", required: true, critical: false, round: 1, ...extra });
const A = (value: any): AnswerValue => ({ value, round: 1, saved_at: "" });

describe("gap detection", () => {
  it("treats null/empty string/empty array as blank", () => {
    expect(isBlank(undefined)).toBe(true);
    expect(isBlank(A(""))).toBe(true);
    expect(isBlank(A([]))).toBe(true);
    expect(isBlank(A("hi"))).toBe(false);
  });

  it("flags blank critical questions only", () => {
    const qs = [Q("core.goal", { critical: true }), Q("core.tools", { critical: false })];
    const res = detectGaps(qs, { });
    expect(res.missingCritical.map(q => q.id)).toEqual(["core.goal"]);
  });

  it("summarises MoSCoW tags", () => {
    const qs = [Q("A.moscow", { type: "moscow", options: ["Shop", "Blog", "Maps"] })];
    const answers = { "A.moscow": A({ Shop: "Must", Blog: "Could", Maps: "Must" }) };
    const res = detectGaps(qs, answers);
    expect(res.moscow.Must.sort()).toEqual(["Maps", "Shop"]);
    expect(res.moscow.Could).toEqual(["Blog"]);
  });

  it("warns when 'everything day one' meets 4+ Musts", () => {
    const qs = [
      Q("core.posture", { type: "select", options: ["Start simple & grow", "Everything from day one"] }),
      Q("A.moscow", { type: "moscow", options: ["a", "b", "c", "d"] }),
    ];
    const answers = {
      "core.posture": A("Everything from day one"),
      "A.moscow": A({ a: "Must", b: "Must", c: "Must", d: "Must" }),
    };
    expect(detectGaps(qs, answers).warnings.length).toBeGreaterThan(0);
  });
});
