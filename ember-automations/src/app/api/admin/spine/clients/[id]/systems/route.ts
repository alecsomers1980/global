import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabaseServer";
import { errorResponse, json } from "../../../_lib";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const db = serviceClient();
    const { id } = await params;
    const payload = await json<{ name?: string; kind?: string; notes?: string }>(req);

    if (!payload.name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const insert: Record<string, unknown> = { client_id: id, name: payload.name };
    if (payload.kind !== undefined) insert.kind = payload.kind;
    if (payload.notes !== undefined) insert.notes = payload.notes;

    const { data: system, error } = await db
      .from("client_systems")
      .insert(insert)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ system });
  } catch (e) {
    return errorResponse(e);
  }
}

