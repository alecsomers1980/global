import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabaseServer";
import { createOutbox } from "@/lib/spine/outbox";
import { errorResponse, json } from "../../../_lib";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const db = serviceClient();
    const { id } = await params;
    const payload = await json<{ questions?: { text: string; why?: string }[] }>(req);

    if (!payload.questions || payload.questions.length === 0) {
      return NextResponse.json(
        { error: "questions must be a non-empty array" },
        { status: 400 },
      );
    }

    const batch_id = randomUUID();
    const rowsToInsert = payload.questions.map((q) => ({
      client_id: id,
      batch_id,
      text: q.text,
      why: q.why ?? null,
      status: "draft",
    }));

    const { data: rows, error } = await db
      .from("questions")
      .insert(rowsToInsert)
      .select("*");
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const outbox = await createOutbox(db, {
      client_id: id,
      kind: "question_batch",
      ref_table: "questions",
      ref_id: batch_id,
      draft: {
        batch_id,
        question_ids: rows.map((r) => r.id),
        questions: payload.questions,
        title: "Questions from Ember",
      },
    });

    return NextResponse.json({ batch_id, questions: rows, outboxId: outbox.id });
  } catch (e) {
    return errorResponse(e);
  }
}

