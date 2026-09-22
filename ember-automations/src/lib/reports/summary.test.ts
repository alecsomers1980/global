import { describe, it, expect } from "vitest";
import { plural, creditWord, emailSummary, reportHeading, sectionCount, type ReportBody } from "./summary";
import type { ReportFacts } from "./facts";

function facts(over: Partial<ReportFacts> = {}): ReportFacts {
  return {
    period: "2026-08", period_label: "August 2026", client_name: "Tindlovu Group",
    delivered: [], credits_used: 0, credits_granted: 0, balance: 0, monthly_credits: 6,
    in_flight: [], waiting: [], check_ins: [], delivered_all_time: [],
    ...over,
  };
}

function body(over: Partial<ReportBody> = {}): ReportBody {
  return {
    version: 1, period: "2026-08", period_label: "August 2026", client_name: "Tindlovu Group",
    facts: facts(), suggestions: [], generated_at: "2026-09-01T02:20:00Z",
    ...over,
  };
}

const delivered = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: `d${i}`, title: `Thing ${i}`, size: "M" as const, credits: 3, delivered_at: "2026-08-10T00:00:00Z" }));

describe("plural and creditWord", () => {
  it("says one thing once", () => {
    expect(plural(1, "request", "requests")).toBe("1 request");
    expect(creditWord(1)).toBe("1 credit");
  });
  it("pluralises everything else, including zero", () => {
    expect(plural(0, "request", "requests")).toBe("0 requests");
    expect(plural(3, "request", "requests")).toBe("3 requests");
    expect(creditWord(0)).toBe("0 credits");
    expect(creditWord(2)).toBe("2 credits");
  });
});

describe("emailSummary", () => {
  it("leads with what was delivered and the credits it cost", () => {
    const lines = emailSummary(body({ facts: facts({ delivered: delivered(2), credits_used: 4, balance: 2 }) }));
    expect(lines[0]).toBe("Delivered in August 2026: 2 requests (4 credits).");
  });

  it("never prints a zero count", () => {
    const lines = emailSummary(body({ facts: facts({ delivered: delivered(1), credits_used: 3, balance: 3 }) }));
    expect(lines.join(" ")).not.toMatch(/\b0 (requests|questions|estimates|suggestions)\b/);
    expect(lines.some((l) => l.startsWith("In progress"))).toBe(false);
  });

  it("splits what the client owes us into questions and estimates", () => {
    const lines = emailSummary(body({
      facts: facts({
        waiting: [
          { kind: "question", id: "q1", text: "Which units?" },
          { kind: "question", id: "q2", text: "Whose sign-off?" },
          { kind: "estimate", id: "e1", text: "Roster view", credits: 3, due_by: null },
        ],
      }),
    }));
    expect(lines).toContain("Waiting on you: 2 questions and 1 estimate.");
  });

  it("names only the part that exists", () => {
    const lines = emailSummary(body({ facts: facts({ waiting: [{ kind: "estimate", id: "e1", text: "Roster view", credits: 3, due_by: null }] }) }));
    expect(lines).toContain("Waiting on you: 1 estimate.");
  });

  it("counts the suggestions", () => {
    const lines = emailSummary(body({
      suggestions: [
        { title: "A", why: "because of the thing they told us about", size: "M", catalogue_item_id: null, credits: 3 },
        { title: "B", why: "because of the other thing they told us", size: "S", catalogue_item_id: null, credits: 1 },
      ],
    }));
    expect(lines).toContain("2 suggestions for next month.");
  });

  it("always ends on the balance", () => {
    const lines = emailSummary(body({ facts: facts({ delivered: delivered(1), credits_used: 3, balance: 4 }) }));
    expect(lines[lines.length - 1]).toBe("Credit balance: 4 credits.");
  });

  it("explains a negative balance instead of stating it bluntly", () => {
    const lines = emailSummary(body({ facts: facts({ delivered: delivered(2), credits_used: 6, balance: -6 }) }));
    expect(lines[lines.length - 1]).toBe("Credit balance: -6 credits (we have run ahead of the plan).");
  });

  it("says so plainly when a month was quiet", () => {
    const lines = emailSummary(body());
    expect(lines[0]).toBe("A quiet August 2026 — nothing was delivered and nothing is in progress.");
    expect(lines).toHaveLength(2);
    expect(lines[1]).toBe("Credit balance: 0 credits.");
  });
});

describe("reportHeading and sectionCount", () => {
  it("heads the report with the client and the month", () => {
    expect(reportHeading(body())).toBe("Tindlovu Group — August 2026");
  });

  it("counts only the sections that have something in them", () => {
    expect(sectionCount(body())).toBe(0);
    expect(sectionCount(body({
      facts: facts({ delivered: delivered(1), check_ins: [{ id: "d0", title: "Thing 0", delivered_at: "2026-08-10T00:00:00Z" }] }),
      suggestions: [{ title: "A", why: "because of the thing they told us about", size: "M", catalogue_item_id: null, credits: 3 }],
    }))).toBe(3);
  });
});
