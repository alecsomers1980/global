import { describe, it, expect } from "vitest";
import { composeFacts, hasAnythingToSay, type ReportInputs } from "./facts";
import { DEFAULT_PLAN } from "@/lib/spine/plan";
import type { Client, Question, RequestRow } from "@/lib/spine/types";

const NOW = new Date("2026-09-22T00:00:00Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000).toISOString();

const client = { id: "c1", name: "Tindlovu Group", plan: {}, vertical: "hospitality" } as unknown as Client;

function request(over: Partial<RequestRow>): RequestRow {
  return {
    id: "r", client_id: "c1", title: "A request", description: "", why_it_matters: null,
    affected_area: null, examples: null, deadline: null, source: "mcp", submitted_by: null,
    status: "submitted", size: null, credits: null, catalogue_item_id: null, estimate: null,
    client_approved_at: null, delivered_at: null,
    created_at: "2026-08-01T00:00:00Z", updated_at: "2026-08-01T00:00:00Z",
    ...over,
  } as RequestRow;
}

function question(over: Partial<Question>): Question {
  return {
    id: "q", client_id: "c1", batch_id: null, text: "A question", why: null, status: "draft",
    answer: null, answered_via: null, answered_at: null, created_at: "2026-08-02T00:00:00Z",
    ...over,
  } as Question;
}

function inputs(over: Partial<ReportInputs> = {}): ReportInputs {
  return {
    client, plan: { ...DEFAULT_PLAN, monthly_credits: 6 }, period: "2026-08",
    requests: [], questions: [], ledger: [], now: NOW,
    ...over,
  };
}

describe("composeFacts — what we did", () => {
  it("counts only work delivered inside the period", () => {
    const facts = composeFacts(inputs({
      requests: [
        request({ id: "in", title: "In period", status: "delivered", size: "M", credits: 3, delivered_at: "2026-08-15T10:00:00Z" }),
        request({ id: "before", title: "Month before", status: "delivered", size: "S", credits: 1, delivered_at: "2026-07-31T23:59:59Z" }),
        request({ id: "after", title: "Month after", status: "closed", size: "L", credits: 6, delivered_at: "2026-09-01T00:00:00Z" }),
      ],
    }));
    expect(facts.delivered.map((d) => d.id)).toEqual(["in"]);
    expect(facts.credits_used).toBe(3);
  });

  it("counts closed as delivered and orders oldest first", () => {
    const facts = composeFacts(inputs({
      requests: [
        request({ id: "late", status: "closed", credits: 1, delivered_at: "2026-08-28T00:00:00Z" }),
        request({ id: "early", status: "delivered", credits: 3, delivered_at: "2026-08-03T00:00:00Z" }),
      ],
    }));
    expect(facts.delivered.map((d) => d.id)).toEqual(["early", "late"]);
    expect(facts.credits_used).toBe(4);
  });

  it("treats a missing credit value as zero rather than NaN", () => {
    const facts = composeFacts(inputs({
      requests: [request({ status: "delivered", credits: null, delivered_at: "2026-08-10T00:00:00Z" })],
    }));
    expect(facts.credits_used).toBe(0);
  });
});

describe("composeFacts — credits", () => {
  it("separates what was granted this period from the carried balance", () => {
    const facts = composeFacts(inputs({
      ledger: [
        { delta: 6, period: "2026-07", reason: "monthly_grant" },
        { delta: -3, period: "2026-07", reason: "request" },
        { delta: 6, period: "2026-08", reason: "monthly_grant" },
        { delta: -1, period: "2026-08", reason: "request" },
      ],
    }));
    expect(facts.credits_granted).toBe(6);
    expect(facts.balance).toBe(8);
    expect(facts.monthly_credits).toBe(6);
  });
});

describe("composeFacts — in flight and waiting", () => {
  it("lists active work with its queue position and due date", () => {
    const facts = composeFacts(inputs({
      requests: [
        request({ id: "second", status: "scheduled", client_approved_at: "2026-08-20T00:00:00Z", size: "M", credits: 3, estimate: { summary: "s", credits: 3, due_by: "2026-09-30T00:00:00Z", assumptions: [] } }),
        request({ id: "first", status: "in_progress", client_approved_at: "2026-08-10T00:00:00Z", size: "S", credits: 1 }),
        request({ id: "done", status: "delivered", credits: 1, delivered_at: "2026-08-11T00:00:00Z" }),
      ],
    }));
    expect(facts.in_flight.map((i) => i.id)).toEqual(["first", "second"]);
    expect(facts.in_flight[0].queue_position).toBe(1);
    expect(facts.in_flight[1].due_by).toBe("2026-09-30T00:00:00Z");
  });

  it("puts sent questions before pending estimates, and ignores drafts", () => {
    const facts = composeFacts(inputs({
      questions: [
        question({ id: "sent", text: "Which units?", status: "sent" }),
        question({ id: "draft", text: "Not approved yet", status: "draft" }),
        question({ id: "answered", text: "Already answered", status: "answered", answer: "yes" }),
      ],
      requests: [request({ id: "est", title: "Roster view", status: "estimated", size: "M", credits: 3, estimate: { summary: "s", credits: 3, due_by: "2026-09-28T00:00:00Z", assumptions: [] } })],
    }));
    expect(facts.waiting.map((w) => [w.kind, w.id])).toEqual([["question", "sent"], ["estimate", "est"]]);
    expect(facts.waiting[1].text).toBe("Roster view");
    expect(facts.waiting[1].credits).toBe(3);
  });

  it("prices an estimate from the plan when the row has no credits yet", () => {
    const facts = composeFacts(inputs({
      requests: [request({ id: "est", status: "estimated", size: "L", credits: null })],
    }));
    expect(facts.waiting[0].credits).toBe(DEFAULT_PLAN.credit_sizes.L);
  });
});

describe("composeFacts — check-ins and history", () => {
  it("asks about work delivered 21 to 45 days ago, whatever period it fell in", () => {
    const facts = composeFacts(inputs({
      requests: [
        request({ id: "ask", title: "Ask about this", status: "delivered", credits: 3, delivered_at: daysAgo(30) }),
        request({ id: "too-new", status: "delivered", credits: 1, delivered_at: daysAgo(5) }),
        request({ id: "too-old", status: "closed", credits: 1, delivered_at: daysAgo(90) }),
      ],
    }));
    expect(facts.check_ins.map((c) => c.id)).toEqual(["ask"]);
  });

  it("lists delivered titles all-time so suggestions never repeat them", () => {
    const facts = composeFacts(inputs({
      requests: [
        request({ id: "a", title: "Older thing", status: "closed", delivered_at: "2026-06-01T00:00:00Z" }),
        request({ id: "b", title: "Newer thing", status: "delivered", delivered_at: "2026-08-01T00:00:00Z" }),
        request({ id: "c", title: "Never delivered", status: "estimated" }),
      ],
    }));
    expect(facts.delivered_all_time).toEqual(["Newer thing", "Older thing"]);
  });
});

describe("composeFacts — a client with nothing", () => {
  it("still produces a usable shell", () => {
    const facts = composeFacts(inputs());
    expect(facts).toMatchObject({
      period: "2026-08", period_label: "August 2026", client_name: "Tindlovu Group",
      delivered: [], credits_used: 0, balance: 0, in_flight: [], waiting: [], check_ins: [],
    });
    expect(hasAnythingToSay(facts)).toBe(false);
  });

  it("has something to say as soon as one thing is waiting", () => {
    const facts = composeFacts(inputs({ questions: [question({ status: "sent" })] }));
    expect(hasAnythingToSay(facts)).toBe(true);
  });
});
