export type Size = "S" | "M" | "L";
export type AiProvider = "deepseek" | "claude";
export type ClientStatus = "active" | "paused" | "archived";
export type RequestStatus =
  | "submitted" | "triaged" | "needs_info" | "estimated" | "client_approved"
  | "scheduled" | "in_progress" | "delivered" | "closed" | "declined" | "cancelled";
export type OutboxKind = "reply" | "question_batch" | "estimate" | "fact_update" | "status_note";
export type OutboxDecision = "pending" | "approved" | "edited" | "rejected";
export type FactSource = "alec" | "mcp" | "question" | "intake" | "spec" | "triage";
export type FactStatus = "proposed" | "confirmed" | "rejected";
export type QuestionStatus = "draft" | "approved" | "sent" | "answered" | "dropped";
export type LinkKind = "request" | "question_batch" | "estimate";

export interface Estimate { summary: string; credits: number; due_by: string | null; assumptions: string[]; }

export interface Client {
  id: string; slug: string; name: string; vertical: string | null; status: ClientStatus;
  approval_mode: "A" | "B"; ai_provider: AiProvider; plan: unknown; notes: string | null;
  created_at: string; updated_at: string;
}
export interface ClientPerson {
  id: string; client_id: string; name: string; role: string | null; email: string | null; phone: string | null;
  signs_off_on: string[]; is_primary: boolean; notes: string | null; created_at: string;
}
export interface ClientSystem { id: string; client_id: string; name: string; kind: string | null; notes: string | null; created_at: string; }
export interface ClientProcess {
  id: string; client_id: string; name: string; frequency: string | null; volume: string | null;
  owner_person_id: string | null; pain: string | null; notes: string | null; created_at: string;
}
export interface ClientFact {
  id: string; client_id: string; statement: string; source: FactSource; source_ref: string | null;
  status: FactStatus; confirmed_at: string | null; created_at: string;
}
export interface ClientAsset {
  id: string; client_id: string; kind: "site" | "domain" | "supabase" | "vercel" | "email" | "repo" | "other";
  label: string; url: string | null; status: "ok" | "warning" | "broken" | "unknown"; notes: string | null;
  checked_at: string | null; created_at: string;
}
export interface Question {
  id: string; client_id: string; batch_id: string | null; text: string; why: string | null; status: QuestionStatus;
  answer: string | null; answered_via: "mcp" | "link" | "alec" | null; answered_at: string | null; created_at: string;
}
export interface CatalogueItem {
  id: string; name: string; description: string | null; size: Size; verticals: string[]; active: boolean; sort_order: number; created_at: string;
}
export interface RequestRow {
  id: string; client_id: string; title: string; description: string; why_it_matters: string | null;
  affected_area: string | null; examples: string | null; deadline: string | null; source: "mcp" | "link" | "admin";
  submitted_by: string | null; status: RequestStatus; size: Size | null; credits: number | null;
  catalogue_item_id: string | null; estimate: Estimate | null; client_approved_at: string | null;
  delivered_at: string | null; created_at: string; updated_at: string;
}
export interface RequestEvent { id: string; request_id: string; type: string; payload: Record<string, unknown>; actor: "client" | "alec" | "system"; created_at: string; }
export interface CreditRow { id: string; client_id: string; delta: number; reason: "monthly_grant" | "request" | "adjustment"; request_id: string | null; period: string; note: string | null; created_at: string; }
export interface OutboxRow {
  id: string; client_id: string; kind: OutboxKind; ref_table: string; ref_id: string; draft: Record<string, unknown>;
  final: Record<string, unknown> | null; decision: OutboxDecision; shadow_b: boolean; decided_at: string | null;
  sent_at: string | null; link_token_id: string | null; created_at: string;
}
export interface LinkToken { id: string; token: string; kind: LinkKind; ref_id: string; client_id: string; expires_at: string; last_used_at: string | null; created_at: string; }

export class StaleWriteError extends Error {
  constructor(public current: string) { super("stale write: row changed since it was read"); }
}
