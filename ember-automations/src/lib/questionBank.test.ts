import { describe, it, expect } from "vitest";
import { CORE, MODULES, assembleQuestionSet } from "./questionBank";

describe("question bank", () => {
  it("core has the budget band and start-simple critical questions", () => {
    const ids = CORE.map(q => q.id);
    expect(ids).toContain("core.budget");
    expect(ids).toContain("core.posture");
    expect(CORE.find(q => q.id === "core.budget")!.critical).toBe(true);
  });

  it("module A covers site goal; module B covers process + roles", () => {
    expect(MODULES.A.map(q => q.id)).toContain("A.primaryJob");
    expect(MODULES.B.map(q => q.id)).toContain("B.process");
    expect(MODULES.B.map(q => q.id)).toContain("B.roles");
  });

  it("assembleQuestionSet puts core first, then modules, then custom, all round 1", () => {
    const custom = [{ id: "custom.1", module: "A", label: "X", type: "text", required: false, critical: false, round: 1 } as const];
    const set = assembleQuestionSet(["A"], custom);
    expect(set[0].module).toBe("core");
    expect(set.some(q => q.module === "A")).toBe(true);
    expect(set[set.length - 1].id).toBe("custom.1");
    expect(set.every(q => q.round === 1)).toBe(true);
  });

  it("has a moscow question in each module for MoSCoW tagging", () => {
    expect(MODULES.A.some(q => q.type === "moscow")).toBe(true);
    expect(MODULES.B.some(q => q.type === "moscow")).toBe(true);
  });
});
