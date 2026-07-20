import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabaseServer";
import type { Question } from "@/lib/types";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const db = serviceClient();

  const { data: qn } = await db.from("questionnaires").select("question_set").eq("id", id).single();
  if (!qn) return NextResponse.json({ error: "not found" }, { status: 404 });

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (Array.isArray(body.addFollowUps) && body.addFollowUps.length) {
    const qs = (qn.question_set ?? []) as Question[];
    const nextRound = (qs.length ? Math.max(...qs.map(q => q.round)) : 1) + 1;
    const added: Question[] = body.addFollowUps.map((label: string, i: number) => ({
      id: `followup.${nextRound}.${i}`,
      module: "core" as const,
      label,
      type: "long" as const,
      required: false,
      critical: false,
      round: nextRound,
    }));
    update.question_set = [...qs, ...added];
    update.status = "follow_up";
  } else if (body.status) {
    update.status = body.status;
  }

  const { error } = await db.from("questionnaires").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
