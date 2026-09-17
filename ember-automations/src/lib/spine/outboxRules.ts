import type { OutboxKind, LinkKind } from "./types";

// informational only (mode B sending is not built yet)
export function shadowB(kind: OutboxKind): boolean {
  return kind === "status_note" || kind === "reply" || kind === "question_batch";
}

export function linkKindFor(kind: OutboxKind): LinkKind | null {
  switch (kind) {
    case "question_batch":
      return "question_batch";
    case "estimate":
      return "estimate";
    case "status_note":
    case "reply":
      return "request";
    case "fact_update":
      return null;
  }
}

