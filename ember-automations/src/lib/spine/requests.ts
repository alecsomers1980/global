import type { SupabaseClient } from "@supabase/supabase-js";
import type { Client, RequestRow, RequestEvent, RequestStatus } from "./types";
import { StaleWriteError } from "./types";
import { parsePlan, balance, periodOf } from "./plan";
import { canTransition, ACTIVE_STATUSES } from "./state";

export interface NewRequest {
  client_id: string;
  title: string;
  description: string;
  why_it_matters?: string | null;
  affected_area?: string | null;
  examples?: string | null;
  deadline?: string | null;
  source: "mcp" | "link" | "admin";
  submitted_by?: string | null;
  catalogue_item_id?: string | null;
}

export async function createRequest(db: SupabaseClient, input: NewRequest): Promise<RequestRow> {
  const { data, error } = await db.from("requests")
    .insert({
      client_id: input.client_id,
      title: input.title,
      description: input.description,
      why_it_matters: input.why_it_matters ?? null,
      affected_area: input.affected_area ?? null,
      examples: input.examples ?? null,
      deadline: input.deadline ?? null,
      source: input.source,
      submitted_by: input.submitted_by ?? null,
      catalogue_item_id: input.catalogue_item_id ?? null,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  const row = data as RequestRow;

  const { error: eventError } = await db.from("request_events").insert({
    request_id: row.id,
    type: "submitted",
    payload: {},
    actor: input.source === "admin" ? "alec" : "client",
  });
  if (eventError) throw new Error(eventError.message);

  return row;
}

export async function getRequest(db: SupabaseClient, id: string): Promise<RequestRow | null> {
  const { data, error } = await db.from("requests").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as RequestRow | null;
}

export async function listRequests(db: SupabaseClient, clientId: string, status?: RequestStatus): Promise<RequestRow[]> {
  let query = db.from("requests").select("*").eq("client_id", clientId).order("created_at", { ascending: false });
  if (status !== undefined) {
    query = query.eq("status", status);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as RequestRow[];
}

export async function listEvents(db: SupabaseClient, requestId: string): Promise<RequestEvent[]> {
  const { data, error } = await db.from("request_events")
    .select("*")
    .eq("request_id", requestId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data as RequestEvent[];
}

export function assertFresh(row: { updated_at: string }, expectedUpdatedAt: string | undefined): void {
  if (expectedUpdatedAt !== undefined && expectedUpdatedAt !== row.updated_at) {
    throw new StaleWriteError(row.updated_at);
  }
}

export interface TransitionOptions {
  expectedUpdatedAt?: string;
  payload?: Record<string, unknown>;
  patch?: Partial<Pick<RequestRow, "size" | "credits" | "estimate" | "catalogue_item_id">>;
  now?: Date;
}

export async function transition(
  db: SupabaseClient,
  id: string,
  to: RequestStatus,
  actor: "client" | "alec" | "system",
  opts?: TransitionOptions,
): Promise<RequestRow> {
  const row = await getRequest(db, id);
  if (!row) throw new Error("request not found");

  assertFresh(row, opts?.expectedUpdatedAt);

  if (!canTransition(row.status, to)) {
    throw new Error(`cannot move ${row.status} → ${to}`);
  }

  const now = opts?.now ?? new Date();
  const patch = opts?.patch ?? {};
  const update: Partial<RequestRow> = {
    status: to,
    ...patch,
  };

  if (to === "client_approved") {
    update.client_approved_at = now.toISOString();
  }
  if (to === "delivered") {
    update.delivered_at = now.toISOString();
  }

  const { data, error } = await db.from("requests")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  const updated = data as RequestRow;

  if (to === "delivered") {
    const credits = updated.credits ?? 0;
    if (credits > 0) {
      const { error: ledgerError } = await db.from("credits_ledger").insert({
        client_id: updated.client_id,
        delta: -credits,
        reason: "request",
        request_id: id,
        period: periodOf(now),
        note: `delivered: ${updated.title}`,
      });
      if (ledgerError) throw new Error(ledgerError.message);
    }
  }

  const { error: eventError } = await db.from("request_events").insert({
    request_id: id,
    type: `status:${to}`,
    payload: opts?.payload ?? {},
    actor,
  });
  if (eventError) throw new Error(eventError.message);

  return updated;
}

export async function activeCount(db: SupabaseClient, clientId: string): Promise<number> {
  const { count, error } = await db.from("requests")
    .select("id", { count: "exact", head: true })
    .eq("client_id", clientId)
    .in("status", [...ACTIVE_STATUSES]);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function creditBalance(db: SupabaseClient, client: Client, now: Date = new Date()): Promise<number> {
  const { data, error } = await db.from("credits_ledger")
    .select("delta, period")
    .eq("client_id", client.id);
  if (error) throw new Error(error.message);
  const rows = data as { delta: number; period: string }[];
  return balance(rows, parsePlan(client.plan), now);
}

