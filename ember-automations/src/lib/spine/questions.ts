import type { SupabaseClient } from "@supabase/supabase-js";

export interface Answer { question_id: string; answer: string }

export function cleanAnswers(input: unknown): Answer[] {
  if (!Array.isArray(input)) return [];
  const byId = new Map<string, string>();
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const { question_id, answer } = item as { question_id?: unknown; answer?: unknown };
    if (typeof question_id !== "string" || typeof answer !== "string") continue;
    const text = answer.trim();
    if (question_id === "" || text === "") continue;
    byId.set(question_id, text);
  }
  return [...byId].map(([question_id, answer]) => ({ question_id, answer }));
}

export async function answerQuestions(
  db: SupabaseClient,
  clientId: string,
  answers: Answer[],
  via: "mcp" | "link",
  batchId?: string,
): Promise<{ answered: number; retriageId: string | null }> {
  const now = new Date().toISOString();
  for (const a of answers) {
    let q = db.from("questions")
      .update({ answer: a.answer, status: "answered", answered_via: via, answered_at: now })
      .eq("id", a.question_id)
      .eq("client_id", clientId);
    if (batchId) q = q.eq("batch_id", batchId);
    const { error } = await q;
    if (error) throw new Error(error.message);
  }

  const { data, error } = await db.from("requests")
    .select("id")
    .eq("client_id", clientId)
    .eq("status", "needs_info")
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) throw new Error(error.message);

  return { answered: answers.length, retriageId: (data?.[0]?.id as string | undefined) ?? null };
}

