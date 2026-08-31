// Shared between the jobcards dashboard (dot on the Status badge) and the
// SLA alert cron (email trigger) so the two never drift apart on what counts
// as overdue. See workflow order in app/portal/admin/jobcards/[id]/page.tsx's
// calculateWorkflowStatus.

const CAPTURED_STALL_HOURS = 5;
const QUOTE_APPROVED_STALL_HOURS = 24;

// SLA clocks pause over the weekend (Friday 17:00 -> Monday 07:00) so a job
// captured Friday afternoon doesn't read as wildly overdue by Monday morning.
export function businessHoursElapsed(startISO: string, nowMs: number): number {
  const startMs = new Date(startISO).getTime();
  if (!startMs || isNaN(startMs) || startMs >= nowMs) return 0;

  let pausedMs = 0;
  const cursor = new Date(startMs);
  cursor.setHours(0, 0, 0, 0);
  while (cursor.getTime() <= nowMs) {
    if (cursor.getDay() === 5) { // Friday
      const pauseStart = new Date(cursor);
      pauseStart.setHours(17, 0, 0, 0);
      const pauseEnd = new Date(cursor);
      pauseEnd.setDate(pauseEnd.getDate() + 3); // Monday
      pauseEnd.setHours(7, 0, 0, 0);
      const overlapStart = Math.max(pauseStart.getTime(), startMs);
      const overlapEnd = Math.min(pauseEnd.getTime(), nowMs);
      if (overlapEnd > overlapStart) pausedMs += overlapEnd - overlapStart;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return (nowMs - startMs - pausedMs) / (1000 * 60 * 60);
}

export type SlaFlag = { color: 'red' | 'green'; reason: string };

export type SlaBreach = {
  kind: 'captured_stall' | 'quote_approved_stall';
  hours: number;
  reason: string;
};

// Dashboard dot: red = stalled past threshold, green = proof approved and
// ready for production.
export function getSlaFlag(jc: any, nowMs: number): SlaFlag | null {
  const workflow = jc.status_workflow_json || {};
  if (workflow.approved?.ticked) {
    return { color: 'green', reason: 'Proof approved — ready to start production' };
  }
  const breach = getSlaBreach(jc, nowMs);
  if (breach) return { color: 'red', reason: breach.reason };
  return null;
}

// Cron alert: which specific SLA (if any) is currently breached. Only the red
// (overdue) conditions are alert-worthy — the green "approved" signal is
// informational only and doesn't need to interrupt anyone by email.
export function getSlaBreach(jc: any, nowMs: number): SlaBreach | null {
  const workflow = jc.status_workflow_json || {};

  if (workflow.captured?.ticked && !workflow.quote_sent?.ticked) {
    const hours = businessHoursElapsed(workflow.captured.ticked_at, nowMs);
    if (hours > CAPTURED_STALL_HOURS) {
      return { kind: 'captured_stall', hours, reason: `Captured ${hours.toFixed(0)}h ago — still needs a quote` };
    }
  }

  if (workflow.quote_approved?.ticked && !workflow.proof_sent?.ticked) {
    const hours = businessHoursElapsed(workflow.quote_approved.ticked_at, nowMs);
    if (hours > QUOTE_APPROVED_STALL_HOURS) {
      return { kind: 'quote_approved_stall', hours, reason: `Quote approved ${hours.toFixed(0)}h ago — send proofs ASAP` };
    }
  }

  return null;
}
