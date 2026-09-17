import type { RequestStatus, RequestRow } from "./types";

export const TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  submitted: ["triaged", "cancelled"],
  triaged: ["needs_info", "estimated", "cancelled"],
  needs_info: ["triaged", "estimated", "cancelled"],
  estimated: ["client_approved", "declined", "cancelled"],
  client_approved: ["scheduled", "cancelled"],
  scheduled: ["in_progress", "cancelled"],
  in_progress: ["delivered", "cancelled"],
  delivered: ["closed"],
  closed: [],
  declined: ["triaged"],
  cancelled: [],
};

export const ACTIVE_STATUSES: readonly RequestStatus[] = [
  "client_approved",
  "scheduled",
  "in_progress",
];

export function canTransition(from: RequestStatus, to: RequestStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function queuePosition(
  rows: Pick<RequestRow, "id" | "status" | "client_approved_at">[],
  id: string,
): number | null {
  const activeRows = rows
    .filter((row) => ACTIVE_STATUSES.includes(row.status))
    .sort((a, b) => {
      const aTime = a.client_approved_at ?? "";
      const bTime = b.client_approved_at ?? "";
      if (aTime < bTime) return -1;
      if (aTime > bTime) return 1;
      return 0;
    });

  const index = activeRows.findIndex((row) => row.id === id);
  return index === -1 ? null : index + 1;
}

