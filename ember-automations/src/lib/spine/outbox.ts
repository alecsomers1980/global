import type { SupabaseClient } from "@supabase/supabase-js";
import type { OutboxRow, OutboxKind, OutboxDecision, Size, Estimate } from "@/lib/spine/types";
import { shadowB } from "@/lib/spine/outboxRules";
import { setFactStatus, primaryPerson, getClient } from "@/lib/spine/record";
import { getRequest, transition } from "@/lib/spine/requests";
import { mintLink } from "@/lib/spine/links";
import { sendClientEmail } from "@/lib/spine/email";

export async function createOutbox(
  db: SupabaseClient,
  input: { client_id: string; kind: OutboxKind; ref_table: string; ref_id: string; draft: Record<string, unknown> }
): Promise<OutboxRow> {
  const { data, error } = await db
    .from("outbox")
    .insert({
      client_id: input.client_id,
      kind: input.kind,
      ref_table: input.ref_table,
      ref_id: input.ref_id,
      draft: input.draft,
      shadow_b: shadowB(input.kind),
      decision: "pending",
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as OutboxRow;
}

export async function listPending(db: SupabaseClient): Promise<(OutboxRow & { client_name: string })[]> {
  const { data, error } = await db
    .from("outbox")
    .select("*, clients(name)")
    .eq("decision", "pending")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  const rows = data as (OutboxRow & { clients: { name: string } | { name: string }[] | null })[];
  return rows.map(({ clients, ...rest }) => ({
    ...rest,
    client_name: Array.isArray(clients) ? clients[0]?.name ?? "" : clients?.name ?? "",
  }));
}

export async function getOutbox(db: SupabaseClient, id: string): Promise<OutboxRow | null> {
  const { data, error } = await db
    .from("outbox")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }
  return data as OutboxRow;
}

export interface DecideResult { row: OutboxRow; link: string | null; emailed: boolean; }

export async function decideOutbox(
  db: SupabaseClient,
  id: string,
  decision: "approved" | "edited" | "rejected",
  final?: Record<string, unknown>,
  now: Date = new Date()
): Promise<DecideResult> {
  const row = await getOutbox(db, id);
  if (!row) throw new Error("outbox item not found");
  if (row.decision !== "pending") throw new Error("already decided");

  const finalPayload = final ?? row.draft;

  if (decision === "rejected") {
    if (row.kind === "fact_update") {
      const factIds = (row.draft.fact_ids as string[] | undefined) ?? [];
      for (const factId of factIds) {
        await setFactStatus(db, factId, "rejected");
      }
    }
    if (row.kind === "question_batch") {
      const questionIds = (row.draft.question_ids as string[] | undefined) ?? [];
      if (questionIds.length > 0) {
        const { error: qErr } = await db.from("questions").update({ status: "dropped" }).in("id", questionIds);
        if (qErr) throw new Error(qErr.message);
      }
    }
    const { data, error } = await db
      .from("outbox")
      .update({ decision, final: finalPayload, decided_at: now.toISOString() })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { row: data as OutboxRow, link: null, emailed: false };
  }

  // approved or edited
  let link: string | null = null;
  let tokenId: string | null = null;

  if (row.kind === "question_batch") {
    const questionIds = (row.draft.question_ids as string[] | undefined) ?? [];
    if (questionIds.length > 0) {
      const { error: qErr } = await db.from("questions").update({ status: "sent" }).in("id", questionIds);
      if (qErr) throw new Error(qErr.message);
    }
    const req = await getRequest(db, row.ref_id);
    if (req && req.status === "triaged") {
      await transition(db, row.ref_id, "needs_info", "alec");
    }
    const mint = await mintLink(db, { kind: "question_batch", ref_id: String(row.draft.batch_id), client_id: row.client_id }, now);
    link = mint.url;
    tokenId = mint.row.id;
  } else if (row.kind === "estimate") {
    await transition(db, row.ref_id, "estimated", "alec", {
      patch: {
        size: finalPayload.size as Size,
        credits: Number(finalPayload.credits),
        estimate: finalPayload.estimate as Estimate,
        catalogue_item_id: (finalPayload.catalogue_item_id as string | null) ?? null,
      },
    });
    const mint = await mintLink(db, { kind: "estimate", ref_id: row.ref_id, client_id: row.client_id }, now);
    link = mint.url;
    tokenId = mint.row.id;
  } else if (row.kind === "status_note" || row.kind === "reply") {
    const mint = await mintLink(db, { kind: "request", ref_id: row.ref_id, client_id: row.client_id }, now);
    link = mint.url;
    tokenId = mint.row.id;
  } else if (row.kind === "fact_update") {
    const factIds = (row.draft.fact_ids as string[] | undefined) ?? [];
    for (const factId of factIds) {
      await setFactStatus(db, factId, "confirmed");
    }
  }

  let emailed = false;
  if (link) {
    const person = await primaryPerson(db, row.client_id);
    const client = await getClient(db, row.client_id);
    if (person?.email) {
      const emailKind = row.kind === "question_batch" ? "questions" : row.kind === "estimate" ? "estimate" : "status";
      const title = (finalPayload.title as string | undefined) ?? (finalPayload.summary as string | undefined);
      emailed = await sendClientEmail(person.email, emailKind, {
        clientName: client?.name ?? "there",
        link,
        title,
      });
    }
  }

  const { data, error } = await db
    .from("outbox")
    .update({
      decision,
      final: finalPayload,
      decided_at: now.toISOString(),
      sent_at: link ? now.toISOString() : null,
      link_token_id: tokenId,
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return { row: data as OutboxRow, link, emailed };
}

export async function shadowStats(
  db: SupabaseClient,
  clientId: string,
  days: number
): Promise<{ total: number; wouldAutoSend: number; edited: number }> {
  const now = new Date();
  const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const { data, error } = await db
    .from("outbox")
    .select("*")
    .eq("client_id", clientId)
    .in("decision", ["approved", "edited"])
    .gte("decided_at", since.toISOString());
  if (error) throw new Error(error.message);
  const rows = data as OutboxRow[];
  return {
    total: rows.length,
    wouldAutoSend: rows.filter((r) => r.shadow_b).length,
    edited: rows.filter((r) => r.decision === "edited").length,
  };
}
