import { describe, it, expect } from "vitest";
import { TRANSITIONS, ACTIVE_STATUSES, canTransition, queuePosition } from "./state";
import type { RequestStatus } from "./types";

const ALL: RequestStatus[] = ["submitted","triaged","needs_info","estimated","client_approved","scheduled","in_progress","delivered","closed","declined","cancelled"];

describe("transitions", () => {
  it("covers every status", () => { for (const s of ALL) expect(TRANSITIONS[s]).toBeDefined(); });
  it("allows the happy path", () => {
    const path: RequestStatus[] = ["submitted","triaged","estimated","client_approved","scheduled","in_progress","delivered","closed"];
    for (let i = 0; i < path.length - 1; i++) expect(canTransition(path[i], path[i + 1])).toBe(true);
  });
  it("allows needs_info round trip and decline re-triage", () => {
    expect(canTransition("triaged", "needs_info")).toBe(true);
    expect(canTransition("needs_info", "triaged")).toBe(true);
    expect(canTransition("estimated", "declined")).toBe(true);
    expect(canTransition("declined", "triaged")).toBe(true);
  });
  it("forbids skipping and terminal moves", () => {
    expect(canTransition("submitted", "delivered")).toBe(false);
    expect(canTransition("closed", "in_progress")).toBe(false);
    expect(canTransition("cancelled", "submitted")).toBe(false);
    expect(canTransition("delivered", "cancelled")).toBe(false);
  });
  it("active statuses are exactly three", () => {
    expect([...ACTIVE_STATUSES]).toEqual(["client_approved","scheduled","in_progress"]);
  });
});

describe("queuePosition", () => {
  const rows = [
    { id: "a", status: "in_progress" as const, client_approved_at: "2026-09-01T00:00:00Z" },
    { id: "b", status: "client_approved" as const, client_approved_at: "2026-09-03T00:00:00Z" },
    { id: "c", status: "scheduled" as const, client_approved_at: "2026-09-02T00:00:00Z" },
    { id: "d", status: "estimated" as const, client_approved_at: null },
  ];
  it("ranks active rows by approval time", () => {
    expect(queuePosition(rows, "a")).toBe(1);
    expect(queuePosition(rows, "c")).toBe(2);
    expect(queuePosition(rows, "b")).toBe(3);
  });
  it("returns null for inactive or unknown rows", () => {
    expect(queuePosition(rows, "d")).toBeNull();
    expect(queuePosition(rows, "zzz")).toBeNull();
  });
});
