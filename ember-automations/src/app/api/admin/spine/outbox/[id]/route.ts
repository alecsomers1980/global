import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabaseServer";
import { errorResponse, json } from "../../_lib";
import { decideOutbox } from "@/lib/spine/outbox";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { decision, final } = await json<{
      decision: "approved" | "edited" | "rejected";
      final?: Record<string, unknown>;
    }>(req);

    if (!["approved", "edited", "rejected"].includes(decision)) {
      return NextResponse.json({ error: "invalid decision" }, { status: 400 });
    }

    const db = serviceClient();
    const result = await decideOutbox(db, id, decision, final);

    return NextResponse.json({
      row: result.row,
      link: result.link,
      emailed: result.emailed,
    });
  } catch (e) {
    return errorResponse(e);
  }
}

