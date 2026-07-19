import { describe, it, expect } from "vitest";
import { exportSubmissionMarkdown } from "./exportMarkdown";
import type { Questionnaire } from "./types";

const qn: Questionnaire = {
  id: "1", slug: "acme-x1", client_name: "Acme", project_name: "Site",
  type: "website", status: "submitted",
  question_set: [
    { id: "core.goal", module: "core", label: "Goal?", type: "long", required: true, critical: true, round: 1 },
    { id: "core.tools", module: "core", label: "Tools?", type: "long", required: false, critical: false, round: 1 },
  ],
  answers: { "core.goal": { value: "Sell online", round: 1, saved_at: "" } },
  created_at: "", updated_at: "",
};

describe("exportSubmissionMarkdown", () => {
  it("includes client/project heading and answered question", () => {
    const md = exportSubmissionMarkdown(qn);
    expect(md).toContain("# Acme — Site");
    expect(md).toContain("Goal?");
    expect(md).toContain("Sell online");
  });
  it("marks unanswered questions and flags missing critical", () => {
    const md = exportSubmissionMarkdown(qn);
    expect(md).toContain("_(no answer)_");
    expect(md).toContain("Missing critical");
  });
});
