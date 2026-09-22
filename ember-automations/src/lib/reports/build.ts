import type { SupabaseClient } from "@supabase/supabase-js";
import { parsePlan, creditsFor } from "@/lib/spine/plan";
import { getClient, summarizeRecord } from "@/lib/spine/record";
import { createOutbox } from "@/lib/spine/outbox";
import { runSuggest, type Suggestion } from "@/lib/ai/suggest";
import { buildFacts, type ReportFacts } from "./facts";
import { previousPeriod, periodLabel } from "./period";
import type { ReportBody, ReportSuggestion } from "./summary";

export interface BuildResult {
  report_id: string;
  outbox_id: string;
  period: string;
  suggestions: number;
  skipped?: string;
}

export async function buildReport(
  db: SupabaseClient,
  clientId: string,
  period?: string,
  now?: Date
): Promise<BuildResult> {
  const at = now ?? new Date();
  const forPeriod = period ?? previousPeriod(at);

  const client = await getClient(db, clientId);
  if (!client) {
    throw new Error("client not found");
  }

  if (client.status !== "active") {
    return {
      report_id: "",
      outbox_id: "",
      period: forPeriod,
      suggestions: 0,
      skipped: `client is ${client.status}`,
    };
  }

  const plan = parsePlan(client.plan);
  const facts: ReportFacts = await buildFacts(db, client, forPeriod, at);

  const { data: catalogueRows, error: catalogueError } = await db
    .from("catalogue_items")
    .select("id, name, description, size, verticals")
    .eq("active", true)
    .order("sort_order");
  if (catalogueError) throw catalogueError;

  const catalogue = (catalogueRows ?? [])
    .filter((row) => {
      const verticals: string[] = Array.isArray(row.verticals) ? row.verticals : [];
      return verticals.length === 0 || (client.vertical !== null && verticals.includes(client.vertical));
    })
    .map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      size: row.size,
    }));

  let suggestions: ReportSuggestion[] = [];
  try {
    const raw: Suggestion[] = await runSuggest(client.ai_provider, {
      clientName: client.name,
      vertical: client.vertical,
      recordSummary: await summarizeRecord(db, client.id),
      catalogue,
      alreadyDelivered: facts.delivered_all_time,
      periodLabel: periodLabel(forPeriod),
      deliveredThisPeriod: facts.delivered.map((d) => d.title),
      openQuestions: facts.waiting.filter((w) => w.kind === "question").map((w) => w.text),
      plan,
    });
    suggestions = raw.map((s) => ({ ...s, credits: creditsFor(plan, s.size) }));
  } catch (error) {
    console.error("suggestions failed for", client.slug, error);
    suggestions = [];
  }

  const body: ReportBody = {
    version: 1,
    period: forPeriod,
    period_label: periodLabel(forPeriod),
    client_name: client.name,
    facts,
    suggestions,
    generated_at: at.toISOString(),
  };

  const { data: existingReport, error: existingError } = await db
    .from("reports")
    .select("id, status, outbox_id")
    .eq("client_id", client.id)
    .eq("period", forPeriod)
    .maybeSingle();
  if (existingError) throw existingError;

  if (existingReport && existingReport.status !== "draft") {
    return {
      report_id: existingReport.id,
      outbox_id: existingReport.outbox_id ?? "",
      period: forPeriod,
      suggestions: 0,
      skipped: `report already ${existingReport.status}`,
    };
  }

  const { data: report, error: upsertError } = await db
    .from("reports")
    .upsert(
      { client_id: client.id, period: forPeriod, status: "draft", body },
      { onConflict: "client_id,period" }
    )
    .select("*")
    .single();
  if (upsertError) throw upsertError;
  if (!report) {
    throw new Error("failed to upsert report");
  }

  let outbox_id: string;
  if (existingReport?.outbox_id) {
    const { data: existingOutbox, error: outboxError } = await db
      .from("outbox")
      .select("id, decision")
      .eq("id", existingReport.outbox_id)
      .maybeSingle();
    if (outboxError) throw outboxError;

    if (existingOutbox && existingOutbox.decision === "pending") {
      const { error: updateError } = await db
        .from("outbox")
        .update({ draft: body as unknown as Record<string, unknown> })
        .eq("id", existingReport.outbox_id);
      if (updateError) throw updateError;
      outbox_id = existingReport.outbox_id;
    } else {
      const outboxRow = await createOutbox(db, {
        client_id: client.id,
        kind: "report",
        ref_table: "reports",
        ref_id: report.id,
        draft: body as unknown as Record<string, unknown>,
      });
      outbox_id = outboxRow.id;
    }
  } else {
    const outboxRow = await createOutbox(db, {
      client_id: client.id,
      kind: "report",
      ref_table: "reports",
      ref_id: report.id,
      draft: body as unknown as Record<string, unknown>,
    });
    outbox_id = outboxRow.id;
  }

  const { error: updateReportError } = await db
    .from("reports")
    .update({ outbox_id })
    .eq("id", report.id);
  if (updateReportError) throw updateReportError;

  return {
    report_id: report.id,
    outbox_id,
    period: forPeriod,
    suggestions: suggestions.length,
  };
}

export async function buildReportsForAllClients(
  db: SupabaseClient,
  period?: string,
  now?: Date
): Promise<BuildResult[]> {
  const { data: clients, error } = await db
    .from("clients")
    .select("id")
    .eq("status", "active")
    .order("created_at");
  if (error) throw error;

  const results: BuildResult[] = [];
  const fallbackPeriod = period ?? previousPeriod(now ?? new Date());

  for (const clientRow of clients ?? []) {
    try {
      results.push(await buildReport(db, clientRow.id, period, now));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("buildReport failed for", clientRow.id, error);
      results.push({
        report_id: "",
        outbox_id: "",
        period: fallbackPeriod,
        suggestions: 0,
        skipped: `failed: ${message}`,
      });
    }
  }

  return results;
}

