import type { SupabaseClient } from "@supabase/supabase-js";
import type { Client, Question, RequestRow, Size } from "@/lib/spine/types";
import { creditsFor, parsePlan, type Plan } from "@/lib/spine/plan";
import { ACTIVE_STATUSES, queuePosition } from "@/lib/spine/state";
import { isWithinDays, periodBounds, periodLabel } from "./period";

export interface ReportInputs {
  client: Client;
  plan: Plan;
  period: string;
  requests: RequestRow[];
  questions: Question[];
  ledger: { delta: number; period: string; reason: string }[];
  now: Date;
}

export interface DeliveredItem {
  id: string;
  title: string;
  size: Size | null;
  credits: number;
  delivered_at: string;
}

export interface InFlightItem {
  id: string;
  title: string;
  status: string;
  size: Size | null;
  credits: number | null;
  queue_position: number | null;
  due_by: string | null;
}

export interface WaitingItem {
  kind: "question" | "estimate";
  id: string;
  text: string;
  credits?: number;
  due_by?: string | null;
}

export interface CheckInItem {
  id: string;
  title: string;
  delivered_at: string;
}

export interface ReportFacts {
  period: string;
  period_label: string;
  client_name: string;
  delivered: DeliveredItem[];
  credits_used: number;
  credits_granted: number;
  balance: number;
  monthly_credits: number;
  in_flight: InFlightItem[];
  waiting: WaitingItem[];
  check_ins: CheckInItem[];
  delivered_all_time: string[];
}

export function composeFacts(input: ReportInputs): ReportFacts {
  const { start, end } = periodBounds(input.period);

  const delivered = input.requests
    .filter(
      (r): r is RequestRow & { delivered_at: string } =>
        (r.status === "delivered" || r.status === "closed") &&
        r.delivered_at !== null &&
        new Date(r.delivered_at) >= start &&
        new Date(r.delivered_at) < end,
    )
    .sort(
      (a, b) =>
        new Date(a.delivered_at).getTime() - new Date(b.delivered_at).getTime(),
    )
    .map((r) => ({
      id: r.id,
      title: r.title,
      size: r.size,
      credits: r.credits ?? 0,
      delivered_at: r.delivered_at,
    }));

  const credits_used = delivered.reduce((sum, item) => sum + item.credits, 0);

  const credits_granted = input.ledger
    .filter((entry) => entry.delta > 0 && entry.period === input.period)
    .reduce((sum, entry) => sum + entry.delta, 0);

  const balance = input.ledger.reduce((sum, entry) => sum + entry.delta, 0);

  const in_flight = input.requests
    .filter((r) =>
      (ACTIVE_STATUSES as readonly string[]).includes(r.status),
    )
    .sort((a, b) => {
      if (a.client_approved_at === null && b.client_approved_at === null) {
        return 0;
      }
      if (a.client_approved_at === null) {
        return 1;
      }
      if (b.client_approved_at === null) {
        return -1;
      }
      return a.client_approved_at.localeCompare(b.client_approved_at);
    })
    .map((r) => ({
      id: r.id,
      title: r.title,
      status: r.status,
      size: r.size,
      credits: r.credits,
      queue_position: queuePosition(input.requests, r.id),
      due_by: r.estimate?.due_by ?? null,
    }));

  const questionWaiting: WaitingItem[] = input.questions
    .filter((q) => q.status === "sent")
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((q): WaitingItem => ({
      kind: "question",
      id: q.id,
      text: q.text,
    }));

  const estimateWaiting: WaitingItem[] = input.requests
    .filter((r) => r.status === "estimated")
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((r): WaitingItem => ({
      kind: "estimate",
      id: r.id,
      text: r.title,
      credits: r.credits ?? creditsFor(input.plan, r.size ?? "M"),
      due_by: r.estimate?.due_by ?? null,
    }));

  const check_ins = input.requests
    .filter(
      (r): r is RequestRow & { delivered_at: string } =>
        (r.status === "delivered" || r.status === "closed") &&
        r.delivered_at !== null &&
        isWithinDays(new Date(r.delivered_at), input.now, 21, 45),
    )
    .sort(
      (a, b) =>
        new Date(a.delivered_at).getTime() - new Date(b.delivered_at).getTime(),
    )
    .map((r) => ({
      id: r.id,
      title: r.title,
      delivered_at: r.delivered_at,
    }));

  const delivered_all_time = input.requests
    .filter((r) => r.status === "delivered" || r.status === "closed")
    .sort((a, b) => {
      const aTime = a.delivered_at ? new Date(a.delivered_at).getTime() : 0;
      const bTime = b.delivered_at ? new Date(b.delivered_at).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 20)
    .map((r) => r.title);

  return {
    period: input.period,
    period_label: periodLabel(input.period),
    client_name: input.client.name,
    delivered,
    credits_used,
    credits_granted,
    balance,
    monthly_credits: input.plan.monthly_credits,
    in_flight,
    waiting: [...questionWaiting, ...estimateWaiting],
    check_ins,
    delivered_all_time,
  };
}

export async function loadReportInputs(
  db: SupabaseClient,
  client: Client,
  period: string,
  now?: Date,
): Promise<ReportInputs> {
  const plan = parsePlan(client.plan);

  const { data: requests, error: requestsError } = await db
    .from("requests")
    .select("*")
    .eq("client_id", client.id);
  if (requestsError) throw new Error(requestsError.message);

  const { data: questions, error: questionsError } = await db
    .from("questions")
    .select("*")
    .eq("client_id", client.id);
  if (questionsError) throw new Error(questionsError.message);

  const { data: ledger, error: ledgerError } = await db
    .from("credits_ledger")
    .select("delta, period, reason")
    .eq("client_id", client.id);
  if (ledgerError) throw new Error(ledgerError.message);

  return {
    client,
    plan,
    period,
    requests: (requests ?? []) as RequestRow[],
    questions: (questions ?? []) as Question[],
    ledger: (ledger ?? []) as {
      delta: number;
      period: string;
      reason: string;
    }[],
    now: now ?? new Date(),
  };
}

export async function buildFacts(
  db: SupabaseClient,
  client: Client,
  period: string,
  now?: Date,
): Promise<ReportFacts> {
  return composeFacts(await loadReportInputs(db, client, period, now));
}

export function hasAnythingToSay(facts: ReportFacts): boolean {
  return (
    facts.delivered.length > 0 ||
    facts.in_flight.length > 0 ||
    facts.waiting.length > 0 ||
    facts.check_ins.length > 0
  );
}

