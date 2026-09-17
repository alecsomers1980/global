import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabaseServer";
import { resolveLink } from "@/lib/spine/links";
import { transition } from "@/lib/spine/requests";
import { StaleWriteError } from "@/lib/spine/types";
import { triageAndQueue } from "@/lib/spine/triageRun";
import { answerQuestions, cleanAnswers } from "@/lib/spine/questions";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const db = serviceClient();

    const link = await resolveLink(db, token);
    if (!link) return NextResponse.json({ error: "not found" }, { status: 404 });

    const body = (await request.json().catch(() => ({}))) as {
      action?: string;
      updated_at?: string;
      reason?: string;
      answers?: { question_id: string; answer: string }[];
    };

    const { action, updated_at, reason, answers } = body;

    if (action === "approve" || action === "decline") {
      if (link.kind !== "request" && link.kind !== "estimate") {
        return NextResponse.json({ error: "invalid action" }, { status: 400 });
      }

      const to = action === "approve" ? "client_approved" : "declined";

      try {
        const request = await transition(db, link.ref_id, to, "client", {
          ...(updated_at ? { expectedUpdatedAt: updated_at } : {}),
          payload: reason ? { reason } : {},
        });

        return NextResponse.json({ request });
      } catch (error) {
        if (error instanceof StaleWriteError) {
          return NextResponse.json({ error: "stale", current: error.current }, { status: 409 });
        }

        if (error instanceof Error && error.message.startsWith("cannot move")) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }

        throw error;
      }
    }

    if (action === "answer") {
      if (link.kind !== "question_batch") {
        return NextResponse.json({ error: "invalid action" }, { status: 400 });
      }

      const cleaned = cleanAnswers(answers);
      if (cleaned.length === 0) {
        return NextResponse.json({ error: "answers must not be empty" }, { status: 400 });
      }

      const { answered, retriageId } = await answerQuestions(db, link.client_id, cleaned, "link", link.ref_id);
      if (retriageId) {
        void triageAndQueue(db, retriageId).catch((e) => console.error("retriage failed:", e));
      }

      return NextResponse.json({ ok: true, answered });
    }

    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

