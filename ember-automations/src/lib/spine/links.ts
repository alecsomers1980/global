import type { SupabaseClient } from "@supabase/supabase-js";
import type { LinkToken, RequestRow, Question } from "./types";
import { makeToken, tokenExpiry, isExpired } from "./tokens";
import { getRequest, listRequests } from "./requests";
import { queuePosition } from "./state";
import { getClient } from "./record";

type LinkKind = LinkToken["kind"];

export async function mintLink(db: SupabaseClient, input: { kind: LinkKind; ref_id: string; client_id: string }, now: Date = new Date()): Promise<{ row: LinkToken; url: string }> {
  const token = makeToken();
  const expiresAt = tokenExpiry(now).toISOString();
  const { data, error } = await db.from("link_tokens").insert({ token, kind: input.kind, ref_id: input.ref_id, client_id: input.client_id, expires_at: expiresAt }).select("*").single();
  if (error) throw new Error(error.message);
  const row = data as LinkToken;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/c/${row.token}`;
  return { row, url };
}

export async function resolveLink(db: SupabaseClient, token: string, now: Date = new Date()): Promise<LinkToken | null> {
  const { data, error } = await db.from("link_tokens").select("*").eq("token", token).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data || isExpired(data.expires_at, now)) return null;

  await db.from("link_tokens").update({ last_used_at: now.toISOString() }).eq("id", data.id);

  return data as LinkToken;
}

export type LinkPayload =
  | { kind: "request"; request: RequestRow; queue_position: number | null; client_name: string }
  | { kind: "estimate"; request: RequestRow; client_name: string }
  | { kind: "question_batch"; questions: Question[]; client_name: string };

export async function linkPayload(db: SupabaseClient, link: LinkToken): Promise<LinkPayload> {
  const client = await getClient(db, link.client_id);
  const client_name = client?.name ?? "there";

  if (link.kind === "request") {
    const request = await getRequest(db, link.ref_id);
    if (!request) throw new Error("request not found");
    const siblings = await listRequests(db, link.client_id);
    const queue_position = queuePosition(siblings, request.id);
    return { kind: "request", request, queue_position, client_name };
  }

  if (link.kind === "estimate") {
    const request = await getRequest(db, link.ref_id);
    if (!request) throw new Error("request not found");
    return { kind: "estimate", request, client_name };
  }

  const { data, error } = await db.from("questions").select("*").eq("batch_id", link.ref_id).order("created_at", { ascending: true });
  if (error) throw new Error(error.message);

  return { kind: "question_batch", questions: (data ?? []) as Question[], client_name };
}

