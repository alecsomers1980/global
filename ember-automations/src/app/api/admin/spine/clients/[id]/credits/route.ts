import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabaseServer";
import { periodOf } from "@/lib/spine/plan";
import { errorResponse, json } from "../../../_lib";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const db = serviceClient();
    const { id } = await params;
    const payload = await json<{ delta?: number; note?: string }>(req);

    if (
      typeof payload.delta !== "number" ||
      !Number.isInteger(payload.delta) ||
      payload.delta === 0
    ) {
      return NextResponse.json(
        { error: "delta must be a non-zero finite integer" },
        { status: 400 },
      );
    }

    const insert = {
      client_id: id,
      delta: payload.delta,
      reason: "adjustment",
      period: periodOf(new Date()),
      note: payload.note ?? null,
    };

    const { data: row, error } = await db
      .from("credits_ledger")
      .insert(insert)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ row });
  } catch (e) {
    return errorResponse(e);
  }
}

