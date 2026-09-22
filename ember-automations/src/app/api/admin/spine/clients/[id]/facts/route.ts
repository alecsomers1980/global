import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabaseServer";
import { proposeFacts, setFactStatus } from "@/lib/spine/record";
import { errorResponse, json } from "../../../_lib";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const db = serviceClient();
    const { id } = await params;
    const payload = await json<{ statement?: string }>(req);

    if (!payload.statement) {
      return NextResponse.json({ error: "statement is required" }, { status: 400 });
    }

    const facts = await proposeFacts(db, id, [payload.statement], "alec", null);
    await setFactStatus(db, facts[0].id, "confirmed");

    return NextResponse.json({ fact: { ...facts[0], status: "confirmed" } });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const db = serviceClient();
    const payload = await json<{ fact_id?: string; status?: string }>(req);

    if (
      !payload.fact_id ||
      (payload.status !== "confirmed" && payload.status !== "rejected")
    ) {
      return NextResponse.json({ error: "invalid input" }, { status: 400 });
    }

    await setFactStatus(db, payload.fact_id, payload.status);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}

