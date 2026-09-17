import { describe, it, expect } from "vitest";
import { shadowB, linkKindFor } from "./outboxRules";

describe("outbox rules", () => {
  it("routine kinds would auto-send under B", () => {
    expect(shadowB("status_note")).toBe(true);
    expect(shadowB("reply")).toBe(true);
    expect(shadowB("question_batch")).toBe(true);
  });
  it("committing kinds never auto-send", () => {
    expect(shadowB("estimate")).toBe(false);
    expect(shadowB("fact_update")).toBe(false);
  });
  it("maps outbox kinds to link kinds", () => {
    expect(linkKindFor("question_batch")).toBe("question_batch");
    expect(linkKindFor("estimate")).toBe("estimate");
    expect(linkKindFor("status_note")).toBe("request");
    expect(linkKindFor("reply")).toBe("request");
    expect(linkKindFor("fact_update")).toBeNull();
  });
});
