// Shared between the jobcards dashboard (dot on the Status badge), the
// jobcard detail page (workflow checklist status), and the SLA alert cron
// (email trigger) so all three never drift apart on what stage a job is at.

const CAPTURED_STALL_HOURS = 5;
const QUOTE_APPROVED_STALL_HOURS = 24;

// The single source of truth for "what stage is this job really at" — reads
// backwards from the latest possible step so that ticking a later box (a
// step skipped ahead of, meaning the ones before it weren't needed for this
// job) always wins over an earlier box left unticked.
export function calculateWorkflowStatus(workflow: any): string {
  if (!workflow) return 'Quoted';

  if (workflow.completed?.ticked) return 'Completed';
  if (workflow.ready_collection?.ticked) return 'Ready';

  const top6 = ['captured', 'quote_sent', 'quote_approved', 'deposit_paid', 'proof_sent', 'approved'];
  const allTop6Ticked = top6.every(k => workflow[k]?.ticked);
  if (allTop6Ticked) return 'In-Production';

  if (workflow.approved?.ticked) return 'Approved';
  if (workflow.proof_sent?.ticked) return 'Proof Sent';
  if (workflow.deposit_paid?.ticked) return 'Deposit Paid / PO';
  if (workflow.quote_approved?.ticked) return 'Quote Approved';
  if (workflow.quote_sent?.ticked) return 'Quote Sent';
  if (workflow.captured?.ticked) return 'Captured';
  return 'Quoted';
}

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
//
// Keyed off the job's actual current stage (calculateWorkflowStatus), not
// raw checkbox combos: if a later step got ticked — meaning the steps before
// it weren't needed for this particular job — the job has moved on and the
// earlier stall no longer applies, even if that earlier box was never ticked.
export function getSlaBreach(jc: any, nowMs: number): SlaBreach | null {
  const workflow = jc.status_workflow_json || {};
  const status = calculateWorkflowStatus(workflow);

  if (status === 'Captured') {
    const hours = businessHoursElapsed(workflow.captured.ticked_at, nowMs);
    if (hours > CAPTURED_STALL_HOURS) {
      return { kind: 'captured_stall', hours, reason: `Captured ${hours.toFixed(0)}h ago — still needs a quote` };
    }
  }

  if (status === 'Quote Approved') {
    const hours = businessHoursElapsed(workflow.quote_approved.ticked_at, nowMs);
    if (hours > QUOTE_APPROVED_STALL_HOURS) {
      return { kind: 'quote_approved_stall', hours, reason: `Quote approved ${hours.toFixed(0)}h ago — send proofs ASAP` };
    }
  }

  return null;
}
