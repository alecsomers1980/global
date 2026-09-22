import type { SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { getRequest, transition } from "@/lib/spine/requests";
import { getClient, summarizeRecord, proposeFacts } from "@/lib/spine/record";
import { parsePlan, creditsFor, dueBy } from "@/lib/spine/plan";
import { runTriage } from "@/lib/ai/triage";
import { createOutbox } from "@/lib/spine/outbox";
import type { OutboxRow, Size, CatalogueItem } from "@/lib/spine/types";

export async function triageAndQueue(
  db: SupabaseClient,
  requestId: string
): Promise<{ outboxId: string }> {
  const request = await getRequest(db, requestId);
  if (!request) throw new Error("request not found");
  const client = await getClient(db, request.client_id);
  if (!client) throw new Error("client not found");

  const plan = parsePlan(client.plan);

  const { data: catalogueRows, error: catalogueErr } = await db
    .from("catalogue_items")
    .select("id, name, description, size, verticals")
    .eq("active", true);
  if (catalogueErr) throw new Error(catalogueErr.message);
  const catalogue = (catalogueRows as { id: string; name: string; description: string | null; size: Size; verticals: string[] }[])
    .filter((r) => r.verticals.length === 0 || (client.vertical !== null && r.verticals.includes(client.vertical)))
    .map(({ id, name, description, size }) => ({ id, name, description, size }));

  const input = {
    request,
    recordSummary: await summarizeRecord(db, client.id),
    catalogue,
    plan,
  };

  let triage;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    triage = await Promise.race([
      runTriage(client.ai_provider, input),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("triage_timeout")), 25_000);
      }),
    ]);
  } catch (e) {
    const error = e as Error;
    await db.from("request_events").insert({
      request_id: requestId,
      type: error.message === "triage_timeout" ? "triage_timeout" : "triage_failed",
      payload: { message: error.message },
      actor: "system",
    });
    throw e;
  } finally {
    if (timeout) clearTimeout(timeout);
  }

  await proposeFacts(db, client.id, triage.proposed_facts, "triage", requestId);

  const now = new Date();
  let outbox: OutboxRow;

  if (triage.needs_info) {
    const batch_id = randomUUID();
    const questionRows = triage.questions.map((q) => ({
      client_id: client.id,
      batch_id,
      text: q.text,
      why: q.why,
      status: "draft",
    }));
    const { data: insertedRows, error: insertErr } = await db
      .from("questions")
      .insert(questionRows)
      .select("*");
    if (insertErr) throw new Error(insertErr.message);
    const rows = insertedRows as { id: string }[];
    outbox = await createOutbox(db, {
      client_id: client.id,
      kind: "question_batch",
      ref_table: "requests",
      ref_id: requestId,
      draft: {
        batch_id,
        question_ids: rows.map((r) => r.id),
        questions: triage.questions,
        title: request.title,
      },
    });
  } else {
    const credits = creditsFor(plan, triage.size);
    const due = dueBy(plan, triage.size, now);
    outbox = await createOutbox(db, {
      client_id: client.id,
      kind: "estimate",
      ref_table: "requests",
      ref_id: requestId,
      draft: {
        size: triage.size,
        credits,
        estimate: {
          summary: triage.estimate.summary,
          credits,
          due_by: due ? due.toISOString() : null,
          assumptions: triage.estimate.assumptions,
        },
        catalogue_item_id: triage.catalogue_item_id,
        title: request.title,
        classification: triage.classification,
      },
    });
  }

  if (request.status === "submitted" || request.status === "needs_info" || request.status === "declined") {
    await transition(db, requestId, "triaged", "system", {
      payload: { classification: triage.classification, size: triage.size },
    });
  }

  return { outboxId: outbox.id };
}

